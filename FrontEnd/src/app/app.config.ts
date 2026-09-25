import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { routes } from './app.routes';
import { errorInterceptor } from './shared/error.interceptor';
import { PaginadorEspanol } from './shared/paginador-es';

// Formatos de fecha y números en español.
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // Los parámetros de la ruta (:proyectoId) llegan como @Input() del componente.
      withComponentInputBinding(),
      // Transición animada entre páginas (View Transitions API).
      withViewTransitions()
    ),
    provideAnimationsAsync(),
    // HttpClient con el interceptor que normaliza los errores de la API.
    provideHttpClient(withInterceptors([errorInterceptor])),

    // Idioma: fechas del datepicker en formato dd/mm/aaaa y calendario en español.
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-EC' },
    provideNativeDateAdapter(),

    // Todos los campos de formulario con estilo "outline" (borde), más limpio sobre vidrio.
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },

    // Textos del paginador en español.
    { provide: MatPaginatorIntl, useClass: PaginadorEspanol }
  ]
};
