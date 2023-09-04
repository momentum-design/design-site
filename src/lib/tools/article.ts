class _Article {

    paths_assets: string = 'assets/figma';

    constructor() {

    }

    fetch(navType:string, pageID:string):Promise<any> {
        const url = `${this.paths_assets}/${navType}/data/${pageID}.json`;
        return fetch(url).then((response) => response.json());
    }
    
}

export const Article = new _Article();
