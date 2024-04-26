import { ConvertTagType, ExportFilePath, ILocaltion, IDomTreeNode, IHtmlArchor, IConfigSettings, IConfigItem } from "../types";
import { IO } from '../io';
import { ComponentsLib } from './componentsLib';
import { publicResource } from '../api/publicResource';

const regTag = /^h\d$/i;
const regHttps = /^https?\:\/\//;
const regHtmlId = /\:|\;|\,/g;
const regNewline = /\n|\r/g;
const regNewlines =/(\n|\r)+/g;
const regNewlineEnd = /(\n|\r)+$/g;
const regNewlineStart = /^(\n|\r)+/g;
const TABINDEX="1";

export class NodeConvertor {

    type:ConvertTagType;
    figmaAPIData:any;
    styles: Record<string, string>;
    imgUrls:Record<string, string>;
    archors:Record<string, IHtmlArchor>;
    configKey:string;
    config:IConfigItem;
    configSettings: IConfigSettings;
    componentsLib:ComponentsLib;
    parentLocaltion:ILocaltion | undefined;
    textComponentName?:string;

    static formatID(...names: string[]) {
        return names.join('_');
    }

    constructor(node:IDomTreeNode, configKey:string,config:IConfigItem, configSettings: IConfigSettings, componentsLib:ComponentsLib, parentLocaltion?:ILocaltion) {
        this.figmaAPIData = node.figmaAPIData;
        this.textComponentName = node.textComponentName;
        this.type = node.type;
        this.imgUrls = {};
        this.archors = {};
        this.configKey = configKey;
        this.config = config;
        this.configSettings = configSettings;
        this.componentsLib = componentsLib;
        this.parentLocaltion = parentLocaltion;
    }

    html(content:string=''):string {
        this.styles = {};
        switch(this.type) {
            case ConvertTagType.text:
                return this.text();
            case ConvertTagType.img:
                return this.img();
            default:
                return this.div(content);
        }
    }

    private getImageName(name:string) {
        let reg = new RegExp('^'+this.config.image);
        return name.replace(reg,'');
    }

    private img() {
        // use componentID
        let imageID = this.componentsLib.getImageId(this.figmaAPIData);
        // add imgUrls
        let url = IO.getAssetsImgUrl(this.configKey, imageID, this.configSettings.exportImage.format);
        //let url = path.join(this.assetBaseUrl, imageID);
        this.imgUrls[imageID] = url;

        this.cssLayout({
            display: 'block'
        }, true);
        let ck = this.checkIfHasLink(this.figmaAPIData.name);
        let href= ck.href;
        let title;
        //this.cssColor();
        if(ck.hasLink) {
            this.styles['background-image'] = `url('${url}')`;
            this.styles['background-repeat'] = 'no-repeat';
            this.styles['background-position'] = 'center';
            this.styles['overflow'] = 'hidden';
            title = this.getImageName(ck.arr[0]);
            return `<a${href} role="button" tabindex="${TABINDEX}" style="${this.css()}" aria-label="${title}" title="${ title }"></a>`;
        } else {
            title = this.getImageName(this.figmaAPIData.name);
            return `<img tabindex="${TABINDEX}" style="${this.css()}"  alt="${ title }" src=${url} />`;
        }
    }

    private toHtmlId(id) {
        return id.replace(regHtmlId, '_');
    }

    private shadowTextNode(content, styleData?, differStyle?) {
        let tag = differStyle ? 'span' : '';
        let urlAttr = '';
        if(styleData && styleData.hyperlink
            && styleData.hyperlink.type === 'URL'
            && typeof styleData.hyperlink.url === 'string'
            ){
            tag = 'a';
            urlAttr = `href="${styleData.hyperlink.url}" target="_blank"`;
        }
        if(tag==='') {
            return content;
        }
        if(!differStyle) {
            differStyle = {};
        }
        let preBR='';
        let appendBR='';
        if(regNewlineStart.test(content)) {
            preBR='<br>';
        }
        if(regNewlineEnd.test(content)) {
            appendBR='<br>';
        } 
        differStyle['display'] = 'inline';
        return `${appendBR}<${tag} ${urlAttr} style="${this.css(differStyle)}" >${content}</${tag}>${preBR}`; 
    }

