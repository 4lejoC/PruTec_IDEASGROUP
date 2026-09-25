import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { aFechaIso, deFechaIso } from '../../../shared/fechas.util';
import { RangoFechasErrorMatcher, rangoFechasValidator } from '../../../shared/rango-fechas.validator';
import {
  ESTADOS_PROYECTO,
  ESTADO_PROYECTO_UI,
  EstadoProyecto,
  Proyecto,
  ProyectoGuardar
} from '../../proyecto.model';

export interface ProyectoFormularioDatos {
  /** Si viene un proyecto, el formulario se abre en modo edición. */
  proyecto?: Proyecto;
}

/**
 * Formulario de proyecto (crear / editar) en un diálogo.
 * Solo valida y devuelve los datos: no llama a la API. Quien lo abre decide qué hacer
 * con el resultado (separación entre presentación y acceso a datos).
 */
@Component({
  selector: 'app-proyecto-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './proyecto-formulario.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProyectoFormularioComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProyectoFormularioComponent, ProyectoGuardar>);
  private readonly datos = inject<ProyectoFormularioDatos | null>(MAT_DIALOG_DATA, { optional: true });

  readonly esEdicion = !!this.datos?.proyecto;
  readonly estados = ESTADOS_PROYECTO;
  readonly estadoUi = ESTADO_PROYECTO_UI;
  readonly errorFechas = new RangoFechasErrorMatcher();

  readonly maxNombre = 150;
  readonly maxDescripcion = 1000;

  readonly formulario = this.fb.group(
    {
      // pattern(/\S/): rechaza un nombre formado solo por espacios.
      nombre: ['', [Validators.required, Validators.maxLength(this.maxNombre), Validators.pattern(/\S/)]],
      descripcion: ['', [Validators.maxLength(this.maxDescripcion)]],
      fechaInicio: this.fb.control<Date | null>(null, Validators.required),
      fechaFinPrevista: this.fb.control<Date | null>(null, Validators.required),
      estado: this.fb.control<EstadoProyecto>('Planificado', Validators.required)
    },
    { validators: rangoFechasValidator('fechaInicio', 'fechaFinPrevista') }
  );

  constructor() {
    const proyecto = this.datos?.proyecto;
    if (proyecto) {
      this.formulario.setValue({
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion ?? '',
        fechaInicio: deFechaIso(proyecto.fechaInicio),
        fechaFinPrevista: deFechaIso(proyecto.fechaFinPrevista),
        estado: proyecto.estado
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
      nombre: valor.nombre.trim(),
      descripcion: valor.descripcion.trim() || null,
      fechaInicio: aFechaIso(valor.fechaInicio!),
      fechaFinPrevista: aFechaIso(valor.fechaFinPrevista!),
      estado: valor.estado
    });
  }
}
