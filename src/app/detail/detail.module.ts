import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailRoutingModule } from './detail-routing.module';
import { DetailComponent } from './detail.component';
import { TabModule } from '@lib';


@NgModule({
  declarations: [
    DetailComponent
  ],
  imports: [
    TabModule,
    CommonModule,
    DetailRoutingModule
  ],
  exports: [
    DetailComponent
  ]
})
export class DetailModule { }
