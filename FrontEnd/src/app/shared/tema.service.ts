import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Tema = 'claro' | 'oscuro';

const CLAVE_ALMACENAMIENTO = 'gestion-tareas.tema';

/** Documento con la API de View Transitions (aún no incluida en todos los tipos del DOM). */
type DocumentoConTransiciones = Document & {
  startViewTransition?: (actualizar: () => void) => { finished: Promise<void> };
};

/**
 * Maneja el modo claro / oscuro.
 * - El tema se aplica con el atributo data-tema en <html>; los estilos cambian solos
 *   porque todos los componentes usan variables CSS (tokens).
 * - Recuerda la elección del usuario (localStorage); si no eligió nada,
 *   respeta la preferencia del sistema operativo.
 * - El cambio se anima con un círculo que crece desde el botón (View Transitions API),
 *   con respaldo sin animación en navegadores que no la soportan.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly documento = inject(DOCUMENT) as DocumentoConTransiciones;

  /** Tema actual (signal: los componentes se actualizan solos al cambiar). */
  readonly tema = signal<Tema>(this.leerTemaInicial());

  constructor() {
    this.aplicar(this.tema());
  }

  /** Alterna entre claro y oscuro. Si recibe el clic, la animación nace desde ese punto. */
  alternar(evento?: MouseEvent): void {
    const siguiente: Tema = this.tema() === 'claro' ? 'oscuro' : 'claro';
    const raiz = this.documento.documentElement;
    const reducirMovimiento =
      this.documento.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;

    if (!this.documento.startViewTransition || reducirMovimiento) {
      this.aplicar(siguiente);
      return;
    }

    if (evento) {
      raiz.style.setProperty('--vt-x', `${evento.clientX}px`);
      raiz.style.setProperty('--vt-y', `${evento.clientY}px`);
    }

    raiz.classList.add('transicion-tema');
    this.documento
      .startViewTransition(() => this.aplicar(siguiente))
      .finished.finally(() => raiz.classList.remove('transicion-tema'));
  }

  private aplicar(tema: Tema): void {
    this.tema.set(tema);
    this.documento.documentElement.setAttribute('data-tema', tema);
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, tema);
    } catch {
      // Almacenamiento no disponible (modo privado): el tema funciona igual, solo no se recuerda.
    }
  }

  private leerTemaInicial(): Tema {
    try {
      const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
      if (guardado === 'claro' || guardado === 'oscuro') {
        return guardado;
      }
    } catch {
      // Sin acceso al almacenamiento: se usa la preferencia del sistema.
    }
    const prefiereOscuro =
      this.documento.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
    return prefiereOscuro ? 'oscuro' : 'claro';
  }
}
