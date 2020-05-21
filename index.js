
const fs = require('fs');
const http = require('http');
const path = require("path");
const cheerio = require('cheerio');
const util = require('util');
// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);
var csvWriter = require('csv-write-stream');

var csvFilename =  __dirname +"/file.csv";

var Folder = '/home/tungnt/Desktop/node/check-error-log/var_www_9prints_store_site_uniteelo_com_var_debug_13_May_2020_tar/debug/error';

//get all list floder error 
var folder_list = fs.readdirSync(Folder).map(file => {
    return file;
});

var data_dir = folder_list.map(dir => {
    return Folder+"/"+dir;
});

for(let i = 0; i < data_dir.length; i++) {
    
    var list_file_of_folder = fs.readdirSync(data_dir[i]).map(file => {
        return data_dir[i]+"/"+file;
    });
    getErrorMessageFileName(list_file_of_folder);
}

function getErrorMessageFileName(list_file_of_folder){
    if(Array.isArray(list_file_of_folder)){
        for(let i = 0; i < list_file_of_folder.length; i++){
            console.log(list_file_of_folder[i]);
            //var isFile =  readFile(folder_children+"/"+list_file_of_folder[i],'utf8');
            getStuff(list_file_of_folder[i],'utf8').then
            (data => {
                try {
                    var $ = cheerio.load(data);
                    var title = $('.global-info > td').map(function(){
                        return $(this).text().trim();
                    }).get();

                    let result = [];

                    for(let i = 0; i < title.length; i++){
                        if(title[i] == 'Error message'){
                            result[title[i]] = title[i] + ": " + title[i+1];
                        }
                        if(title[i] == 'Error file'){
                            result[title[i]] = title[i] + ": " + title[i+1];
                        }
                        if(title[i] == 'Server time'){
                            result[title[i]] = title[i] + ": " + title[i+1];
                        }
                        if(title[i] == 'Server IP'){
                            result[title[i]] = title[i] + ": " + title[i+1];
                        }
                        if(title[i] == 'Total process'){
                            result[title[i]] = title[i] + ": " + title[i+1];
                        }
                        if(title[i] == 'Total time'){
                            result[title[i]] = title[i] + ": " + title[i+1];
                        }
                        if(title[i] == 'Memory peak'){
                            result[title[i]] = title[i] + ": " + title[i+1];
                        }
                    }
                    result["Full error"] = title.join(' ');
                    
                    if (!fs.existsSync(csvFilename)) {
                        writer = csvWriter({sendHeaders: false});
                        writer.pipe(fs.createWriteStream(csvFilename));
                        writer.write({
                            header1: 'Server IP',
                            header2: 'Server time',
                            header3: 'Error message',
                            header4: 'Error file',
                            header5: 'Total process',
                            header6: 'Total time',
                            header7: 'Memory peak',
                            header8: 'file',
                            header9: 'Full path'
                        });
                        writer.end();
                    }
                    
                    
                    writer = csvWriter({sendHeaders: false});
                    writer.pipe(fs.createWriteStream(csvFilename, {flags: 'a'}));
                    writer.write({
                    header1: result['Server IP'],
                    header2: result['Server time'],
                    header3: result['Error message'],
                    header4: result['Error file'],
                    header5: result['Total process'],
                    header6: result['Total time'],
                    header7: result['Memory peak'],
                    header8: list_file_of_folder[i].split('/').slice(-1).pop(),
                    header9: list_file_of_folder[i],
                    });
                    writer.end();
                } catch (error) {
                    console.log(error);
                }
            }); 
        }
    }else{
        console.log('list file not is array');
    }
}

function getStuff(data) {
    return readFile(data,'utf8');
}

