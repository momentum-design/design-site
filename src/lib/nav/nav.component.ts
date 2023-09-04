import { Component, ElementRef,Renderer2 } from '@angular/core';
import { Router } from '@angular/router'; 
import { IPageInfoNode, INDEX_PAGE } from '@types';
import * as dataJson from '../../assets/figma/data.json';

interface INav {
  externalUrl?: string,
  navIndex: number,
  nav: string,
  path: string
}

@Component({
  selector: 'mm-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  public homelink = '';
  public hiddenWidth = '1080';
  public navs: INav[];
  public structData: IPageInfoNode = dataJson;
  private isShowMenu = false;

  constructor(private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2) {
    this.initNav();
  }

  public switchMenum(isShowMenu?:boolean) {
    this.isShowMenu = isShowMenu!=undefined ? isShowMenu : !this.isShowMenu;
    if(this.isShowMenu) {
      this.renderer.addClass(this.elementRef.nativeElement, 'host_show_menu');
    } else {
      this.renderer.removeClass(this.elementRef.nativeElement, 'host_show_menu');
    }
  }

  public sub_navs(type:string): string[] {
    let sub:any[] = [];
    if(this.structData.children) {
      let subNodes = this.structData.children[type.toLowerCase()];
      if(subNodes && subNodes.children) {
        sub = Object.keys(subNodes.children);
        sub = sub.filter((name)=>{
          return name.toLowerCase() !== INDEX_PAGE;
        });
        sub.sort();
        return sub.concat(sub.map((key)=>{
          return subNodes.children && subNodes.children[key].title ? subNodes.children[key].title : key.replace(/\_/g,'')
        }));
      }
    }
    return sub;
  }

  private initNav() {
    this.navs = this.router.config.filter((cfg)=>{
      return cfg.data && typeof cfg.data.navIndex === 'number';
    }).sort((cfg1,cfg2)=>{
      if(cfg1.data && cfg2.data) {
        return cfg1.data.navIndex - cfg2.data.navIndex;
      }
      return -1;
    }).map((cfg)=>{
      return {
        navIndex: cfg.data?.navIndex,
        nav: cfg.data?.nav,
        path: cfg.path || '',
        externalUrl: cfg.data?.externalUrl
      }
    }).sort();
  }

}
