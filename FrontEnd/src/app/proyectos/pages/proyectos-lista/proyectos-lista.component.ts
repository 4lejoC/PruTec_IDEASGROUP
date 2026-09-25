import { Component, computed, effect, inject, signal } from '@angular/core';
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
import { armarQueryParams, leerPagina, leerTamanio } from '../../../shared/url-estado.util';
import { ProyectosListadoStore } from '../../proyectos-listado.store';
import { ESTADO_PROYECTO_UI, EstadoProyecto, Proyecto, ProyectoGuardar } from '../../proyecto.model';
import { PROYECTOS_MOCK } from '../../proyectos.mock';
import { TAREAS_MOCK } from '../../../tareas/tareas.mock';
import {
  ProyectoFormularioComponent,
  ProyectoFormularioDatos
} from '../../components/proyecto-formulario/proyecto-formulario.component';

/**
 * Listado de proyectos: búsqueda por nombre, tabla paginada y acciones
 * (ver tareas, editar, eliminar).
 *
 * TEMPORAL (tarea 3): trabaja con datos de ejemplo en memoria. La paginación y el
 * filtro se simulan aquí con la misma forma de respuesta que la API (PagedResult),
 * para que al conectar ProyectoService (tarea 6) solo cambie el origen de los datos.
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
    MatTableModule,
    MatTooltipModule,
    BadgeComponent,
    EstadoVacioComponent
  ],
  templateUrl: './proyectos-lista.component.html',
  styleUrl: './proyectos-lista.component.scss'
})
export class ProyectosListaComponent {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly store = inject(ProyectosListadoStore);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificacion = inject(NotificacionService);

  readonly columnas = ['nombre', 'fechas', 'estado', 'acciones'];
  readonly opcionesTamanio = [5, 10, 20];
  private readonly tamanioPorDefecto = 5;

  /** Estado inicial tomado de la URL (?nombre=&page=&pageSize=): permite volver, recargar y compartir. */
  private readonly parametrosIniciales = this.route.snapshot.queryParamMap;
  private readonly nombreInicial = this.parametrosIniciales.get('nombre')?.trim() ?? '';

  // ----- Estado de la pantalla (signals)
  /** TEMPORAL: se trabaja sobre el arreglo de ejemplo para que los cambios se mantengan al navegar. */
  private readonly proyectos = signal<Proyecto[]>([...PROYECTOS_MOCK]);
  readonly pagina = signal(leerPagina(this.parametrosIniciales)); // índice base 0 (paginador de Material)
  readonly tamanioPagina = signal(leerTamanio(this.parametrosIniciales, this.opcionesTamanio, this.tamanioPorDefecto));

  /** Campo de búsqueda. Espera 300 ms sin escribir antes de filtrar (debounce). */
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

  /** Resultado con la misma forma que devuelve GET /api/proyectos. */
  readonly resultado = computed<PagedResult<Proyecto>>(() => {
    const filtro = this.filtroNombre().toLowerCase();
    const filtrados = this.proyectos()
      .filter(p => p.nombre.toLowerCase().includes(filtro))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es') || a.id - b.id);

    const tamanio = this.tamanioPagina();
    const totalPaginas = Math.ceil(filtrados.length / tamanio);
    // Si la página guardada ya no existe (ej. se eliminaron proyectos), se usa la última.
    const pagina = Math.min(this.pagina(), Math.max(0, totalPaginas - 1));
    const inicio = pagina * tamanio;
    return {
      items: filtrados.slice(inicio, inicio + tamanio),
      page: pagina + 1,
      pageSize: tamanio,
      totalCount: filtrados.length,
      totalPages: totalPaginas
    };
  });

  constructor() {
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

  readonly hayProyectos = computed(() => this.proyectos().length > 0);

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

  crear(): void {
    this.abrirFormulario().subscribe(datos => {
      if (!datos) return;
      const nuevo: Proyecto = {
        ...datos,
        id: Math.max(0, ...this.proyectos().map(p => p.id)) + 1,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: null
      };
      PROYECTOS_MOCK.push(nuevo); // TEMPORAL: persiste al navegar mientras no hay API
      this.proyectos.set([...PROYECTOS_MOCK]);
      this.notificacion.exito(`Proyecto "${nuevo.nombre}" creado.`);
    });
  }

  editar(proyecto: Proyecto): void {
    this.abrirFormulario(proyecto).subscribe(datos => {
      if (!datos) return;
      const indice = PROYECTOS_MOCK.findIndex(p => p.id === proyecto.id);
      PROYECTOS_MOCK[indice] = { ...proyecto, ...datos, fechaActualizacion: new Date().toISOString() };
      this.proyectos.set([...PROYECTOS_MOCK]);
      this.notificacion.exito(`Proyecto "${datos.nombre}" actualizado.`);
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
      .subscribe(confirmado => {
        if (!confirmado) return;

        // Simula la regla del backend (HTTP 409) mientras no hay API.
        if (TAREAS_MOCK.some(t => t.proyectoId === proyecto.id)) {
          this.notificacion.error(
            'No se puede eliminar el proyecto porque tiene tareas asociadas. ' +
            'Elimine primero sus tareas o cambie el estado del proyecto a Cancelado.'
          );
          return;
        }

        PROYECTOS_MOCK.splice(PROYECTOS_MOCK.findIndex(p => p.id === proyecto.id), 1);
        this.proyectos.set([...PROYECTOS_MOCK]);
        this.ajustarPaginaTrasEliminar();
        this.notificacion.exito(`Proyecto "${proyecto.nombre}" eliminado.`);
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

  /** Si se eliminó el último elemento de la página, retrocede una página. */
  private ajustarPaginaTrasEliminar(): void {
    this.pagina.set(this.resultado().page - 1);
  }
}