    private safeHtml(content:string):string {
        return content.replace(regNewlines,'<br>');
    }   

    private textInnerHTML(content, currentStart=0) {
        let chars = this.figmaAPIData.characterStyleOverrides;
        // content.length != this.figmaAPIData.characterStyleOverrides.length
        if(content && content.length>0 && chars && chars.length>0) {
            let innerHTML = [];
            let _currentStyle = chars[currentStart];
            let _starts=[0];
            for(let i=1;i<content.length;i++) {
                let indexInAll = currentStart+i;
                if(indexInAll<chars.length) {
                    if(chars[indexInAll]!== _currentStyle) {
                        _currentStyle = chars[indexInAll];
                        _starts.push(i);
                    }
                } else if (indexInAll===chars.length){
                    _starts.push(i);
                }
            }
            _starts.push(content.length);
            let differStyles = this.createDifferStyles();
            for(let index=0;index<_starts.length-1;index++) {
                let charStartIndex = _starts[index];
                let charEndIndex = _starts[index+1]
                let txt = content.slice(charStartIndex,charEndIndex);
                let styleId = this.figmaAPIData.characterStyleOverrides[currentStart+charStartIndex];
                //shadowTextNode]
                if(styleId) {
                    innerHTML.push(this.shadowTextNode(txt,this.figmaAPIData.styleOverrideTable[styleId],differStyles[styleId]));
                } else {
                    innerHTML.push(this.shadowTextNode(txt));
                }
            }
            /*
            if(content.length>chars.length) {
                let lastText = content.slice(chars.length);
                innerHTML.push(this.shadowTextNode(lastText));
            }*/
            return innerHTML.join('');
        }
        return this.safeHtml(content);
    }

    // call after css color
    private createDifferStyles() {
        let rootStyle = this.figmaAPIData.style;
        let styles = {};
        Object.keys(this.figmaAPIData.styleOverrideTable).forEach((key)=>{
            let SubNodeStyle = this.figmaAPIData.styleOverrideTable[key];
            let ComputedStyle = this.cssFont({
                style: SubNodeStyle,
                fills: SubNodeStyle.fills
            }, true);
            let diffStyle= {};
            Object.keys(ComputedStyle).forEach((prop)=>{
                if(rootStyle[prop]!== ComputedStyle[prop]) {
                    diffStyle[prop] = ComputedStyle[prop];
                }
            });
            if(Object.keys(diffStyle).length>0) {
                styles[key] = diffStyle;
            }
        });
        return styles;
    }

    private text() {
        let tag = 'p';
        let urlAttr = '';
        let className = '';
        let classNames = [];
        let lowerNodeNames = this.figmaAPIData.name.toLowerCase().split(this.configSettings.specialClass);
        let lowerName = this.textComponentName? this.textComponentName.toLowerCase() : lowerNodeNames[0];
        // className
        if(this.componentsLib.isFontName(lowerName)) {
            classNames.push(lowerName);
        }
        if(lowerNodeNames.length>1) {
            classNames.push(lowerNodeNames[1]);
        }
        if(classNames.length>0) {
            className = `class="${classNames.join(' ')}"`;
        }
        
        // ifHasLink => a tag
        if(this.figmaAPIData.style 
            && this.figmaAPIData.style.hyperlink
            && this.figmaAPIData.style.hyperlink.type === 'URL'
            && typeof this.figmaAPIData.style.hyperlink.url === 'string'
            ){
            tag = 'a';
            urlAttr = `href="${this.figmaAPIData.style.hyperlink.url}" target="_blank"`;
        }
        if(lowerName==='a') {
            tag = 'a';
        }

        // h1-h6
        if(this.textComponentName) {
            const _reg = lowerName.match(regTag);
            if(_reg && _reg.length>0) {
                tag = _reg[0];
            }
        }

        const content = this.figmaAPIData.characters || '';
        const id = this.toHtmlId(this.figmaAPIData.id);
        // convert archors
        if(tag==='h2' || tag==='H2') {
            this.archors[id] = {
                name: content,
                htmlId: id,
                y: this.figmaAPIData.absoluteBoundingBox.y
            }
        }
        this.cssLayout();
        Object.assign(this.styles, this.cssFont());
        let innerHTML;

        if(this.figmaAPIData.lineTypes && this.figmaAPIData.lineTypes.length>0 && this.figmaAPIData.lineTypes.indexOf('UNORDERED')!==-1) {
            tag = 'ul';
            let lines = this.figmaAPIData.characters.split('\n');
            let currentStart=0;
            let _lis = lines.map((lineText,i)=>{
                let retStr = `<li role="listitem" class="${this.figmaAPIData.lineTypes[i]||'None'}" tabindex="${TABINDEX}" title="${lineText}" aria-label="${lineText}">${this.textInnerHTML(lineText, currentStart)}</li>`;
                currentStart += lineText.length+1;
                return retStr
            });
            innerHTML = _lis.join('');
        } else {
            innerHTML = this.textInnerHTML(this.figmaAPIData.characters);
        }

        let role = 'document';
        switch (tag) {
            case 'ul': 
                role = 'list';
                break;
            case 'p': 
                role = 'document';
                break;
            case 'a': 
                role = 'link';
                break;
            case 'h1': 
            case 'h2': 
            case 'h3': 
            case 'h4': 
            case 'h5': 
            case 'h6': 
                role = 'heading';
                break;
        }

        return `<${tag} ${className} role="${role}" ${urlAttr} id="${id}" tabindex="${TABINDEX}" aria-label="${content}" title="${content}" style="${this.css()}" >${innerHTML}</${tag}>`;

    }

