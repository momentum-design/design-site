import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

const routes: Routes = [{
  path: 'guidelines',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { 
    navIndex: 2, 
    nav: 'guidelines' }
},{
  path: 'guidelines/:name',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { 
    nav: 'guidelines'
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
  path: 'develop',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { 
    navIndex: 6, 
    nav: 'develop',
    externalUrl: "https://momentum-design.github.io/momentum-design/en/"
  }
},{
  path: 'support',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { 
    navIndex: 7, 
    nav: 'support',
  }
},{
  path: 'philosophy',
  loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule),
  data: { 
    navIndex: 1, 
    nav: 'philosophy' 
  }
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
