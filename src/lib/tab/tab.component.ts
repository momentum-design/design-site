import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'mm-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit {

  current = 0;
  @Input() tabs: string[];
  @Input() set select(val: number) {
    this.current = val;
  };

  @Output() onClickTab = new EventEmitter<number>();

  constructor() { }

  clickTab(index:number) {
    this.current = index;
    this.onClickTab.emit(index);
  }

  ngOnInit(): void {
  }

}