    private imageBackground() {
        const _fills = this.figmaAPIData.fills;
        if(Array.isArray(_fills) && _fills.length>0
            && _fills[0].type==='IMAGE' && typeof _fills[0].imageRef === 'string') {
            const ref = _fills[0].imageRef;
            let _style:any = {};
            publicResource.addToDownloadList(this.configKey, ref);
            _style['background-image'] = `url('${IO.getAssetsImgUrl(this.configKey, ref,'png')}')`;
            _style['background-size'] = _fills[0].scaleMode==='FILL' ? 'cover': 'contain';
            _style['background-repeat'] = 'no-repeat';
            _style['background-position'] = 'center';
            _style['overflow'] = 'hidden';
            Object.assign(this.styles, _style);
        }
    }

    private checkIfHasLink(name:string):any {
        let arr = name.split(this.componentsLib.settings.hyperlinkSeparator);
        let href ='';
        let hasLink = false;
        if(arr.length===2) {
            hasLink = true;
            if(regHttps.test(arr[1])) {
                href = ` href="${arr[1]}" target="_blank"`;
            } else {
                href = ` href="${arr[1]}"`;
            }
        }
        return {
            hasLink: hasLink,
            href: href,
            arr: arr
        };
    }

    private div(content:string='') {
        let tag = 'div';
        let className='';
        let ck = this.checkIfHasLink(this.figmaAPIData.name);
        let href= ck.href;
        if(ck.hasLink) {
            tag = 'a';
            className = `class="block_link"`;
        }
        // override links if table elements
        if(this.figmaAPIData.name && ['table','table_row','table_cell'].indexOf(this.figmaAPIData.name.toLowerCase())!==-1) {
            className = `class="${this.figmaAPIData.name.toLowerCase()}"`;
        }
        this.cssLayout();
        this.cssColor();
        this.imageBackground();
        return `<${tag}${href} ${className} style="${this.css()}" >${content}</${tag}>`;
    }

    private css(styles:any = this.styles):string {
        return Object.keys(styles).map((key)=>{
            return `${key}:${styles[key]}`;
        }).join(';');
    }

    private getColor(rgba:any, opacity?:number) {
        let _a = opacity!==undefined ? opacity.toFixed(2) : rgba.a;
        return `rgba(${Math.round(rgba.r * 255)},${Math.round(rgba.g * 255)},${Math.round(rgba.b * 255)},${_a})`;
    }
    
