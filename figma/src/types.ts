export interface IConfig {
    files:Record<string, IConfigItem>;
    settings: IConfigSettings;
}

export interface IConfigSettings {
    exportImage: Record<string,any>;
    fonts: Record<string,any>;
    containers: Record<string, any>;
    hyperlinkSeparator: string;
}

export interface IConfigItem {
    file: string;
    page: string;
    tab: string;
    banner: string;
    image:string;
}

export interface ISourcePageTarget {
    id: string;
    name: string;
    tabs: string[];
    banners: string[];
}

export interface ISourcePageData {
    target: ISourcePageTarget;
    figmaAPIData: any; // data from FigmaAPI
}

export interface IDomTreeNode {
    type: ConvertTagType;
    figmaAPIData: any; // data from FigmaAPI
    children?: IDomTreeNode[];
    needKeep: boolean;
    textComponentName?:string;
}

export interface IHtmlArchor {
    name:string,
    htmlId: string,
    y: number
}

export interface IHtmlTab {
    html: string;
    archorsIdInOrder: string[]; //names in order
    archors: Record<string, IHtmlArchor>
}

export interface IHtmlPage {
    name: string;
    htmlBanner: string;
    htmlTabs: Record<string, IHtmlTab>; // key: id
    //in nodeConvertot.ts img()
    imgsIdUrl?: Record<string, string>; // remove when output
}

export interface ILocaltion {
    x: number;
    y: number;
    width: number;
    height: number;
    layoutMode: string;
}

/*
    {
        components: ['clip','button'] // ==> clip.json
    }
*/
export interface IPageInfoNode {
    title:string;
    desc:string;
    children?: Record<string, IPageInfoNode>;
}

export enum ExportFilePath {
    systemJson = 'systemJson',
    navTypeJson = 'navTypeJson',
    navTypeImages = 'navTypeImages',
    detailPageJson = 'detailPageJson'
}

export enum FigmaNodeType {
    // create div
    DOCUMENT = "DOCUMENT",
    CANVAS = "CANVAS",
    FRAME = "FRAME",
    GROUP = "GROUP",
    SECTION = "SECTION", //  no use
    // export SVG
    VECTOR = "VECTOR",
    BOOLEAN_OPERATION = "BOOLEAN_OPERATION",
    STAR = "STAR",
    LINE = "LINE",
    ELLIPSE = "ELLIPSE",
    RECTANGLE = "RECTANGLE",
    WASHI_TAPE = "WASHI_TAPE",
    // create h1, p
    TEXT = "TEXT",
    SLICE = "SLICE", //  no use
    // export ?
    COMPONENT = "COMPONENT",
    COMPONENT_SET = "COMPONENT_SET",
    INSTANCE = "INSTANCE",
}

export enum ConvertTagType {
    // create div
    img = "img",
    container = "container",
    text = "text"
}
