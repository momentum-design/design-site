import { FigmaNodeType, ConvertTagType, IDomTreeNode, IHtmlArchor, ILocaltion, IConfigItem, IConfigSettings } from '../types';
import { NodeConvertor } from './nodeConvertor';
import { ComponentsLib } from './componentsLib';

// for tabs or banner
export class SectionConvertor {

    nodeId:string;
    sectionFigmaData:any;
    imgUrls:Record<string, string>={};
    archors:Record<string, IHtmlArchor>={};
    archorsIdInOrder: string[];
    domTree: IDomTreeNode;
    configKey:string;
    componentsLib:ComponentsLib;
    config:IConfigItem;
    configSettings: IConfigSettings;

    constructor(nodeId:string, sectionFigmaData:any, configKey:string, config:IConfigItem, configSettings: IConfigSettings, componentsLib:ComponentsLib) {
        this.nodeId = nodeId;
        this.sectionFigmaData = sectionFigmaData;
        this.configKey = configKey;
        this.configSettings = configSettings;
        this.config = config;
        this.componentsLib = componentsLib;
        this.componentsLib.update(this.sectionFigmaData);
    }

    _sortArchors(a:IHtmlArchor, b:IHtmlArchor) {
        return a.y - b.y;
    }

    html():string {
        // build dom
        this.domTree = this.preBuildDomTreeNode(this.sectionFigmaData.document);
        let html = this.renderHTML(this.domTree);
        this.archorsIdInOrder = Object.values(this.archors)
        .sort(this._sortArchors)
        .map((ac:IHtmlArchor)=>{
            return ac.htmlId;
        });
        return html;
    }

    private getVisibleNodes(node) {
        if(!Array.isArray(node.children)) {
            return [];
        }
        return node.children.filter((n)=>{
            return n.visible !== false;
        });
    }

    private preBuildDomTreeNode(node:any):IDomTreeNode {
        
        //root node should be visiable

        if(node.name.indexOf(this.config.image)!==-1) {
            return {
                figmaAPIData: node,
                type: ConvertTagType.img,
                needKeep: true
            }
        }

        // text
        if(node.type === FigmaNodeType.TEXT) {
            return {
                type: ConvertTagType.text,
                figmaAPIData: node,
                needKeep: true
            }
        }

        let visiableChildren = this.getVisibleNodes(node);

        let ifConvertToContainer = this.componentsLib.isContainerName(node.name);
        // component node
        if(!ifConvertToContainer && (node.type === FigmaNodeType.COMPONENT || node.type === FigmaNodeType.INSTANCE)) {
            if(visiableChildren.length===1 && visiableChildren[0].type === FigmaNodeType.TEXT) {
                let componentName = node.name;
                //use component's name to replace instance's name
                if(node.type === FigmaNodeType.INSTANCE && node.componentId) {
                    componentName = this.componentsLib.getFontName(node.componentId);
                }
                return {
                    figmaAPIData: node,
                    type: ConvertTagType.container,
                    children: [{
                        figmaAPIData: visiableChildren[0],
                        textComponentName: componentName,
                        type: ConvertTagType.text,
                        needKeep: true
                    }],
                    needKeep: true
                }
            } else {
                return {
                    figmaAPIData: node,
                    type: ConvertTagType.img,
                    needKeep: false
                }
            }
        }

        // container
        if(ifConvertToContainer || node.type === FigmaNodeType.FRAME 
        || node.type === FigmaNodeType.GROUP 
        || node.type === FigmaNodeType.CANVAS 
        || node.type === FigmaNodeType.DOCUMENT
        || node.type === FigmaNodeType.SECTION ) {
            if(visiableChildren.length>0) {
                let _needKeep = false;
                let _domChildren:IDomTreeNode[] = [];
                visiableChildren.forEach((child:any)=>{
                    let _domNode = this.preBuildDomTreeNode(child);
                    if(_domNode.needKeep) {
                        _needKeep = true;
                    }
                    _domChildren.push(_domNode);
                });
                _needKeep = ifConvertToContainer || _needKeep;
                return {
                    figmaAPIData: node,
                    type: _needKeep? ConvertTagType.container : ConvertTagType.img,
                    children: _domChildren,
                    needKeep: _needKeep
                }
            } else {
                return {
                    figmaAPIData: node,
                    type: ConvertTagType.container,
                    needKeep: false
                }
            }
        }

        // others
        return {
            figmaAPIData: node,
            type: ConvertTagType.img,
            needKeep: false
        }
    }

    private renderHTML(node:IDomTreeNode, parentLocaltion?: ILocaltion):string {
        let content = '';
        if(node.type === ConvertTagType.container 
            && node.children 
            && node.children.length>0) {
            // maybe need sort
            const contentArr = node.children.map((child:IDomTreeNode)=>{
                return this.renderHTML(child, Object.assign({
                    layoutMode: node.figmaAPIData.layoutMode || 'NONE'
                }, node.figmaAPIData.absoluteBoundingBox));
            });
            content = contentArr.join('');
        }
        
        let nc = new NodeConvertor(node, this.configKey, this.configSettings, this.componentsLib, parentLocaltion);
        let html = nc.html(content);
        this.updateImgsAndArchors(nc.imgUrls, nc.archors);
        return  html;
        
    }

    updateImgsAndArchors(imgUrls:Record<string, string>,archors:Record<string, IHtmlArchor>) {
        Object.assign(this.imgUrls, imgUrls);
        Object.assign(this.archors, archors);
    }

}