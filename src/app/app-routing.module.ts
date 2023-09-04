import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

const routes: Routes = [{
  path: 'design_guidelines',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { 
    navIndex: 2, 
    nav: 'design_guidelines' }
},{
  path: 'design_guidelines/:name',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { 
    nav: 'design_guidelines'
  }
},{
  path: 'components',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { navIndex: 3, nav: 'components' }
},{
  path: 'components/:name',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { 
    nav: 'components'
  }
},{
  path: 'support',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { 
    navIndex: 7, 
    nav: 'Support',
    externalUrl: "https://form.asana.com/?k=nOjXcoSB1acIKrLJwHQZ9Q&d=5557457880942"
  }
},{
  path: 'momentum_philosophy',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { navIndex: 1, nav: 'momentum_philosophy' }
},{
  path: '',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { nav: 'home' }
}];
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy:PreloadAllModules,
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
