const jsdom = require("jsdom");
var fs = require("fs");
const translate = require('@vitalets/google-translate-api');
const {
    JSDOM
} = jsdom;
var htmlPath = 'htmlPath';
fs.readFile(htmlPath + 'vdt-aps-template.html', 'utf8', function (err, html) {
    const dom = new JSDOM(html);

    var obj = {};
    var count = 0;
    var pageId = 'html';
    getNodeList(dom.window.document.getElementById(pageId)).forEach((e) => {
        if (!e.childNodes.length && e.textContent && e.textContent.trim() 
                && e.textContent.trim().replace(/[.\%\-\:)\(\/\\’0-9]+/g,"")
                && ['CODE', 'SCRIPT'].indexOf(e.parentElement.tagName) < 0) {
            var temp = e.textContent.replace(/\n/g, " ").replace(/\t/g, "");
            var key = temp.split(" ").slice(0, 2).join('_') + "_" + temp.length;
            obj[key.replace(/[.\-\:)\(\/\\’]+/g,"")] = temp;
            e.parentElement.setAttribute('data-localize', key.replace(/[.\-\:)\(\/\\’]+/g,""));
            count++;
        }
    });
    fs.writeFile(htmlPath + 'vdt-aps.html', dom.serialize(), (err) => {
        if(err) {
            return console.log(err);
        }
        console.log("HTML saved");
    });
    // fs.writeFile(htmlPath + '/assets/lang/aps-en.json', JSON.stringify(obj, null, 4), (err) => {
    //     if(err) {
    //         return console.log(err);
    //     }
    //     console.log("JSON saved");
    //     translateJSON(obj, 'de');
    // });
});

function getNodeList(elem) {
    var l = new Array(elem),
        c = 1,
        ret = new Array();
    //This first loop will loop until the count var is stable//
    for (var r = 0; r < c; r++) {
        //This loop will loop thru the child element list//
        for (var z = 0; z < l[r].childNodes.length; z++) {

            //Push the element to the return array.
            ret.push(l[r].childNodes[z]);

            if (l[r].childNodes[z].childNodes[0]) {
                l.push(l[r].childNodes[z]);
                c++;
            } //IF           
        } //FOR
    } //FOR
    return ret;
}

function translateJSON(json, lang){
    let newJSON = {};
    for (var key in json) {
        if (json.hasOwnProperty(key)) {
            setTimeout(() => {
                translate(json[key], {from: 'en', to: lang}).then(function(res) {
                    newJSON[key] = res.text;
                    //if (Object.keys(newJSON).length == Object.keys(json).length) {
                        writeJSON(newJSON, lang);
                    //}
                }).catch(err => {
                    console.error(err);
                });   
            }, 1000);
        }
    }
}

function writeJSON(objec, lang) {
    fs.writeFile(htmlPath + '/assets/lang/aps-'+ lang +'.json', JSON.stringify(objec, null, 4), (err) => {
        if(err) {
            return console.log(err);
        }
        console.log("JSON saved " + lang);
    });
}
