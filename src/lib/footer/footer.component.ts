import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ITagAProps } from '@types';
import { Router } from '@angular/router'; 

@Component({
  selector: 'mm-footer',
  templateUrl: './footer.component.html',
  styleUrls:['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {

  momentum_logo: ITagAProps = {
    href: '',
    title: 'Momentum design, home page',
    image: `url('assets/images/momentum_logo_white.svg')`
  };
  momentum_links: ITagAProps[];
  socail_links: ITagAProps[]=[{
    href: 'https://twitter.com/webex',
    title: 'twitter',
    image: `url('assets/icons/x.svg')`
  },{
    href: 'https://www.linkedin.com/company/webex',
    title: 'linkedin',
    image: `url('assets/icons/linkedin.svg')`
  },{
    href: 'https://www.facebook.com/webex',
    title: 'facebook',
    image: `url('assets/icons/facebook.svg')`
  },{
    href: 'https://www.youtube.com/c/webex',
    title: 'youtube',
    image: `url('assets/icons/youtube.svg')`
  },{
    href: 'https://www.instagram.com/webex/',
    title: 'instagram',
    image: `url('assets/icons/instagram.svg')`
  }];
  cisco_links: ITagAProps[]= [{
    href: 'https://www.cisco.com/c/en/us/about/legal/terms-conditions.html',
    title: 'Terms & Conditions'
  },{
    href: 'https://www.cisco.com/c/en/us/about/legal/privacy-full.html',
    title: 'Privacy Statement',
  },{
    href: 'https://www.cisco.com/c/en/us/about/legal/privacy.html#cookies',
    title: 'Cookies',
  },{
    href: 'https://www.cisco.com/c/en/us/about/legal/trademarks.html',
    title: 'Trademarks',
  }];
  cisco_logo: ITagAProps =  {
    href: 'https://www.cisco.com',
    title: 'Cisco, home page',
    image: `url('assets/images/cisco_logo.svg')`
  };;

  thisYear = (new Date()).getFullYear();

  newTab(url:string, isOpen?:boolean) {
    if(isOpen) {
      window.open(url,'_blank')
    }
  }

  constructor(private router: Router) {
    this.momentum_links = this.router.config.filter((cfg)=>{
      return cfg.data && typeof cfg.data.navIndex === 'number';
    }).sort((cfg1,cfg2)=>{
      if(cfg1.data && cfg2.data) {
        return cfg1.data.navIndex - cfg2.data.navIndex;
      }
      return -1;
    }).map((cfg)=>{
      let isExternal= typeof cfg.data?.externalUrl === 'string';
      return {
        //navIndex: cfg.data?.navIndex,
        title: cfg.data?.nav,
        href: isExternal ? cfg.data?.externalUrl : (cfg.path || ''),
        external: isExternal
      }
    }).sort();
  }

}
