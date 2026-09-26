import { Component, DestroyRef, Input, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, Location } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, catchError, debounceTime, distinctUntilChanged, filter, map, of, switchMap, tap } from 'rxjs';

import { BadgeComponent, BadgeInfo } from '../../../shared/components/badge/badge.component';
import { CargandoComponent } from '../../../shared/components/cargando/cargando.component';
import { EstadoErrorComponent } from '../../../shared/components/estado-error/estado-error.component';
import { EstadoVacioComponent } from '../../../shared/components/estado-vacio/estado-vacio.component';
import { ApiError, mensajeDeError } from '../../../shared/api-error.model';
import { ConfirmacionService } from '../../../shared/confirmacion.service';
import { NotificacionService } from '../../../shared/notificacion.service';
import { PagedResult } from '../../../shared/paged-result.model';
import { Proyecto } from '../../../proyectos/proyecto.model';
import { ProyectoService } from '../../../proyectos/proyecto.service';
import { ProyectosListadoStore } from '../../../proyectos/proyectos-listado.store';
import { armarQueryParams, leerOpcion, leerPagina, leerTamanio } from '../../../shared/url-estado.util';
import {
  ESTADOS_TAREA,
  ESTADO_TAREA_UI,
  EstadoTarea,
  PRIORIDADES_TAREA,
  PRIORIDAD_TAREA_UI,
  PrioridadTarea,
  Tarea,
  TareaFiltro,
  TareaGuardar
} from '../../tarea.model';
import { TareaService } from '../../tarea.service';
import {
  TareaFormularioComponent,
  TareaFormularioDatos
} from '../../components/tarea-formulario/tarea-formulario.component';

/**
 * Tareas de un proyecto (/proyectos/:proyectoId/tareas): búsqueda por texto,
 * filtros por estado y prioridad, tabla paginada y acciones (editar, eliminar).
 *
 * Se hacen dos consultas independientes:
 *   - GET /api/proyectos/{id}: nombre del proyecto para las migas (404 → "no encontrado").
 *   - GET /api/proyectos/{id}/tareas: filtros y paginación en el servidor, con el mismo
 *     flujo que ProyectosListaComponent (consulta → switchMap → resultado).
 */
@Component({
  selector: 'app-tareas-lista',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
    BadgeComponent,
    CargandoComponent,
    EstadoErrorComponent,
    EstadoVacioComponent
  ],
  templateUrl: './tareas-lista.component.html',
  styleUrl: './tareas-lista.component.scss'
})
export class TareasListaComponent {
  private readonly servicio = inject(TareaService);
  private readonly proyectoService = inject(ProyectoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);

  /** Filtros del listado de proyectos: "volver" y las migas regresan al mismo punto. */
  readonly filtrosProyectos = inject(ProyectosListadoStore).queryParams;

  readonly columnas = ['titulo', 'estado', 'prioridad', 'creada', 'acciones'];
  readonly opcionesTamanio = [5, 10, 20];
  private readonly tamanioPorDefecto = 5;
  readonly estados = ESTADOS_TAREA;
  readonly prioridades = PRIORIDADES_TAREA;

  /** Estado inicial tomado de la URL (?texto=&estado=&prioridad=&page=&pageSize=). */
  private readonly parametrosIniciales = this.route.snapshot.queryParamMap;
  private readonly textoInicial = this.parametrosIniciales.get('texto')?.trim() ?? '';

  /** Código del proyecto, tomado de la ruta gracias a withComponentInputBinding(). */
  @Input() set proyectoId(valor: string) {
    this.idProyecto.set(Number(valor));
    this.cargarProyecto();
  }

  private readonly idProyecto = signal(0);

  // ----- Proyecto (cabecera y migas)
  readonly proyecto = signal<Proyecto | null>(null);
  /** 'cargando' | 'listo' | 'no-encontrado' (404) | 'error' (cualquier otro fallo). */
  readonly estadoProyecto = signal<'cargando' | 'listo' | 'no-encontrado' | 'error'>('cargando');
  readonly errorProyecto = signal<string | null>(null);

  // ----- Filtros y paginación
  readonly busqueda = new FormControl(this.textoInicial, { nonNullable: true });
  readonly texto = toSignal(
    this.busqueda.valueChanges.pipe(
      debounceTime(300),
      map(valor => valor.trim()),
      distinctUntilChanged(),
      tap(() => this.pagina.set(0))
    ),
    { initialValue: this.textoInicial }
  );
  readonly estado = signal(leerOpcion(this.parametrosIniciales, 'estado', ESTADOS_TAREA));
  readonly prioridad = signal(leerOpcion(this.parametrosIniciales, 'prioridad', PRIORIDADES_TAREA));
  readonly pagina = signal(leerPagina(this.parametrosIniciales));
  readonly tamanioPagina = signal(leerTamanio(this.parametrosIniciales, this.opcionesTamanio, this.tamanioPorDefecto));

  readonly hayFiltros = computed(() => !!this.texto() || !!this.estado() || !!this.prioridad());


  /** Se incrementa para volver a pedir la misma página (tras guardar, eliminar o reintentar). */
  private readonly recarga = signal(0);

  /** Parámetros de GET /api/proyectos/{id}/tareas. La API numera las páginas desde 1. */
  private readonly consulta = computed<{ proyectoId: number; filtro: TareaFiltro }>(() => {
    this.recarga();
    return {
      proyectoId: this.idProyecto(),
      filtro: {
        texto: this.texto(),
        estado: this.estado(),
        prioridad: this.prioridad(),
        page: this.pagina() + 1,
        pageSize: this.tamanioPagina()
      }
    };
  });

