const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const http = require('http');
const path = require("path");
const cheerio = require('cheerio');
const util = require('util');
// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);
var csvWriter = require('csv-write-stream');
var csvFilename = "/home/tungnt/Desktop/Nodejs/checkerror/file.csv";

let Folder = '/home/tungnt/Desktop/Nodejs/checkerror/var_www_9prints_store_site_uniteelo_com_var_debug_13_May_2020_tar/debug/error';

const _dirFloder = 'var_www_9prints_store_site_uniteelo_com_var_debug_13_May_2020_tar/debug/error';

// get all list floder error 
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
// console.log(data_dir);

// var list_file_of_folder = fs.readdirSync(folder_children).map(file => {
//     return file;
// });

// console.log(list_file_of_folder);
//getErrorMessageFileName(list_file_of_folder);

function getErrorMessageFileName(list_file_of_folder){
    if(Array.isArray(list_file_of_folder)){
        for(let i = 0; i < list_file_of_folder.length; i++){
            console.log(list_file_of_folder[i]);
            //var isFile =  readFile(folder_children+"/"+list_file_of_folder[i],'utf8');
            getStuff(list_file_of_folder[i],'utf8').then
            (data => {
            // console.log(data);
                try {
                    var $ = cheerio.load(data);
                    //var title = $('.global-info').children().text();
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
                    }
                    result["Full error"] = title.join(' ');
                    
                    if (!fs.existsSync(csvFilename)) {
                        writer = csvWriter({sendHeaders: false});
                        writer.pipe(fs.createWriteStream(csvFilename));
                        writer.write({
                            header1: 'name_file',
                            header2: 'dir_name',
                            header3: 'error_message',
                            header4: 'error_file',
                            header5: 'full_error'
                        });
                        writer.end();
                    }
                    
                    
                    writer = csvWriter({sendHeaders: false});
                    writer.pipe(fs.createWriteStream(csvFilename, {flags: 'a'}));
                    writer.write({
                    header1: list_file_of_folder[i].split('/').slice(-1).pop(),
                    header2: list_file_of_folder[i],
                    header3: result['Error message'],
                    header4: result['Error file'],
                    header5: result['Full error']
                    });
                    writer.end();
                    // return result;
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

// https://stackoverflow.com/questions/46867517/how-to-read-file-with-async-await-properly


app.listen(port, () => {console.log('app listen port' + port);});