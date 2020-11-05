"use strict";

let el = x => document.getElementById(x);

function submit_start() {
    //  gets faces from server

    let xhr = new XMLHttpRequest();
    // let url = ('GET', `${loc.protocol}//${loc.hostname}:${loc.port}/get_images`)
    let url = 'http://127.0.0.1:8000/get_images/';
    
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            var style = getComputedStyle(document.body);
            let response = JSON.parse(e.target.responseText);
            // el('demo').innerHTML = `Result = ${response['result']}`;
            var faces = document.getElementsByClassName('face');
            for (var i = 0; i < faces.length; i++) {
                // textToWrite = faces[i].value;
                faces[i].innerHTML = response['faces'][i];
            }
            var comp = document.getElementsByClassName('age_pred_comp');
            for (var i = 0; i < comp.length; i++) {
                // textToWrite = faces[i].value;
                comp[i].style.display='none'
                comp[i].innerHTML = response['computer'][i];
            }
            var actual = document.getElementsByClassName('age_pred_actual');
            for (var i = 0; i < actual.length; i++) {
                // textToWrite = faces[i].value;
                actual[i].style.display='none'
                actual[i].innerHTML = response['actual'][i];
                actual[i].style.display='block' // to make visible
                actual[i].style.backgroundColor = style.getPropertyValue('--success');
            }
            // todo save ids to global variable to send back later to server
            window.value=response['faceids'];
    };
    }
    xhr.onerror = function () { // only triggers if the request couldn't be made at all
        alert(`Network Error`);
    };
    // vscode make sure to debug with CORS enabled in launch.json "runtimeArgs": ["--disable-web-security"]
    xhr.open('GET', url, true);
    // build js object and later json stringify that

    // 2ways to select multiple elements
    // var textBoxes = document.querySelectorAll('[id^=textbox]');
    // var elements = document.getElementsByClassName('yourClassNameHere');
    
    var faces = document.getElementsByClassName('face');

    // for(var i in faces){
    //     // textToWrite = faces[i].value;
    //     faces[i].innerHTML = 'bla';
    // }




    xhr.send() // with optional [body]
}

function submit_preds() {
    let age_pred = document.getElementById('age_pred_human_0').innerHTML;
    

    document.getElementById('age_pred_human_0').innerHTML = 'human';
    document.getElementById('age_pred_comp_0').innerHTML = 'computer';
    document.getElementById('age_pred_actual_0').innerHTML = 'actual';
    
    let xhr = new XMLHttpRequest();
    let url = 'http://127.0.0.1:8000/submit_preds/';
    
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            
            // let response = JSON.parse(e.target.responseText);
            //     // el('demo').innerHTML = `Result = ${response['result']}`;
            }
    };

    xhr.onerror = function () { // only triggers if the request couldn't be made at all
        alert(`Network Error`);
    };
    // vscode make sure to debug with CORS enabled in launch.json "runtimeArgs": ["--disable-web-security"]
    xhr.open('POST', url, true);



    var faces = document.getElementsByClassName('age_human');
    var arr = []
    // to loop you have to do it in this way
    for (var i = 0; i < faces.length; i++) {
        arr.push(faces[i].value)
    }

    var obj = {'age':arr, 'faceids':window.value}
    console.log(obj)
    xhr.send(JSON.stringify(obj)) // with optional [body]
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




document.getElementById('select_image').addEventListener("click", select_image)
document.getElementById('submit_image').addEventListener("click", submit_image)
document.getElementById('submit_preds').addEventListener("click", submit_preds)
document.getElementById('submit_start').addEventListener("click", submit_start)

