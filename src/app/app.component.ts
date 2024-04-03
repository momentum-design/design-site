import { AfterViewInit, Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'momentum design';
  backgroundTopImageUrl:string|undefined = '';

  constructor(
    private router: Router) {
  }

  ngAfterViewInit(): void {

    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        let params = e.url.toLowerCase().split('/');
        params.shift();
        let pageNav = params[0] || 'home';
        this.backgroundTopImageUrl = `url('assets/data/bg_top_${pageNav}.png')`;
      }
    });
  }

}
