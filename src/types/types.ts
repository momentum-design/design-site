export type IRange = {
    start: number; // top
    end: number;  // bottom
};

export type IScrollMotionConfig = {
    show: IRange;
    hide: IRange;
};

export interface IScrollMotion {
    scrollMotion:any;
    scrollMotionConfig: IScrollMotionConfig;
    preScroll?:number|null;
    isPlayingScrollDown?: boolean;
    checkScroll: ()=>void;
    initMotion:(startPlus?:number, endPlus?:number)=> void;
}

export interface IPageInfoNode {
    title:string;
    desc:string;
    children?: Record<string, IPageInfoNode>;
}

export const INDEX_PAGE = 'index';