import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  /** true para acciones destructivas (eliminar): botón en color de advertencia. */
  peligro?: boolean;
}

/** Diálogo genérico de confirmación. Se cierra con true (confirmar) o false/undefined. */
@Component({
  selector: 'app-dialogo-confirmacion',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './dialogo-confirmacion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogoConfirmacionComponent {
  readonly datos = inject<DatosConfirmacion>(MAT_DIALOG_DATA);
}
