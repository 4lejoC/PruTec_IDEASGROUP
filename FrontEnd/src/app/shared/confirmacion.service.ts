import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import {
  DatosConfirmacion,
  DialogoConfirmacionComponent
} from './components/dialogo-confirmacion/dialogo-confirmacion.component';

/** Abre el diálogo de confirmación y devuelve true solo si el usuario confirma. */
@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  private readonly dialog = inject(MatDialog);

  confirmar(datos: DatosConfirmacion): Observable<boolean> {
    return this.dialog
      .open(DialogoConfirmacionComponent, { data: datos, width: '440px', maxWidth: '95vw' })
      .afterClosed()
      .pipe(map(resultado => resultado === true));
  }
}
