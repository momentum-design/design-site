import * as fs from 'fs';
import * as path from 'path';

const regArgs = /^([^\=]+)\=([^\=]+)$/;
const path_root = path.resolve(__dirname, '../../');

const getArgsFromLocalFile = (p?: string): Record<string, string> => {
    const configPath = path.join(path_root, p);
    const ret = {};
    if(typeof p === 'string' && fs.existsSync(configPath)) {
        Object.assign(ret, JSON.parse(fs.readFileSync(configPath).toString()));
    }
    return ret;
};

export const getProcessArgs = (p?:string): Record<string, string>=> {
    const args = process.argv.slice(2);
    const ret: Record<string, string> = getArgsFromLocalFile(p);
    args.forEach((str)=>{
        const result = str.match(regArgs);
        if(result && typeof result.length === 'number' && result.length===3) {
            ret[result[1]] = result[2];
        }
    });
    return ret;
}