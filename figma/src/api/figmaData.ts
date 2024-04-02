import { FigmaRestAPI } from './figmaRestAPI';
import { publicResource } from './publicResource';
import { ISourcePageTarget, ISourcePageData, IConfigItem } from '../types';

export class FigmaData {

    PAGES: Record<string, ISourcePageData>;
    config:IConfigItem;
    configKey:string;

    constructor(configKey:string, config: IConfigItem) {
        this.configKey = configKey;
        this.config = config;    
    }

    private scanPage(page:any): ISourcePageTarget{
        const ret:ISourcePageTarget = {
            id: page.id,
            name: page.name,
            tabs: [],
            banners: []
        };
        if(Array.isArray(page.children)) {
            page.children.forEach((frame:any) => {
                if(frame.name.indexOf(this.config.tab)!==-1) {
                    ret.tabs.push(frame.id)
                } else if (frame.name.indexOf(this.config.banner)!==-1) {
                    ret.banners.push(frame.id)
                }
            });
        }
        return ret;
    }

    private collectPageData(targets:Record<string, ISourcePageTarget>):Promise<Record<string, ISourcePageData>> {
        return new Promise<any> ((resolve, reject)=>{
            let pages = Object.values(targets);
            let todo = pages.length;
            this.PAGES = {};
            console.log(`${pages.length} pages to download`);
            let callback = ()=> {
                todo--;
                process.stdout.write(`\r[${pages.length-todo} of ${pages.length}] page nodes data fetching ...`);
                if(todo<=0) {
                    resolve(this.PAGES);
                }
            };
            pages.forEach((pageTarget)=>{
                FigmaRestAPI.getFileNodes(this.config.file, {
                    ids: pageTarget.banners.concat(pageTarget.tabs).join(',')
                }).then((data:any)=>{
                    this.PAGES[pageTarget.id] =  {
                        target: pageTarget,
                        figmaAPIData: data
                    };
                    callback();
                }).catch((e)=>{
                    console.log(e);
                });
            });
        });
    }

    // <pageId, ISourcePageTarget>
    private getTarget():Promise<Record<string, ISourcePageTarget>> {
        return new Promise<any> ((resolve, reject)=>{
            FigmaRestAPI.getFile(this.config.file, {
                depth: 2
            }).then((fileData:any)=>{
                const _targets:Record<string, ISourcePageTarget> = {};
                if(fileData.document && Array.isArray(fileData.document.children)) {
                    fileData.document.children.forEach((page:any) => {
                        if(page.name.indexOf(this.config.page)!==-1) {
                            //scan page
                            let _target = this.scanPage(page);
                            if(_target.banners.length+_target.tabs.length > 0) {
                                _targets[page.id] = _target;
                            }
                        }
                    });
                }
                resolve(_targets);
            }).catch((e:any)=>{
                reject(e)
            });
        });
    }

    collect():Promise<Record<string, ISourcePageData>> {
        return new Promise<Record<string, ISourcePageData>> ((resolve, reject)=>{
            this.getTarget().then((targets)=>{
                FigmaRestAPI.getImageFills(this.config.file)
                .then((refs)=>{
                    if(refs && refs.meta && refs.meta.images) {
                        publicResource.addRefUrl(this.configKey, refs.meta.images);
                    }
                })
                .finally(()=>{
                    //targets => <pageId, ISourcePageTarget>
                    this.collectPageData(targets).then((data)=>{
                        resolve(data);
                    }).catch((e)=>{
                        reject(e);
                    });                    
                });
            }).catch((e)=>{
                reject(e);
            });
        });
    }

}