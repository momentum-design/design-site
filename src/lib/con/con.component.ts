import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'mm-con',
  templateUrl: './con.component.html',
  styleUrls: ['./con.component.scss']
})
export class ConComponent {

  @Input() left: number = 0;
  
  @ViewChild('content') content: ElementRef;
  
  constructor(public viewContainerRef: ViewContainerRef) { 

  }

}