    // display position width height
    private cssLayout(def?:any, isImgNode?:any) {
        const data = this.figmaAPIData;
        //size
        const _style:any = Object.assign({
            display: 'block',
            position: 'relative'
        }, def, {
            width: Math.round(data.absoluteBoundingBox.width) + 'px',
            height: Math.round(data.absoluteBoundingBox.height) + 'px',
        });

        if(data.minWidth) {
            _style['min-width'] = Math.round(data.minWidth) + 'px';
        }
        if(data.minHeight) {
            _style['min-height'] = Math.round(data.minHeight) + 'px';
        }
        if(data.maxWidth) {
            _style['max-width'] = Math.round(data.maxWidth) + 'px';
        }
        if(data.maxHeight) {
            _style['max-height'] = Math.round(data.maxHeight) + 'px';
        }
        
        if(isImgNode) {
            if(data.layoutSizingHorizontal == 'FILL') {
                _style.width = '100%';
                _style.height = 'auto';
            }
        } else {
            switch(data.layoutSizingHorizontal) {
                case 'FILL':
                    _style.width = '100%';
                    break;
                case 'HUG':
                    _style.width = 'auto';
                case 'FIXED':
                    break;
            }
            switch(data.layoutSizingVertical) {
                case 'HUG':
                    _style.height = 'auto';
                case 'FILL':
                    break;
                case 'FIXED':
                    break;
            }
            // as container
            if(data.layoutMode === 'HORIZONTAL') {
                _style.display = 'flex';
                _style['flex-direction'] = 'row';
                _style['flex-wrap']= 'wrap'; 
                if(data.itemSpacing) {
                    _style.gap = data.itemSpacing + 'px';
                }
                _style.height = 'auto';
                Object.assign(_style, this.getFlex(true, data.primaryAxisAlignItems, data.counterAxisAlignItems, data.layoutAlign, data.constraints));
            } else if (data.layoutMode === 'VERTICAL') {
                _style.display = 'flex';
                _style['flex-direction'] = 'column';
                if(data.itemSpacing) {
                    _style.gap = Math.round(data.itemSpacing) + 'px';
                }
                Object.assign(_style, this.getFlex(false, data.primaryAxisAlignItems, data.counterAxisAlignItems, data.layoutAlign, data.constraints));
            }

            //padding with box
            if(data.paddingLeft) {
                _style['padding-left'] = data.paddingLeft + 'px';
            }
            if(data.paddingRight) {
                _style['padding-right'] = data.paddingRight + 'px';
            }
            if(data.paddingTop) {
                _style['padding-top'] = data.paddingTop + 'px';
            }
            if(data.paddingBottom) {
                _style['padding-bottom'] = data.paddingBottom + 'px';
            }
        }


        // lv1 nodes
        if(!this.parentLocaltion) {
            _style.width = '100%';
            _style.height = 'auto';
            _style.margin = '0 auto';
        } else if(this.parentLocaltion.layoutMode === 'NONE') {
            _style.position = 'absolute';
            _style.top = Math.round(data.absoluteBoundingBox.y - this.parentLocaltion.y)+'px';
            _style.left = Math.round(data.absoluteBoundingBox.x - this.parentLocaltion.x)+'px';
        } else {
            if(this.parentLocaltion.layoutMode === 'HORIZONTAL' && data.layoutSizingHorizontal === 'FILL') {
                _style.flex = '1';
            } else if(this.parentLocaltion.layoutMode === 'VERTICAL' && data.layoutSizingVertical === 'FILL') {
                _style.flex = '1';
            } else {
                _style.flex = 'none';
            }    
        }

        Object.assign(this.styles, _style);
    }

    private getFlex(isHORIZONTAL:boolean, main:any, second:any, layoutAlign:any, constraints:any) {
        let ret = {
            'justify-content': 'flex-start',
            'align-items': 'flex-start'
        }
        let constraintsMain = 'horizontal';
        let constraintsSecond = 'vertical';
        if(!isHORIZONTAL) {
            constraintsMain = 'vertical';
            constraintsSecond = 'horizontal'
        }

        let _aligns = {
            MIN: 'flex-start',
            TOP: 'flex-start',
            LEFT: 'flex-start',
            MAX: 'flex-end',
            BOTTOM: 'flex-end',
            RIGHT: 'flex-end',
            CENTER: 'center',
            SCALE: 'center',
            BASELINE: 'center',
            STRETCH: 'center',
            INHERIT: 'center'
        }

        if(main && _aligns[main]) {
            ret['justify-content'] = _aligns[main];
        } else {
            ret['justify-content'] = _aligns[constraints[constraintsMain]] || _aligns[layoutAlign] || 'flex-start';
        }

        if(second && _aligns[second]) {
            ret['align-items'] = _aligns[second];
        } else {
            ret['align-items'] = _aligns[constraints[constraintsSecond]] || _aligns[layoutAlign] || 'flex-start';
        }
        return ret;
    }

