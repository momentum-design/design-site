import { Component, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Article, DomHelper } from '@lib';
import { IHtmlPage, IHtmlTab } from '../../../figma/src/types';
import { INDEX_PAGE } from '@types';

const preDefinedTabs = ['overview','guideline','guidelines','spec','accessibility'].reverse();
let tabOrders = preDefinedTabs;
//move to router

@Component({
  selector: 'mm-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  host: {
    '(window:resize)': 'onResize($event)',
    '(window:scroll)': 'onScroll($event)'
  }
})
export class DetailComponent implements AfterViewInit {

  dataIndex: number=0;
  tabKeys:string[];
  tabs:IHtmlTab[]=[]; // read from JSON
  htmlBanner:string = '';
  pageId:string='';
  tabOrders:string[]=[];
  subTabsHeight:number = 0;

  @ViewChild('articleR') articleR: ElementRef;
  @ViewChild('btnBackToTop') btnBackToTop: ElementRef;

  constructor(private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute) {
  }

  onResize(){
    this.checkSubTabs();
  }

  scrollToTop() {
    DomHelper.scrollTop(0);
  }

  onScroll() {
    this.checkSubTabs();
  }

  checkSubTabs() {
    if(this.articleR) {
      let doms = this.articleR.nativeElement.querySelectorAll('.article_sub_tab');
      let scrollTop = DomHelper.scrollTop();
      let backToTopDisplay= '';
      if(doms && doms.length>0) {
        let subtab = doms[this.dataIndex];
        if(subtab) {
          let marginTop = 10;
          let isShowSubTabs = DomHelper.style(subtab, 'display') != 'none';
          let articleRPostion = DomHelper.postion(this.articleR.nativeElement);
          if(isShowSubTabs && scrollTop > articleRPostion.y + marginTop) {
            subtab.style.position = 'fixed';
            subtab.style.top = marginTop+'px';
            subtab.style.left = articleRPostion.x+'px';
          } else {
            subtab.style.position = '';
            subtab.style.top = '';
            subtab.style.left = '';
          }
        } 
      }
      if(scrollTop>0) {
        backToTopDisplay='block';
      } else {
        backToTopDisplay='none';
      }
      this.btnBackToTop.nativeElement.style.display=backToTopDisplay;
    }
  }


  safeHTML(unsafeHtml:string) {
    return this.sanitizer.bypassSecurityTrustHtml(unsafeHtml)
  }

  sortTab(a:string, b:string) {
    let va = tabOrders.indexOf(a.toLowerCase());
    let vb = tabOrders.indexOf(b.toLowerCase());
    //may need fix
    return vb - va;
  }

  getData(pageNav:string, pageId:string) {
    Article.fetch(pageNav, pageId).then((data:IHtmlPage)=>{
      if(data.htmlTabs) {
        this.tabKeys = Object.keys(data.htmlTabs).reverse();
        this.tabs = this.tabKeys.map((key:string)=>{
          return data.htmlTabs[key];
        });
      }
      if(data.htmlBanner) {
        this.htmlBanner = data.htmlBanner;
      }
      this.forceUpdate(); 
    }).catch((e)=>{
      console.log(pageNav, pageId);
      console.log(e);
    });
  }

  clickTab(index:number) {
    this.dataIndex = index;
    this.checkSubTabs();
  }

  scroll(id:string) {
    let tar = document.getElementById(id);
    if(tar && tar.scrollIntoView) {
      tar.scrollIntoView();
    }
  }

  private forceUpdate() {
    if (this.cd) {
        this.cd.detectChanges();
    }
  }

  ngAfterViewInit(): void {
    this.route.params.subscribe(params => {
      const pageNav = this.route.snapshot.data.nav;
      const pageId = params['name'] || INDEX_PAGE;
      if(pageNav) {
        tabOrders = this.route.snapshot.data.tabs ? this.route.snapshot.data.tabs : preDefinedTabs;
        this.getData(pageNav, pageId);
        this.pageId = pageId;
        this.dataIndex = 0;
      }
    });
    this.clickTab(0);
    this.checkSubTabs();
  }

}
