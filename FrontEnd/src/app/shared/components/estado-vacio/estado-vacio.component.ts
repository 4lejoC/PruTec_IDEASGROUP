import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Mensaje para listados sin resultados.
 * El botón de acción (opcional) se proyecta como contenido:
 * <app-estado-vacio icono="checklist" titulo="..." texto="..."><button ...>Crear</button></app-estado-vacio>
 */
@Component({
  selector: 'app-estado-vacio',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './estado-vacio.component.html',
  styleUrl: './estado-vacio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstadoVacioComponent {
  @Input() icono = 'inbox';
  @Input({ required: true }) titulo!: string;
  @Input() texto = '';
}
