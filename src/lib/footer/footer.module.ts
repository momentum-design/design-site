import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FooterComponent } from './footer.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule,RouterModule],
  declarations: [FooterComponent],
  exports: [FooterComponent],
})
export class FooterModule {
  static forRoot(): ModuleWithProviders<FooterModule> {
    return {
      ngModule: FooterModule,
    };
  }
}