import { Routes } from '@angular/router';

// Carga diferida (lazy loading): el código de cada página se descarga al visitarla.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'proyectos' },
  {
    path: 'proyectos',
    title: 'Proyectos · Gestión de Tareas',
    loadComponent: () =>
      import('./proyectos/pages/proyectos-lista/proyectos-lista.component')
        .then(m => m.ProyectosListaComponent)
  },
  {
    // Las tareas siempre se ven dentro de su proyecto (igual que en la API).
    path: 'proyectos/:proyectoId/tareas',
    title: 'Tareas · Gestión de Tareas',
    loadComponent: () =>
      import('./tareas/pages/tareas-lista/tareas-lista.component')
        .then(m => m.TareasListaComponent)
  },
  { path: '**', redirectTo: 'proyectos' }
];
