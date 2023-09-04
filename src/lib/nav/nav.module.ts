import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav.component';
import { NavItemModule } from '../nav-item/index';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    NavComponent
  ],
  imports: [
    NavItemModule,
    CommonModule,
    RouterModule
  ],
  exports: [
    NavComponent
  ]
})
export class NavModule { }
