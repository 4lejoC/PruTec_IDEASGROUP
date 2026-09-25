import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Página del listado de proyectos.
 * Por ahora contiene la cabecera; la tabla, filtros y acciones se agregan a continuación.
 */
@Component({
  selector: 'app-proyectos-lista',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './proyectos-lista.component.html',
  styleUrl: './proyectos-lista.component.scss'
})
export class ProyectosListaComponent {}
