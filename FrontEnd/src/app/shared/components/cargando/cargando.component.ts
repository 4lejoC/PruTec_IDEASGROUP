import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Estado de carga con "esqueletos": filas grises con un brillo que las recorre,
 * con la forma aproximada del contenido que va a aparecer.
 */
@Component({
  selector: 'app-cargando',
  standalone: true,
  templateUrl: './cargando.component.html',
  styleUrl: './cargando.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CargandoComponent {
  /** Cantidad de filas de esqueleto a mostrar. */
  @Input() set filas(valor: number) {
    this.indices = Array.from({ length: Math.max(1, valor) }, (_, i) => i);
  }

  indices = [0, 1, 2, 3, 4];
}
