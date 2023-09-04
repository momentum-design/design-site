import { FigmaNodeType, IConfigSettings } from "../types";

export class ComponentsLib {

    instances: Record<string, any>={};
    components: Record<string, any>={};
    fontNames:string[];
    containerNames:string[];

    settings: IConfigSettings;

    constructor(settings:IConfigSettings) {
        this.settings = settings;
        this.fontNames= this.lowerArrayString(Object.keys(this.settings.fonts));
        this.containerNames = this.lowerArrayString(Object.keys(this.settings.containers));
    }

    private lowerArrayString(arr:string[]) {
        return arr.map((name)=>{
            return name.toLowerCase();
        });
    }

    update(rootNode: any) {
        if(rootNode.components) {
            Object.assign(this.components, rootNode.components);
        }
    }

    isContainerName(name:string):boolean {
        return this.containerNames.indexOf(name.toLowerCase())!==-1;
    }

    isFontName(name:string):boolean {
        return this.fontNames.indexOf(name.toLowerCase())!==-1
    }

    getFontName(componentId:string):string|undefined {
        let c = this.components[componentId];
        if(c && c.remote === true && this.isFontName(c.name)) {
            return c.name.toLowerCase();
        }
        return undefined;
    }

    getImageId(figmaAPIData:any) {
        const componentID = figmaAPIData.componentID;
        const id = figmaAPIData.id;
        if(figmaAPIData.type === FigmaNodeType.INSTANCE && this.components[componentID]) {
            // override
            if(Array.isArray(figmaAPIData.overrides) && figmaAPIData.overrides.length > 0) {
                return id;
            } else {
                if(this.components[componentID].remote) {
                    if (this.instances[componentID]===undefined) {
                        this.instances[componentID] = id;
                    }
                    return this.instances[componentID];
                // local component can be exported
                } else {
                    return componentID;
                }
            }
        } 
        return id;
    }

}