    private cssColor() {
        const data = this.figmaAPIData;
        const _style:any = {};
        if(Array.isArray(data.strokes) && data.strokes.length>0) {
            let _stroke  = data.strokes[0];
            if(_stroke.type==='SOLID' && _stroke.visible != false) {
                let _color = this.getColor(_stroke.color, _stroke.opacity);
                if(data.individualStrokeWeights) {
                    _style['border-top'] = `${Math.round(data.individualStrokeWeights.top)}px solid ${_color}`;
                    _style['border-right'] = `${Math.round(data.individualStrokeWeights.right)}px solid ${_color}`;
                    _style['border-buttom'] = `${Math.round(data.individualStrokeWeights.bottom)}px solid ${_color}`;
                    _style['border-left'] = `${Math.round(data.individualStrokeWeights.left)}px solid ${_color}`;
                } else if (data.strokeWeight) {
                    _style.border = `${Math.round(data.strokeWeight)}px solid ${_color}`;
                }
            }
        }
        if(Array.isArray(data.rectangleCornerRadii) && data.rectangleCornerRadii.length===4) {
            _style['border-radius'] = `${Math.round(data.rectangleCornerRadii[0])}px ${Math.round(data.rectangleCornerRadii[1])}px ${Math.round(data.rectangleCornerRadii[2])}px ${Math.round(data.rectangleCornerRadii[3])}px`;
        } else if (data.cornerRadius) {
            _style['border-radius'] = `${Math.round(data.cornerRadius)}px`
        }
        if(this.parentLocaltion) {
            if(Array.isArray(data.fills) && data.fills.length>0) {
                let _fill  = data.fills[0];
                if(_fill.type==='SOLID' && _fill.visible != false) {
                    let _color = this.getColor(_fill.color, _fill.opacity);
                    _style['background-color'] = _color;
                }
            } else if(Array.isArray(data.background) && data.background.length>0) {
                let _fill  = data.background[0];
                if(_fill.type==='SOLID' && _fill.visible != false) {
                    let _color = this.getColor(_fill.color,  _fill.opacity);
                    _style['background-color'] = _color;
                }
            }else if(data.backgroundColor) {
                let _color = this.getColor(data.backgroundColor,  data.opacity);
                _style['background-color'] = _color;
            }
        }
        Object.assign(this.styles, _style);
    }

    // stlye
    private cssFont(data=this.figmaAPIData, ifScanMore:boolean = false) {
        const _fStyle = data.style;
        if(_fStyle) {
            const _style:Record<string, any> = {};
            if(ifScanMore) {
                if(_fStyle.fontWeight !=undefined) _style['font-weight'] = _fStyle.fontWeight;
                if(_fStyle.fontSize !=undefined) _style['font-size'] = Math.round(_fStyle.fontSize)+'px';
                if(_fStyle.letterSpacing !=undefined) _style['letter-spacing'] = Math.round(_fStyle.letterSpacing)+'px';
                if(_fStyle.lineHeightPx !=undefined) _style['line-height'] = Math.round(_fStyle.lineHeightPx)+'px';
            }
            if(_fStyle.textAlignHorizontal !=undefined) _style['text-align'] = (_fStyle.textAlignHorizontal as string).toLowerCase();
            if(Array.isArray(data.fills) && data.fills.length>0) {
                let _fill  = data.fills[0];
                if(_fill.type==='SOLID' && _fill.visible != false) {
                    let _color = this.getColor(_fill.color,  _fill.opacity);
                    _style.color = _color;
                }
            }
            return _style;
        }
        return {};
    }
 
}
