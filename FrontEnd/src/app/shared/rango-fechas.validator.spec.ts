import { FormControl, FormGroup } from '@angular/forms';
import { rangoFechasValidator } from './rango-fechas.validator';

/**
 * El validador replica la regla del backend: la fecha de fin prevista
 * no puede ser anterior a la fecha de inicio.
 */
describe('rangoFechasValidator', () => {
  function crearGrupo(inicio: Date | null, fin: Date | null): FormGroup {
    return new FormGroup(
      {
        fechaInicio: new FormControl<Date | null>(inicio),
        fechaFinPrevista: new FormControl<Date | null>(fin)
      },
      { validators: rangoFechasValidator('fechaInicio', 'fechaFinPrevista') }
    );
  }

  it('marca error cuando la fecha de fin es anterior a la de inicio', () => {
    const grupo = crearGrupo(new Date(2026, 9, 10), new Date(2026, 9, 9));

    expect(grupo.hasError('rangoFechas')).toBeTrue();
  });

  it('acepta que inicio y fin sean el mismo día, aunque tengan distinta hora', () => {
    const grupo = crearGrupo(new Date(2026, 9, 10, 18, 30), new Date(2026, 9, 10, 8, 0));

    expect(grupo.hasError('rangoFechas')).toBeFalse();
  });

  it('no opina si falta alguna fecha (de eso se encarga Validators.required)', () => {
    const grupo = crearGrupo(new Date(2026, 9, 10), null);

    expect(grupo.errors).toBeNull();
  });
});
