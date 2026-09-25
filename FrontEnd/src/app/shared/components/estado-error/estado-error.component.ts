import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Panel de error con el mensaje de la API y un botón para reintentar. */
@Component({
  selector: 'app-estado-error',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './estado-error.component.html',
  styleUrl: './estado-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstadoErrorComponent {
  @Input({ required: true }) mensaje!: string;
  @Output() reintentar = new EventEmitter<void>();
}
