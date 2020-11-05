"use strict";

let el = x => document.getElementById(x);

function submit_start() {
    alert('submit_start');
    document.getElementById('face_0').innerHTML = 'face_picture';

    let xhr = new XMLHttpRequest();
    // let url = ('GET', `${loc.protocol}//${loc.hostname}:${loc.port}/get_images`)
    let url = 'http://127.0.0.1:8000/get_images/';
    
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            let response = JSON.parse(e.target.responseText);
            // el('demo').innerHTML = `Result = ${response['result']}`;
            document.getElementById('output').innerHTML = response['msg'];
    };
    }

    xhr.onerror = function () { // only triggers if the request couldn't be made at all
        alert(`Network Error`);
    };
    // vscode make sure to debug with CORS enabled in launch.json "runtimeArgs": ["--disable-web-security"]
    xhr.open('POST', url, true);
    // build js object and later json stringify that


    var textBoxes = document.querySelectorAll('[id^=textbox]');
var textToWrite;
for(var i in textBoxes){
   textToWrite = textBoxes[i].value;
   /* do your thing */
}


var elements = document.getElementsByClassName('yourClassNameHere');

for (var i = 0, length = elements.length; i < length; i++) {

    
    for(...) {
       obj.faces = 'newValue';
       obj.faces = 'newValue';
    }    

    var obj = {'user':'erson', 'pwd':'pwsdher','organization':'dsjfkdl','requiredkey':'2113'}
    xhr.send(JSON.stringify(obj)) // with optional [body]
}

function submit_preds() {
    let age_pred = document.getElementById('age_pred_human_0').innerHTML;
    
    alert('submit_preds');

    document.getElementById('age_pred_human_0').innerHTML = 'human';
    document.getElementById('age_pred_comp_0').innerHTML = 'computer';
    document.getElementById('age_pred_actual_0').innerHTML = 'actual';
    
    let xhr = new XMLHttpRequest();
    // let url = ('GET', `${loc.protocol}//${loc.hostname}:${loc.port}/get_images`)
    let url = 'http://127.0.0.1:8000/submit_preds/';
    
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            alert(`Loaded`)
            
            document.getElementById(0).innerHTML = loc
            document.getElementById(2).innerHTML = "blaaa";
            let response = JSON.parse(e.target.responseText);
            document.getElementById(2).innerHTML = "blaaa";
                // el('demo').innerHTML = `Result = ${response['result']}`;
            }
    };

    xhr.onerror = function () { // only triggers if the request couldn't be made at all
        alert(`Network Error`);
    };
    // vscode make sure to debug with CORS enabled in launch.json "runtimeArgs": ["--disable-web-security"]
    xhr.open('POST', url, true);
    xhr.send('user=person&pwd=password&organization=place&requiredkey=key');
}

function select_image() {
    alert('select_image');


} 

function submit_image() {
    alert('submit_image');

    document.getElementById('img_predicted_age').innerHTML = 'predicted age';
    
    let xhr = new XMLHttpRequest();
    // let url = ('GET', `${loc.protocol}//${loc.hostname}:${loc.port}/get_images`)
    let url = 'http://127.0.0.1:8000/app/get_images/';
    
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            alert(`Loaded`)
            
            document.getElementById(0).innerHTML = loc
            document.getElementById(2).innerHTML = "blaaa";
            let response = JSON.parse(e.target.responseText);
            document.getElementById(2).innerHTML = "blaaa";
                // el('demo').innerHTML = `Result = ${response['result']}`;
            }
    };

    xhr.onerror = function () { // only triggers if the request couldn't be made at all
        alert(`Network Error`);
    };
    // vscode make sure to debug with CORS enabled in launch.json "runtimeArgs": ["--disable-web-security"]
    xhr.open('GET', url, true);
    xhr.send([]) // with optional [body]
} 


function analyze() {
    if (el('selected_game').value === "") {
        alert('Select a game to find similar ones');
        return;
    }
    el('analyze-button').innerHTML = 'Looking for games...';
    let xhr = new XMLHttpRequest();
    // let loc = window.location
    let url = ('POST', `${loc.protocol}//${loc.hostname}:${loc.port}/analyze`)
    if (loc.hostname == '') {
        url = 'http://localhost:5042/analyze';
    }
    xhr.open('POST', url, true);
    xhr.onerror = function () {
        alert('server appears down', xhr.responseText);
        el('analyze-button').innerHTML = 'Analyze';
    }
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            let response = JSON.parse(e.target.responseText);
            // el('demo').innerHTML = `Result = ${response['result']}`;
            fillGameTable(response['result']);
        }
        el('analyze-button').innerHTML = 'Analyze';
    }

    let fileData = new FormData();
    // alternative to look at text instead of value. options can also be left out
    fileData.append('selected_game', encodeURIComponent(el('selected_game').value));
    fileData.append('num_reviews', el('num_reviews').options[el('num_reviews').selectedIndex].value);
    fileData.append('num_similar_games', el('num_similar_games').options[el('num_similar_games').selectedIndex].value);
    xhr.send(fileData);

}


document.getElementById('select_image').addEventListener("click", select_image)
document.getElementById('submit_image').addEventListener("click", submit_image)
document.getElementById('submit_preds').addEventListener("click", submit_preds)
document.getElementById('submit_start').addEventListener("click", submit_start)



// populating the gamelist. This is commented out because the datalist is static html since I don't want to query the server for this every time
// populate_game_list()




// table

/* 
   Willmaster Table Sort
   Version 1.1
   August 17, 2016
   Updated GetDateSortingKey() to correctly sort two-digit months and days numbers with leading 0.
   Version 1.0, July 3, 2011

   Will Bontrager
   https://www.willmaster.com/
   Copyright 2011,2016 Will Bontrager Software, LLC

   This software is provided "AS IS," without 
   any warranty of any kind, without even any 
   implied warranty such as merchantability 
   or fitness for a particular purpose.
   Will Bontrager Software, LLC grants 
   you a royalty free license to use or 
   modify this software provided this 
   notice appears on all copies. 
*/
//
// One placed to customize - The id value of the table tag.

// var TableIDvalue = "";

//
