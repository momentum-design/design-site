# About this repo

This is a repo which helps to convert figma files to Website. This repo will deploy a static angular website in gh-pages.

# How to Use?

## Config Figma File

### Config ```figma/config.json```

```
{
    "files": {
        "components": {
            "file": "YOUR FIGMA FILE ID for components",
            "page": "✅", // node start with this text will be scanned.
            "tab": "💻",  // node start with this text will be a tab in page
            "banner": "🏷️", // node start with this text will be banner in page
            "image": "🖼️" // node start with this text will be converted into image
        },
        "design_guidelines": {
            "file": "YOUR FIGMA FILE ID for design_guidelines",
            "page": "✅",
            "tab": "💻",
            "banner": "🏷️",
            "image": "🖼️"
        },
    },
    "settings": {
        "exportImage": {
            "format": "svg",  // the format we export images
            "scale": 1 // the scale of images, for PNG in high resolution devices
        },
        "fonts": { // pre defined font tag / classnames
            "h1":"h1",
            "h2":"h2",
            "h3":"h3",
            "h4":"h4",
            "h5":"h5",
            "h6":"h6",
            "p":"p",
            "p_bold":"p_bold",
            "p_large":"p_large",
            "p_large_bold":"p_large_bold",
            "p_small":"p_small",
            "a":"a"
        },
        "containers":{ // node which will be converted into div
            "🏷️ banner":"🏷️ banner",
            "table":"table",
            "table_row":"table_row",
            "table_cell":"table_cell"
        },
        "hyperlinkSeparator":"@@" // the node name with @@ will be convert into a tag. the string after @@ will be the link.
    }
}
```

### Set Code

1. Go to ```src/scss/article.scss``` to edit the style in article.

2. Edit ```src/app/app-routing.modules.ts``` for navigation

## Prepare Figma Data

1. Use auto layout for flex layout

2. The '💻' nodes' order will be the tab order

3. Use 'h2' component will creat archor links on the right

4. The page '✅ Index' will create a index/ home page

## Run script online

### 1. Go to github settings > Security / Secrets and variables.

1) Create new repository secret 'ACTION_TOKEN' with your github personal token.

2) Create new repository secret 'FIGMA_TOKEN' with your figma token.

### 2. Go to github action, click action 'Publish Website customize'.

1) Click 'Run workflow'. 

2) Select 'Branch Main'

3) Input your website url into the baseHref input box. (Could be GH-Pages urls or the domain you set)

### 3. After the action finished, check your website

## Run script locally

1. Create a file under __local folder. 

```__local folder/figma.json``` 

2. Update figma.json

```
    {
        "token": "YOUR TOKEN HERE"
    }
```

3. In CMD / terminal, RUN `npm run figma` to get data

4. Run `npm run start` to start local website server.

