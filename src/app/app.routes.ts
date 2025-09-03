// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { NSConv } from './ns-conv/ns-conv';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'converter',
    pathMatch: 'full'
  },
  {
    path: 'converter',
    component: NSConv
  },
  {
    path: '**',
    redirectTo: 'converter'
  }
];