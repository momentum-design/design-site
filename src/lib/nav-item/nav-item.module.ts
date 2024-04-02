import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavItemComponent } from './nav-item.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    NavItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NavItemComponent
  ]
})
export class NavItemModule { }
