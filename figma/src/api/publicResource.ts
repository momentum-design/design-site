import * as fs from 'fs';
import { ExportFilePath } from '../types';
import { IO } from '../io';

export class PublicResource {

    fileRefs:Record<string, any>={};
    toDownload: Record<string, any>={};

    addRefUrl(navTypeOrConfigKey:string, refs) {
        this.fileRefs[navTypeOrConfigKey] = refs;
    }

    addToDownloadList(navTypeOrConfigKey:string, imageRef:string) {
        if(this.fileRefs[navTypeOrConfigKey] && typeof this.fileRefs[navTypeOrConfigKey][imageRef] === 'string') {
            const url = this.fileRefs[navTypeOrConfigKey][imageRef];
            if(this.toDownload[url]===undefined) {
                this.toDownload[url]={};
            }
            this.toDownload[url][IO.getLocalFilePath(ExportFilePath.navTypeImages,navTypeOrConfigKey,imageRef,'png')]=true;
        }
    }

    download():Promise<any> {
        return new Promise((resolve, reject)=>{
            const urls = Object.keys(this.toDownload);
            if(urls.length===0) {
                resolve(0);
            }
            IO.log('Download Fill Images', `start`);
            let todo = urls.length;
            let callback = ()=>{
                todo--;
                if(todo<=0) {
                    IO.log('Download Fill Images', `finished`);
                    resolve(0);
                }
            };
            urls.forEach((url:string)=>{
                let toSavePaths = Object.keys(this.toDownload[url]) as string[];
                let localPath1 = toSavePaths.shift();
                IO.download(url, localPath1).then(()=>{
                    // not check if existing path
                    process.stdout.write(`\r[${ urls.length - todo + 1 } of ${urls.length}] fill images downloaded`);
                    toSavePaths.forEach((localPath:string)=>{
                        fs.copyFileSync(localPath1, localPath);
                    });
                }).catch((e)=>{
                    console.log(e);
                }).finally(()=>{
                    callback();
                });
            });
        });
    }

}

export const publicResource = new PublicResource();