import { Component, Input, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, Location } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs';

import { BadgeComponent, BadgeInfo } from '../../../shared/components/badge/badge.component';
import { EstadoVacioComponent } from '../../../shared/components/estado-vacio/estado-vacio.component';
import { ConfirmacionService } from '../../../shared/confirmacion.service';
import { NotificacionService } from '../../../shared/notificacion.service';
import { PagedResult } from '../../../shared/paged-result.model';
import { PROYECTOS_MOCK } from '../../../proyectos/proyectos.mock';
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
  TareaGuardar
} from '../../tarea.model';
import { TAREAS_MOCK } from '../../tareas.mock';
import {
  TareaFormularioComponent,
  TareaFormularioDatos
} from '../../components/tarea-formulario/tarea-formulario.component';

/**
 * Tareas de un proyecto (/proyectos/:proyectoId/tareas): búsqueda por texto,
 * filtros por estado y prioridad, tabla paginada y acciones (editar, eliminar).
 *
 * TEMPORAL (tarea 4): trabaja con datos de ejemplo. Filtros y paginación se simulan
 * aquí con la misma forma de respuesta que la API (PagedResult) y los mismos
 * parámetros (texto, estado, prioridad, page, pageSize); en la tarea 6 se reemplaza
 * el origen de los datos por TareaService.listarPorProyecto().
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
    MatTableModule,
    MatTooltipModule,
    BadgeComponent,
    EstadoVacioComponent
  ],
  templateUrl: './tareas-lista.component.html',
  styleUrl: './tareas-lista.component.scss'
})
export class TareasListaComponent {
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
  }

  private readonly idProyecto = signal(0);
  private readonly tareas = signal<Tarea[]>([...TAREAS_MOCK]);

  /** TEMPORAL: al conectar la API se obtendrá con ProyectoService.obtenerPorId(). */
  readonly proyecto = computed(() => PROYECTOS_MOCK.find(p => p.id === this.idProyecto()) ?? null);

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

  /** Todas las tareas del proyecto (sin filtros). */
  private readonly tareasDelProyecto = computed(() =>
    this.tareas().filter(t => t.proyectoId === this.idProyecto())
  );

  readonly proyectoTieneTareas = computed(() => this.tareasDelProyecto().length > 0);

  /** Resultado con la misma forma que devuelve GET /api/proyectos/{id}/tareas. */
  readonly resultado = computed<PagedResult<Tarea>>(() => {
    const texto = this.texto().toLowerCase();
    const estado = this.estado();
    const prioridad = this.prioridad();

    const filtradas = this.tareasDelProyecto()
      .filter(t =>
        !texto ||
        t.titulo.toLowerCase().includes(texto) ||
        (t.descripcion ?? '').toLowerCase().includes(texto))
      .filter(t => !estado || t.estado === estado)
      .filter(t => !prioridad || t.prioridad === prioridad)
      // Igual que el backend: más recientes primero.
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion) || b.id - a.id);

    const tamanio = this.tamanioPagina();
    const totalPaginas = Math.ceil(filtradas.length / tamanio);
    // Si la página guardada ya no existe (ej. se eliminaron tareas), se usa la última.
    const pagina = Math.min(this.pagina(), Math.max(0, totalPaginas - 1));
    const inicio = pagina * tamanio;
    return {
      items: filtradas.slice(inicio, inicio + tamanio),
      page: pagina + 1,
      pageSize: tamanio,
      totalCount: filtradas.length,
      totalPages: totalPaginas
    };
  });

  constructor() {
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

  // ----- Acciones
  crear(): void {
    this.abrirFormulario().subscribe(datos => {
      if (!datos) return;
      const nueva: Tarea = {
        ...datos,
        id: Math.max(0, ...TAREAS_MOCK.map(t => t.id)) + 1,
        proyectoId: this.idProyecto(),
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: null
      };
      TAREAS_MOCK.push(nueva); // TEMPORAL: mantiene coherente la regla de eliminar proyectos
      this.tareas.set([...TAREAS_MOCK]);
      this.notificacion.exito(`Tarea "${nueva.titulo}" creada.`);
    });
  }

  editar(tarea: Tarea): void {
    this.abrirFormulario(tarea).subscribe(datos => {
      if (!datos) return;
      const indice = TAREAS_MOCK.findIndex(t => t.id === tarea.id);
      TAREAS_MOCK[indice] = { ...tarea, ...datos, fechaActualizacion: new Date().toISOString() };
      this.tareas.set([...TAREAS_MOCK]);
      this.notificacion.exito(`Tarea "${datos.titulo}" actualizada.`);
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
      .subscribe(confirmado => {
        if (!confirmado) return;
        TAREAS_MOCK.splice(TAREAS_MOCK.findIndex(t => t.id === tarea.id), 1);
        this.tareas.set([...TAREAS_MOCK]);
        this.pagina.set(this.resultado().page - 1);
        this.notificacion.exito(`Tarea "${tarea.titulo}" eliminada.`);
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
