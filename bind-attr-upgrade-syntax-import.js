let fs = require('fs'),
    glob = require('glob');

let dirName = '';

let changeHandlebarsSyntaxToHtmlbars = (attrName, props) => {
    let properties = props.split(' ');
    let newAttr = '';
    for(let i = properties.length - 1; i >= 0; i -= 1) {
        if(properties[i]) {

            if(properties[i][0] === ':') {
                 newAttr += properties[i].substring(1) + ' ';
            } else {
                let bindProps = properties[i].split(':');
                if(bindProps[1] || bindProps[2]) {
                    newAttr += `{{if ${bindProps[0]}`;
                    if(bindProps[1]) {
                        newAttr += ` '${bindProps[1]}'`;
                    }
                    if(bindProps[2]) {
                        if(!bindProps[1]) {
                            newAttr += ' \'\'';
                        }
                        newAttr += ` '${bindProps[2]}'`;
                    }
                    newAttr += '}} ';
                } else {
                    newAttr += `{{${bindProps[0]}}} `;
                }
            }
        }
    }
    return `${attrName}="${newAttr.trim()}"`;
}

let replaceData = (data, replaces) => {
    result = data;
    for(let i = replaces.length - 1; i >= 0; i -= 1) {
        result = result.replace(replaces[i].currentAttr, replaces[i].newAttr);
    }
    return result;
};

let pasrse = data => {
 let regexp = /\{\{bind-attr(.|\n)*?}}/g;
 let bindAttrs = data.match(regexp);
 if(!bindAttrs) return;
 let replaces = [];
 for(let i = bindAttrs.length - 1; i >= 0; i -= 1) {
     let tagAttr = bindAttrs[i].match(/\s(.|\n)*?=\"(.|\n)*?\"/g);
     let newAttrs = '';
     if(!tagAttr) continue;
     for(let k = tagAttr.length - 1; k >= 0; k -= 1) {
         let attr = tagAttr[k].split('=');
         let attrName = attr[0].trim();
         let props = attr[1].split('\"').join('');
         newAttrs += changeHandlebarsSyntaxToHtmlbars(attrName, props) + ' ';
         replaces.push({
             currentAttr: bindAttrs[i],
             newAttr: newAttrs.trim()
         });
     }
 }
 return replaceData(data, replaces);
};

glob(dirName, {}, (er, files) => {
    files.forEach(filename => {
        fs.readFile(filename, 'utf8', (err, data) => {
          if (err) {
            return console.log(err);
          }
          let result = pasrse(data);
          if(!result) return;
          fs.writeFile(filename, result, 'utf-8', err => {
              if (err) throw err;
              console.info(`${filename} complete`);
            });
        });
    });
});
