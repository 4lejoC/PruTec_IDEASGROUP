import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Mensajes breves (snackbar) de éxito y error, con el estilo glass definido
 * en el tema (clases snackbar-exito / snackbar-error).
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly snackBar = inject(MatSnackBar);

  exito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3500, panelClass: 'snackbar-exito' });
  }

  error(mensaje: string): void {
    // Los errores permanecen más tiempo para que se alcancen a leer.
    this.snackBar.open(mensaje, 'Cerrar', { duration: 6000, panelClass: 'snackbar-error' });
  }
}
