import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'mm-nav-item',
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent implements OnInit {

  @Input() nav_name: string = '';
  @Input() nav_url: string = '';
  @Input() nav_externalUrl: string | undefined;
  @Input() sub_navs: string[] = [];

  get sub_urls():string[] {
    return this.sub_navs.slice(0, Math.ceil(this.sub_navs.length/2));
  }
  get sub_titles():string[] {
    return this.sub_navs.slice(Math.ceil(this.sub_navs.length/2));
  }

  public isFolder = false;

  get image_url(): string {
    let url = this.nav_url!='' ? this.nav_url : 'momentum_philosophy';
    return `url('assets/data/${url}.svg')`;
  }

  get nav_active(): string {
    return  this.nav_url!='' ? 'current' : '';
  }

  get nav_show_name():string {
    return this.nav_name.replace(/\_/g,' ');
  }

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.checkRouterLinkActive();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkRouterLinkActive();
      }
    });
  }

  private checkRouterLinkActive() {
    this.isFolder = this.route.snapshot.firstChild?.routeConfig?.path?.indexOf(this.nav_url)==-1;
  }

  switchNav () {
    this.isFolder = !this.isFolder;
  }

}
