import { Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
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
import { mensajeDeError } from '../../../shared/api-error.model';
import { ConfirmacionService } from '../../../shared/confirmacion.service';
import { NotificacionService } from '../../../shared/notificacion.service';
import { PagedResult } from '../../../shared/paged-result.model';
import { armarQueryParams, leerPagina, leerTamanio } from '../../../shared/url-estado.util';
import { ProyectosListadoStore } from '../../proyectos-listado.store';
import { ProyectoService } from '../../proyecto.service';
import { ESTADO_PROYECTO_UI, EstadoProyecto, Proyecto, ProyectoFiltro, ProyectoGuardar } from '../../proyecto.model';
import {
  ProyectoFormularioComponent,
  ProyectoFormularioDatos
} from '../../components/proyecto-formulario/proyecto-formulario.component';

/**
 * Listado de proyectos: búsqueda por nombre, tabla con paginación en el servidor
 * y acciones (ver tareas, crear, editar, eliminar) contra la API.
 *
 * Flujo de datos:
 *   filtros y página (signals) → consulta (computed) → GET /api/proyectos → resultado (signal)
 * Cada cambio en la consulta hace una petición nueva; switchMap cancela la anterior
 * si todavía no respondió, así nunca se muestra una respuesta vieja.
 */
@Component({
  selector: 'app-proyectos-lista',
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
  templateUrl: './proyectos-lista.component.html',
  styleUrl: './proyectos-lista.component.scss'
})
export class ProyectosListaComponent {
  private readonly servicio = inject(ProyectoService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(ProyectosListadoStore);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);

  readonly columnas = ['nombre', 'fechas', 'estado', 'acciones'];
  readonly opcionesTamanio = [5, 10, 20];
  private readonly tamanioPorDefecto = 5;

  /** Estado inicial tomado de la URL (?nombre=&page=&pageSize=): permite volver, recargar y compartir. */
  private readonly parametrosIniciales = this.route.snapshot.queryParamMap;
  private readonly nombreInicial = this.parametrosIniciales.get('nombre')?.trim() ?? '';

  // ----- Filtros y paginación (signals)
  readonly pagina = signal(leerPagina(this.parametrosIniciales)); // índice base 0 (paginador de Material)
  readonly tamanioPagina = signal(leerTamanio(this.parametrosIniciales, this.opcionesTamanio, this.tamanioPorDefecto));

  /** Campo de búsqueda. Espera 300 ms sin escribir antes de consultar (debounce). */
  readonly busqueda = new FormControl(this.nombreInicial, { nonNullable: true });
  readonly filtroNombre = toSignal(
    this.busqueda.valueChanges.pipe(
      debounceTime(300),
      map(texto => texto.trim()),
      distinctUntilChanged(),
      tap(() => this.pagina.set(0)) // un filtro nuevo siempre vuelve a la primera página
    ),
    { initialValue: this.nombreInicial }
  );

  /** Se incrementa para volver a pedir la misma página (tras guardar, eliminar o reintentar). */
  private readonly recarga = signal(0);

  /** Parámetros de GET /api/proyectos. La API numera las páginas desde 1. */
  private readonly consulta = computed<ProyectoFiltro>(() => {
    this.recarga();
    return {
      nombre: this.filtroNombre(),
      page: this.pagina() + 1,
      pageSize: this.tamanioPagina()
    };
  });

  // ----- Respuesta de la API
  /** Última respuesta recibida. `null` solo antes de la primera carga. */
  readonly resultado = signal<PagedResult<Proyecto> | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  private readonly solicitudes = new Subject<ProyectoFiltro>();

  constructor() {
    this.solicitudes
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap(consulta =>
          this.servicio.listar(consulta).pipe(
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

        // La página pedida ya no existe (ej. se eliminó el último proyecto de la última página):
        // se pide la última página disponible.
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

    // Cada cambio de filtro o paginación se refleja en la URL y se guarda en el store.
    // Se usa Location.replaceState (no router.navigate) para no disparar una navegación
    // ni la animación de página en cada tecla, y para no llenar el historial.
    effect(() => {
      const queryParams = armarQueryParams({
        nombre: this.filtroNombre(),
        page: this.pagina() > 0 ? this.pagina() + 1 : null,
        pageSize: this.tamanioPagina() !== this.tamanioPorDefecto ? this.tamanioPagina() : null
      });
      this.store.queryParams.set(queryParams);
      const url = this.router.createUrlTree([], { relativeTo: this.route, queryParams }).toString();
      this.location.replaceState(url);
    }, { allowSignalWrites: true });
  }

  /**
   * Texto y color del estado. Se usa un método tipado porque dentro de la tabla
   * (matCellDef) la fila llega como `any` y el compilador estricto no permite
   * indexar el mapa con un valor sin tipo.
   */
  infoEstado(estado: EstadoProyecto): BadgeInfo {
    return ESTADO_PROYECTO_UI[estado];
  }

  /** Identidad de cada fila: Angular reutiliza las filas existentes al actualizar la lista. */
  readonly trackById = (_: number, proyecto: Proyecto) => proyecto.id;

  recargar(): void {
    this.recarga.update(n => n + 1);
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanioPagina.set(evento.pageSize);
  }

  limpiarBusqueda(): void {
    this.busqueda.setValue('');
  }

  verTareas(proyecto: Proyecto): void {
    this.router.navigate(['/proyectos', proyecto.id, 'tareas']);
  }

  /** Enter sobre la fila (no sobre sus botones) abre las tareas: navegación con teclado. */
  alPresionarEnter(evento: Event, proyecto: Proyecto): void {
    if (evento.target === evento.currentTarget) {
      this.verTareas(proyecto);
    }
  }

  // ----- Acciones. Tras cada operación correcta se vuelve a pedir la página actual,
  // así la tabla muestra el orden, el total y la paginación que calcula el servidor.
  crear(): void {
    this.abrirFormulario()
      .pipe(
        filter((datos): datos is ProyectoGuardar => !!datos),
        switchMap(datos => this.servicio.crear(datos)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: creado => {
          this.notificacion.exito(`Proyecto "${creado.nombre}" creado.`);
          this.recargar();
        },
        error: error => this.notificacion.error(mensajeDeError(error))
      });
  }

  editar(proyecto: Proyecto): void {
    this.abrirFormulario(proyecto)
      .pipe(
        filter((datos): datos is ProyectoGuardar => !!datos),
        switchMap(datos => this.servicio.actualizar(proyecto.id, datos)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: actualizado => {
          this.notificacion.exito(`Proyecto "${actualizado.nombre}" actualizado.`);
          this.recargar();
        },
        error: error => this.notificacion.error(mensajeDeError(error))
      });
  }

  eliminar(proyecto: Proyecto): void {
    this.confirmacion
      .confirmar({
        titulo: 'Eliminar proyecto',
        mensaje: `¿Eliminar "${proyecto.nombre}"? Esta acción no se puede deshacer.`,
        textoConfirmar: 'Eliminar',
        peligro: true
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.servicio.eliminar(proyecto.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificacion.exito(`Proyecto "${proyecto.nombre}" eliminado.`);
          this.recargar();
        },
        // Si el proyecto tiene tareas, la API responde 409 y su mensaje se muestra tal cual.
        error: error => this.notificacion.error(mensajeDeError(error))
      });
  }

  private abrirFormulario(proyecto?: Proyecto) {
    return this.dialog
      .open<ProyectoFormularioComponent, ProyectoFormularioDatos, ProyectoGuardar>(
        ProyectoFormularioComponent,
        { data: { proyecto }, width: '560px', maxWidth: '95vw' }
      )
      .afterClosed();
  }
}
