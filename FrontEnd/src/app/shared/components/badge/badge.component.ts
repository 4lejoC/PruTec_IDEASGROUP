import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Texto y color (token CSS, ej. 'var(--estado-en-curso)') de una etiqueta. */
export interface BadgeInfo {
  texto: string;
  color: string;
}

/**
 * Etiqueta de estado o prioridad: punto de color + texto.
 * Usa la clase global .badge del sistema de diseño.
 * Uso: <app-badge [info]="ESTADO_PROYECTO_UI[proyecto.estado]" />
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span class="badge" [style.--badge-color]="info.color">{{ info.texto }}</span>`,
  // inline-flex: permite que el host reciba animaciones (transform) de la lista escalonada.
  styles: [':host { display: inline-flex; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  @Input({ required: true }) info!: BadgeInfo;
}
