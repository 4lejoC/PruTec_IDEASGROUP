import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TemaService } from './shared/tema.service';

/**
 * Shell de la aplicación: fondo, barra superior de vidrio (marca y botón de
 * modo oscuro) y el área donde el router muestra cada página.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly titulo = 'Gestión de Tareas';
  readonly temaService = inject(TemaService);
}
