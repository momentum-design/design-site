import * as path from 'path';
import { IO } from '../io';
import { getProcessArgs } from '../args';

const https = require('https');
const regLocal = /\?|\.|\,|\\|\//g;
type IQuery = string | number | boolean;

export interface RequestUnit {
    requestObject: any;
    requestBody?: any;
    callback?: any;
}

const ARGS = getProcessArgs('__local/figma.json');

export class Limits {

    maxVisitsOnce:number;
    sleepTime:number;

    isSleep:boolean=false; // 0 can send 1 freeze
    currentVisits = 0;
    stacks:RequestUnit[]=[];

    constructor(maxVisitsOnce:number=10, sleepTime:number=1000) {
        this.maxVisitsOnce = maxVisitsOnce;
        this.sleepTime = sleepTime;
    }

    request(unit:RequestUnit) {
        this.stacks.push(unit);
        this.excute();
    }

    excute() {
        if(!this.isSleep && this.stacks.length>0) {
            this.isSleep = true;
            let arr = this.stacks.splice(0, this.maxVisitsOnce);
            let todo = arr.length;
            let nextExcuteTIme = this.sleepTime;
            let _cb = () => {
                todo--;
                if(todo<=0) {
                    setTimeout(()=>{
                        this.isSleep = false;
                        this.excute();
                    },nextExcuteTIme);
                }
            };
            arr.forEach((unit: RequestUnit)=>{
                this.send(unit.requestObject, unit.requestBody).then((data)=>{
                    unit.callback & unit.callback(data);
                }).catch((e)=>{
                    this.stacks.unshift(unit);
                    nextExcuteTIme = this.sleepTime * 2;
                }).finally(()=>{
                    _cb();
                });
            });
        }
    }

    send(requestObject:any, requestBody?:any):Promise<any> {
        return new Promise<any>((resolve, reject)=>{
            const request = https.request(requestObject, (response:any) => {
                let is200 = true;
                if(response && response.statusCode !== 200) {
                    is200 =false;
                }
                let responseData = '';
                response.on('data', (chunk:string) => {
                    responseData += chunk;
                });
                response.on('end', () => {
                    if(is200) {
                        resolve(responseData)
                    } else {
                        reject(`state code: ${response.statusCode}`);
                    }
                });
            });
            request.on('error', (error:any) => {
                console.error('fail to send message');
                console.error(error);
                reject(error);
            });
            if(requestBody) {
                request.write(requestBody);
            }
            request.end();    
        });
    }
}

export class _FigmaRestAPI {

    limits = new Limits();
    isRecord:boolean = true;
    isReadRecord:boolean = false;
    token:string;
    host:string;

    constructor(token:string, host?:string) {
        this.token = token;
        this.host = host || 'api.figma.com';
    }

    private getImageFillsFilePath(fileKey:string) {
        const url = `/v1/files/${fileKey}/images`;
        const remoteUrl = this.getRemoteUrl(url, {});
        return this.getLocalUrl(remoteUrl);
    }

    private getLocalUrl(str:string) {
        return path.join(IO.paths.log, `f_${str.replace(regLocal , '_')}.json`);
    }

    private getRemoteUrl(url:string, querys:Record<string, IQuery>) {
        const queryArr:string[] = [];
        Object.keys(querys).forEach((key)=>{
            queryArr.push(`${key}=${querys[key].toString()}`)
        });
        const queryString = queryArr.join('&');
        return queryArr.length>0 ? `${url}?${queryString}` : url;
    }

    getFile(fileKey:string, querys:Record<string, IQuery> = {}):Promise<Record<string, any>> {
        const url = `/v1/files/${fileKey}`;
        const _query = Object.assign({
            //ids: '12,123,3',
            //version: undefined,
            //depth:1,
            //geometry:paths
            //plugin_data: string
            //branch_data
        }, querys);
        return this.requestAPI(url, _query);
    }

    getFileNodes(fileKey:string, querys:Record<string, IQuery> = {}):Promise<Record<string, any>> {
        const url = `/v1/files/${fileKey}/nodes`;
        const _query = Object.assign({
            //ids: '12,123,3',
            //version: undefined,
            //depth:1,
            //geometry: 'paths'
            //plugin_data: string
            //branch_data
        }, querys);
        return this.requestAPI(url, _query);
    }

    getImage(fileKey:string, querys:Record<string, IQuery> = {}):Promise<Record<string, any>> {
        const url = `/v1/images/${fileKey}`;
        const _query = Object.assign({
            format: 'svg' // jpg, png, pdf
            //scale: 1, // 0.01-4,
            //svg_include_id: false,
            //svg_simplify_stroke: true,
            //use_absolute_bounds: false
            //ids: '12,123,3',
            //version: undefined,
            //depth:1,
            //geometry:paths
            //plugin_data: string
            //branch_data
        }, querys);
        return this.requestAPI(url, _query);
    }

    getImageFills(fileKey:string, querys:Record<string, IQuery> = {}):Promise<Record<string, any>> {
        const url = `/v1/files/${fileKey}/images`;
        return this.requestAPI(url, querys);
    }

    private requestAPI(url:string, querys:Record<string, IQuery>, method:string='GET'):Promise<Record<string, any>> {
        return new Promise<any>((resolve, reject)=>{
            const remoteUrl = this.getRemoteUrl(url, querys);
            const localPath = this.getLocalUrl(remoteUrl);
            const _h = {
                hostname: this.host,
                path: remoteUrl,
                method: method,
                headers: {
                    'X-FIGMA-TOKEN': this.token,
                    'Connection': 'Keep-Alive'
                }
            };
            if(this.isReadRecord && IO.exist(localPath)) {
                console.log(`read: ${localPath}`);
                resolve(JSON.parse(IO.read(localPath)));
            } else {
                let _callback = (data) => {
                    //console.log(`requestd: ${remoteUrl}`);
                    let ret = JSON.parse(data);
                    //status code 
                    if(ret['state code'] && ret['state code'].toString()!= '200') {
                        reject(data)
                    }
                    if(this.isRecord) {
                        IO.save(localPath, IO.formatJson(ret));
                    }
                    resolve(ret);
                };

                this.limits.request({
                    requestObject: _h,
                    callback: (data)=>{
                        _callback(data);
                    }
                });              
            }
        });
    }

    send(requestObject:any, requestBody?:any):Promise<any> {
        return new Promise<any>((resolve, reject)=>{
            const request = https.request(requestObject, (response:any) => {
                if(response && response.statusCode !== 200) {
                    console.log(`state code: ${response.statusCode}`);
                }
                let responseData = '';
                response.on('data', (chunk:string) => {
                    responseData += chunk;
                });
                response.on('end', () => {
                    resolve(responseData)
                });
            });
            request.on('error', (error:any) => {
                console.error('fail to send message');
                console.error(error);
                reject(error);
            });
            if(requestBody) {
                request.write(requestBody);
            }
            request.end();    

        });
    }
}

export const FigmaRestAPI = new _FigmaRestAPI(ARGS.token);