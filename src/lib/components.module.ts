import { NgModule } from '@angular/core';
import { ConModule } from './con';
import { FooterModule } from './footer';
import { HeaderModule } from './header';
import { NavModule } from './nav';
import { NavItemModule } from './nav-item';
import { TabModule } from './tab';

@NgModule({
  exports: [
    FooterModule,
    ConModule,
    HeaderModule,
    NavModule,
    NavItemModule,
    TabModule
  ],
  imports: [
    FooterModule,
    ConModule,
    HeaderModule,
    NavModule,
    NavItemModule,
    TabModule
  ]
})
export class ComponentsModule {}
