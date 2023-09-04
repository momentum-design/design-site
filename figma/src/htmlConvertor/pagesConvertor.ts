import { ExportFilePath, IConfigItem, IHtmlPage, ISourcePageData,IPageInfoNode, IConfigSettings } from '../types';
import { SectionConvertor } from './sectionConvertor';
import { IO } from '../io';
import { FigmaRestAPI } from '../api/figmaRestAPI';
import { ComponentsLib } from './componentsLib';
import * as fs from 'fs';

export class PagesConvertor {

    sourcePageDatas: Record<string, ISourcePageData>;
    config:IConfigItem;
    configKey:string;
    configSettings: IConfigSettings;
    imgsIdUrl: Record<string, string>={};
    pagesNodeInfo: Record<string, IPageInfoNode> = {};
    componentsLib:ComponentsLib;
    overSizeImageSize: number = 1; //1M
    alertMessages:string[] = [];

    constructor(configKey:string, config:IConfigItem,configSettings:IConfigSettings,sourcePageDatas: Record<string, ISourcePageData>) {
        this.config = config;
        this.configKey = configKey;
        this.configSettings = configSettings;
        this.sourcePageDatas = sourcePageDatas;
        this.componentsLib = new ComponentsLib(configSettings);
    }

    private chunks(imgsID:string[]):string[] {
        const totalImages = imgsID.length;
        let stepLength = 10; // limitation of http request
        const idsChunks = [];
        let end;
        for(let i=0;i<totalImages;) {
            end = i+stepLength;
            idsChunks.push(imgsID.slice(i, Math.min(totalImages, i+stepLength)).join(','))
            i=end;
        }
        return idsChunks;
    }

    getImageList(imgsID:string[]):Promise<Record<string, string>> {
        return new Promise<any>((resolve, reject)=>{
            // chunks
            let ret:Record<string, string> = {};
            let idsGroup = this.chunks(imgsID);
            let todo = idsGroup.length;
            IO.log(this.configKey, '', 'get images list', IO.logStatus.start);
            let callback = ()=> {
                todo--;
                if(todo<=0) {
                    IO.log(this.configKey, '', `get images list`, IO.logStatus.success);
                    resolve(ret);
                }
            }
            idsGroup.forEach((ids)=>{
                FigmaRestAPI.getImage(
                    this.config.file, 
                    Object.assign({ ids: ids },this.configSettings.exportImage)
                ).then((imglist)=>{
                    if(imglist && imglist.images) {
                        Object.assign(ret, imglist.images);
                    } else{
                        reject('No images found');
                    }
                    process.stdout.write(`\r[${ idsGroup.length - todo + 1 } of ${idsGroup.length}] img list finsihed`);
                    callback();
                    //callback();
                }).catch((e)=>{
                    console.log(e);
                });
            });
        });

    }

    downloadImages():Promise<any> {
        return new Promise<any>((resolve, reject)=>{
            const imgsID = Object.keys(this.imgsIdUrl);
            if(imgsID.length===0) {
                resolve(1);
            }
            this.getImageList(imgsID).then((imglist)=>{
                let imageNodes = Object.keys(imglist);
                let todo = imageNodes.length;
                let localPaths:Record<string, string> = {};
                if(todo===0) {
                    reject(1);
                }
                const callback =()=>{
                    todo--;
                    process.stdout.write(`\r[${ imageNodes.length - todo } of ${imageNodes.length}] download images ...`);
                    if(todo<=0) {
                        IO.log(this.configKey, '', `download ${imageNodes.length} images`, IO.logStatus.success);
                        Object.keys(localPaths).forEach((localPath)=>{
                            let size = fs.statSync(localPath).size/1024/1024;
                            if(size >= this.overSizeImageSize) {
                                let nodeUrl = `https://www.figma.com/file/${this.config.file}?node-id=${localPaths[localPath]}`;
                                this.alertMessages.push(`[Oversize node] ${nodeUrl} ===> [${size.toFixed(2)}M]`);
                            }
                        });
                        resolve(1);
                    }
                }
                if(imgsID.length===0) {
                    reject('No images');
                }
                // download images
                IO.log(this.configKey, '', `download ${imageNodes.length} images`, IO.logStatus.start);
                imageNodes.forEach((nodeId:string)=>{
                    let url = imglist[nodeId];
                    if(url) {
                        let savePath = IO.getLocalFilePath(ExportFilePath.navTypeImages, this.configKey, nodeId, this.configSettings.exportImage.format);
                        IO.download(url, savePath).then((svgData)=>{
                            localPaths[savePath]=nodeId;
                            callback();
                        }).catch((e)=>{
                            IO.log(this.configKey, '', `download ${imageNodes.length} images`, IO.logStatus.error);
                            console.log(`can not get images ${nodeId}`, e);
                            reject(e);
                        })
                    } else {
                        callback();
                        IO.log(this.configKey, '', `NO URL to Download`, `https://www.figma.com/file/${this.config.file}?node-id=${nodeId}`);
                    }
                });
            }).catch((e)=>{
                reject(e);
            });
        });
    }

    // main
    convert():Promise<any> {
        Object.values(this.sourcePageDatas).forEach((sourcePageData: ISourcePageData)=>{
            this.convertPage(sourcePageData);
        });
        //-------------- download images ---------------
        //return new Promise((resolve)=>{resolve(1)});
        return this.downloadImages();
    }

    private convertPage(sourcePageData: ISourcePageData) {       
        let bannerHTML = '';
        if(Array.isArray(sourcePageData.target.banners) &&  sourcePageData.target.banners.length>0) {
            let bannerID = sourcePageData.target.banners[0];
            let bannerSc =new SectionConvertor(
                bannerID,
                sourcePageData.figmaAPIData.nodes[bannerID],
                this.configKey,
                this.config,
                this.configSettings,
                this.componentsLib
            );
            bannerHTML = bannerSc.html();
            Object.assign(this.imgsIdUrl, bannerSc.imgUrls);
        }
        let dataToSave: IHtmlPage = {
            name: IO.trimName(sourcePageData.target.name, this.config.page),
            htmlBanner: bannerHTML,
            htmlTabs: {}
        };

        sourcePageData.target.tabs.forEach((nodeId:string)=>{
            let sc = new SectionConvertor(
                nodeId,
                sourcePageData.figmaAPIData.nodes[nodeId],
                this.configKey,
                this.config,
                this.configSettings,
                this.componentsLib
            );
            let html = sc.html();
            Object.assign(this.imgsIdUrl, sc.imgUrls);
            let tabName = IO.trimName(sourcePageData.figmaAPIData.nodes[nodeId].document.name, this.config.tab);
            dataToSave.htmlTabs[tabName] = {
                html: html,
                archors: sc.archors,
                archorsIdInOrder: sc.archorsIdInOrder
            }
        });
        let title = IO.tirm(dataToSave.name);
        let keyUrl = IO.formatUrl(title);
        this.pagesNodeInfo[keyUrl] = {
            title: title,
            desc: title
        };
        let descRegResult = /<h5.*?>(.*?)<\/h5>/.exec(dataToSave.htmlBanner);
        if(descRegResult && descRegResult.length>1) {
            this.pagesNodeInfo[keyUrl].desc = descRegResult[1];
        }
        // save data
        IO.save(IO.getLocalFilePath(ExportFilePath.navTypeJson, this.configKey, `${keyUrl}.json`), JSON.stringify(dataToSave));

    }

}
