import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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

export interface TareaFormularioDatos {
  /** Si viene una tarea, el formulario se abre en modo edición. */
  tarea?: Tarea;
}

/**
 * Formulario de tarea (crear / editar) en un diálogo.
 * Solo valida y devuelve los datos; no llama a la API.
 */
@Component({
  selector: 'app-tarea-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './tarea-formulario.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TareaFormularioComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TareaFormularioComponent, TareaGuardar>);
  private readonly datos = inject<TareaFormularioDatos | null>(MAT_DIALOG_DATA, { optional: true });

  readonly esEdicion = !!this.datos?.tarea;
  readonly estados = ESTADOS_TAREA;
  readonly estadoUi = ESTADO_TAREA_UI;
  readonly prioridades = PRIORIDADES_TAREA;
  readonly prioridadUi = PRIORIDAD_TAREA_UI;

  readonly maxTitulo = 200;
  readonly maxDescripcion = 1024;

  readonly formulario = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(this.maxTitulo), Validators.pattern(/\S/)]],
    descripcion: ['', [Validators.maxLength(this.maxDescripcion)]],
    estado: this.fb.control<EstadoTarea>('Pendiente', Validators.required),
    prioridad: this.fb.control<PrioridadTarea>('Media', Validators.required)
  });

  constructor() {
    const tarea = this.datos?.tarea;
    if (tarea) {
      this.formulario.setValue({
        titulo: tarea.titulo,
        descripcion: tarea.descripcion ?? '',
        estado: tarea.estado,
        prioridad: tarea.prioridad
      });
    }
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valor = this.formulario.getRawValue();
    this.dialogRef.close({
      titulo: valor.titulo.trim(),
      descripcion: valor.descripcion.trim() || null,
      estado: valor.estado,
      prioridad: valor.prioridad
    });
  }
}
