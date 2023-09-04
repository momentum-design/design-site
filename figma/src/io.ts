import * as fs from 'fs';
import * as path from 'path';
import { execSync } from'child_process';
import { ExportFilePath } from './types';
const https = require('https');
const path_root = path.resolve(__dirname, '../../');
const regTrimStart = /^\s+/g;
const regEmpty =  /\s|\r|\n|\t/g;
const regUnderline = /\_/g;
const regTirm = /(^(\s|\r|\n|\t)+)|((\s|\r|\n|\t)+$)/g;

class _IO {

    paths = {
        root: path_root,
        config: path.join(path_root, 'figma/config.json'),
        log: path.join(path_root, 'figma/output'),
        output: path.join(path_root, 'src/assets/figma'),
        __url_root: 'assets/figma',
        __angularFile: path.join(path_root, 'src/app/component/a.ts')
    }

    logStatus = {
        start: 'start',
        success: 'success',
        error: 'error',
        pending: 'pending'
    }

    constructor() {}

    download(url: string, filename: string):Promise<any> {
        return new Promise<any>((resolve, reject)=>{
            const request = https.get(url, (response:any) => {
                if (response.statusCode !== 200) {
                    console.log(response.statusCode);
                    //reject(`Error response, ${response}`)
                }
    
                const dir =  path.dirname(filename);
                this.mkDir(dir);

                const fileStream = fs.createWriteStream(filename);
                response.on('data', (chunk:any) => {
                    fileStream.write(chunk);
                });
    
                response.on('end', () => {
                    fileStream.end();
                    resolve(1);
                });
            });
    
            request.on('error', (error:any) => {
                reject(error)
            });
    
            request.end();
        });
    }

    log(process:string, processStatus:string='', step?: string, stepStatus?:string) {
        if(step) {
            console.log(`[Process(${process})]:[Step(${step})] ===> ${stepStatus}`);
        } else {
            console.log(`[Process(${process})] ===> ${processStatus}`);
        }
    }

    getLocalFilePath(type:ExportFilePath, navType:string='nav', filename:string='data.json', imageFormat?:string) {
        switch (type) {
            case ExportFilePath.systemJson:
                return path.join(IO.paths.output, filename);
            case ExportFilePath.navTypeJson:
                return path.join(IO.paths.output, navType, 'data' ,filename);
            case ExportFilePath.navTypeImages:
                let _imageFormat = imageFormat;
                return path.join(IO.paths.output, navType, 'images' ,`${filename}.${_imageFormat}`);
            case ExportFilePath.detailPageJson:
                return path.join(IO.paths.output, filename);
        }
    }

    getAssetsImgUrl(navType:string, filename:string, imageFormat?:string) {
        let _imageFormat = imageFormat;
        return path.join(IO.paths.__url_root, navType, 'images' ,`${filename}.${_imageFormat}`);
    }

    getAssetsUrl(type:ExportFilePath, navType:string='nav', filename:string='data.json') {
        return path.relative(this.paths.__angularFile, this.getLocalFilePath(type, navType, filename));
    }
/*
    getAssetsFolderUrl(configKey:string, fileID:string) {
        return `../../assets/${configKey}/${fileID}/images`;
    }
*/
    clear(dir:string) {
        if(fs.existsSync(dir)) {
            execSync(`rm -rf ${dir}`);
        } 
    }

    mkDir(dir:string) {
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    exist(dir:string) {
        return fs.existsSync(dir);
    }

    //list fs.readdirSync(localSource)
    read(dir:string):any {
        return fs.readFileSync(dir);
    }

    save(fpath:string, data:any) {
        const dir =  path.dirname(fpath);
        this.mkDir(dir);
        fs.writeFileSync(fpath, data);
    }

    formatUrl(url:string) {
        return url.replace(regEmpty, '_').toLowerCase();
    }

    recoverUrl(url:string) {
        return url.replace(regUnderline, ' ');
    }

    tirm(name:string) {
        return name.replace(regTirm, '');
    }

    formatJson(obj:any) {
        return JSON.stringify(obj, null, '\t');
    }

    formatStr(data:string) {
        return this.formatJson(JSON.parse(data));
    }

    trimName(str:string, symbol:string) {
        return str.replace(symbol, '').replace(regTrimStart, '');
    }
}

export const IO = new _IO();