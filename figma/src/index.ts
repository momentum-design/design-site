import { IO } from './io';
import { IConfig, IPageInfoNode, ISourcePageData, ExportFilePath } from './types';
import { FigmaData } from './api/figmaData';
import { PagesConvertor } from './htmlConvertor/pagesConvertor';
import { publicResource } from './api/publicResource';

// prepare data
const CONFIG:IConfig = JSON.parse(IO.read(IO.paths.config)) as IConfig;
const CONFIG_FILES = CONFIG.files;
const CONFIG_SETTINGS = CONFIG.settings; 
const TOSAVE: IPageInfoNode = {
    title: 'home',
    desc: 'desc',
    children: {}
};
// convert data

async function run() {
    const __keys = Object.keys(CONFIG_FILES);
    let __alertMessages:string[] = [];

    IO.clear(IO.paths.output);

    let currentIndex = 0;
    let _scanNextFigmaFile = ()=> {
        if(currentIndex<__keys.length) {
            let configKey = __keys[currentIndex];
            IO.log(configKey, IO.logStatus.start);
            const figmaData = new FigmaData(configKey, CONFIG_FILES[configKey]);
            IO.log(configKey, '', 'collect figma data', IO.logStatus.start);
            // convert pages
            figmaData.collect().then((sourcePageDatas:Record<string, ISourcePageData>)=>{
                IO.log(configKey, '', 'collect figma data', IO.logStatus.success);
                IO.log(configKey, '', 'convert to html', IO.logStatus.start);
                const pagesConvertor = new PagesConvertor(configKey, CONFIG_FILES[configKey], CONFIG_SETTINGS, sourcePageDatas);
                pagesConvertor.convert().then(()=>{
                    // init toSaveNodes
                    TOSAVE.children[configKey] = {
                        title: configKey,
                        desc: configKey,
                        children: pagesConvertor.pagesNodeInfo
                    };
                    __alertMessages = __alertMessages.concat(pagesConvertor.alertMessages);
                    IO.log(configKey, IO.logStatus.success);
                }).catch((e)=>{
                    console.log(e);
                }).finally(()=>{
                    currentIndex++;
                    _scanNextFigmaFile();
                });
            });
        } else {
            console.log(`Saving system file...`);
            IO.save(IO.getLocalFilePath(ExportFilePath.systemJson), JSON.stringify(TOSAVE, null, '\t'));
            console.log(`Successfully!`);
            publicResource.download()
            .finally(()=>{
                console.log('====================== [ warnings ] ======================');
                __alertMessages.forEach((msg)=>{
                    console.log(msg);
                });
            });
        }
    }

    _scanNextFigmaFile();
}

run();