  // ----- Respuesta de la API
  /** Última respuesta recibida. `null` solo antes de la primera carga. */
  readonly resultado = signal<PagedResult<Tarea> | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  private readonly solicitudes = new Subject<{ proyectoId: number; filtro: TareaFiltro }>();

  constructor() {
    this.solicitudes
      .pipe(
        filter(consulta => consulta.proyectoId > 0), // aún no llega el parámetro de la ruta
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap(({ proyectoId, filtro }) =>
          this.servicio.listarPorProyecto(proyectoId, filtro).pipe(
            catchError(error => {
              this.error.set(mensajeDeError(error));
              return of(null);
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe(respuesta => {
        this.cargando.set(false);
        if (!respuesta) return;

        // La página pedida ya no existe (ej. se eliminó la última tarea de la última página).
        if (respuesta.items.length === 0 && respuesta.totalPages > 0 && respuesta.page > respuesta.totalPages) {
          this.pagina.set(respuesta.totalPages - 1);
          return;
        }
        this.resultado.set(respuesta);
      });

    // Cada cambio en la consulta dispara una petición.
    effect(() => {
      const consulta = this.consulta();
      untracked(() => this.solicitudes.next(consulta));
    }, { allowSignalWrites: true });

    // Filtros y paginación se reflejan en la URL (sin navegar ni animar, ver ProyectosListaComponent).
    effect(() => {
      const queryParams = armarQueryParams({
        texto: this.texto(),
        estado: this.estado(),
        prioridad: this.prioridad(),
        page: this.pagina() > 0 ? this.pagina() + 1 : null,
        pageSize: this.tamanioPagina() !== this.tamanioPorDefecto ? this.tamanioPagina() : null
      });
      const url = this.router.createUrlTree([], { relativeTo: this.route, queryParams }).toString();
      this.location.replaceState(url);
    });
  }

  readonly trackById = (_: number, tarea: Tarea) => tarea.id;

  // ----- Etiquetas (métodos tipados: dentro de la tabla la fila llega como `any`)
  infoEstado(estado: EstadoTarea): BadgeInfo {
    return ESTADO_TAREA_UI[estado];
  }

  infoPrioridad(prioridad: PrioridadTarea): BadgeInfo {
    return PRIORIDAD_TAREA_UI[prioridad];
  }

  /** Reintento desde el panel de error: vuelve a pedir el proyecto y sus tareas. */
  recargar(): void {
    if (this.estadoProyecto() === 'error') {
      this.cargarProyecto();
    }
    this.recarga.update(n => n + 1);
  }

  private cargarProyecto(): void {
    this.estadoProyecto.set('cargando');
    this.errorProyecto.set(null);
    this.proyectoService
      .obtenerPorId(this.idProyecto())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: proyecto => {
          this.proyecto.set(proyecto);
          this.estadoProyecto.set('listo');
        },
        error: error => {
          this.proyecto.set(null);
          if (error instanceof ApiError && error.status === 404) {
            this.estadoProyecto.set('no-encontrado');
          } else {
            this.estadoProyecto.set('error');
            this.errorProyecto.set(mensajeDeError(error));
          }
        }
      });
  }

  // ----- Filtros
  /** Pulsar el filtro activo lo desactiva (vuelve a "Todos"). */
  alternarEstado(valor: EstadoTarea | null): void {
    this.estado.set(this.estado() === valor ? null : valor);
    this.pagina.set(0);
  }

  alternarPrioridad(valor: PrioridadTarea | null): void {
    this.prioridad.set(this.prioridad() === valor ? null : valor);
    this.pagina.set(0);
  }

  limpiarFiltros(): void {
    this.busqueda.setValue('');
    this.estado.set(null);
    this.prioridad.set(null);
    this.pagina.set(0);
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanioPagina.set(evento.pageSize);
  }

  // ----- Acciones. Tras cada operación correcta se vuelve a pedir la página actual.
  crear(): void {
    this.abrirFormulario()
      .pipe(
        filter((datos): datos is TareaGuardar => !!datos),
        switchMap(datos => this.servicio.crear(this.idProyecto(), datos)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: creada => {
          this.notificacion.exito(`Tarea "${creada.titulo}" creada.`);
          this.recarga.update(n => n + 1);
        },
        error: error => this.notificacion.error(mensajeDeError(error))
      });
  }

  editar(tarea: Tarea): void {
    this.abrirFormulario(tarea)
      .pipe(
        filter((datos): datos is TareaGuardar => !!datos),
        switchMap(datos => this.servicio.actualizar(tarea.id, datos)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: actualizada => {
          this.notificacion.exito(`Tarea "${actualizada.titulo}" actualizada.`);
          this.recarga.update(n => n + 1);
        },
        error: error => this.notificacion.error(mensajeDeError(error))
      });
  }

  eliminar(tarea: Tarea): void {
    this.confirmacion
      .confirmar({
        titulo: 'Eliminar tarea',
        mensaje: `¿Eliminar "${tarea.titulo}"? Esta acción no se puede deshacer.`,
        textoConfirmar: 'Eliminar',
        peligro: true
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.servicio.eliminar(tarea.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificacion.exito(`Tarea "${tarea.titulo}" eliminada.`);
          this.recarga.update(n => n + 1);
        },
        error: error => this.notificacion.error(mensajeDeError(error))
      });
  }

  private abrirFormulario(tarea?: Tarea) {
    return this.dialog
      .open<TareaFormularioComponent, TareaFormularioDatos, TareaGuardar>(
        TareaFormularioComponent,
        { data: { tarea }, width: '560px', maxWidth: '95vw' }
      )
      .afterClosed();
  }
}
