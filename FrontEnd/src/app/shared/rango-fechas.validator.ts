import { AbstractControl, FormControl, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { soloDia } from './fechas.util';

/**
 * Validador de grupo: la fecha de fin no puede ser anterior a la de inicio.
 * Replica en el frontend la regla del backend (ck_proyecto_fechas / ProyectoService)
 * para avisar al usuario antes de enviar.
 * Si alguna fecha falta, no opina (de eso se encarga Validators.required).
 */
export function rangoFechasValidator(campoInicio: string, campoFin: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const inicio = grupo.get(campoInicio)?.value as Date | null;
    const fin = grupo.get(campoFin)?.value as Date | null;

    if (!(inicio instanceof Date) || !(fin instanceof Date)) {
      return null;
    }

    return soloDia(fin) < soloDia(inicio) ? { rangoFechas: true } : null;
  };
}

/**
 * El error de rango está en el grupo, no en el campo. Este matcher hace que el
 * campo "fecha de fin" se pinte en rojo y muestre su <mat-error> cuando el grupo
 * tiene ese error.
 */
export class RangoFechasErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const tocado = !!control && (control.touched || !!form?.submitted);
    const invalidoPropio = !!control?.invalid;
    const rangoInvalido = !!form?.form.hasError('rangoFechas');
    return tocado && (invalidoPropio || rangoInvalido);
  }
}
