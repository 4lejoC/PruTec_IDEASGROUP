import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'proyectos' },
  {
    path: 'proyectos',
    // Carga diferida (lazy loading): el código de la página se descarga al visitarla.
    loadComponent: () =>
      import('./proyectos/pages/proyectos-lista/proyectos-lista.component')
        .then(m => m.ProyectosListaComponent)
  },
  { path: '**', redirectTo: 'proyectos' }
];
