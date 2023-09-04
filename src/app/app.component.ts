import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { INDEX_PAGE } from '@types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'momentum design';
  backgroundTopImageUrl:string|undefined = '';
  backgroundBottomImageUrl:string|undefined = '';

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router) {
  }

  ngAfterViewInit(): void {

    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        let params = e.url.toLowerCase().split('/');
        params.shift();
        let pageNav = params[0] || 'home';
        this.backgroundTopImageUrl = `url('assets/data/bg_top_${pageNav}.png')`;
        if(params.length==1 || params[1] === INDEX_PAGE) {
          this.backgroundBottomImageUrl = `url('assets/data/bg_bottom_${pageNav}.png')`;
        } else {
          this.backgroundBottomImageUrl='none';
        }
      }
    });
  }

  private forceUpdate() {
    if (this.cd) {
        this.cd.detectChanges();
    }
  }
}
