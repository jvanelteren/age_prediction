"use strict";

let el = x => document.getElementById(x);
var style = getComputedStyle(document.body);
var faces = document.getElementsByClassName('age_human');
var comp = document.getElementsByClassName('age_pred_comp');
var actual = document.getElementsByClassName('age_pred_actual');
var rows = document.getElementsByClassName('rows');

function submit_start() {
    //  gets faces from server

    let xhr = new XMLHttpRequest();
    // let url = ('GET', `${loc.protocol}//${loc.hostname}:${loc.port}/get_images`)
    let url = 'http://127.0.0.1:8000/get_images/';
    
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            let response = JSON.parse(e.target.responseText);
            // el('demo').innerHTML = `Result = ${response['result']}`;
            for (var i = 0; i < faces.length; i++) {
                // textToWrite = faces[i].value;
                faces[i].innerHTML = response['faces'][i];
            }
            for (var i = 0; i < comp.length; i++) {
                // comp[i].style.display='none'
                comp[i].innerHTML = response['computer'][i];
            }
            for (var i = 0; i < actual.length; i++) {
                // actual[i].style.display='none'
                actual[i].innerHTML = response['actual'][i];
            }
            for (var i = 0; i < rows.length; i++) {
                // actual[i].style.display='none'
                rows[i].style.backgroundColor = style.getPropertyValue('--bg-light');
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




    
    var arr = []
    // to loop you have to do it in this way
    for (var i = 0; i < faces.length; i++) {
        arr.push(faces[i].value)
        comp[i].style.display='table-cell' // to make visible
        actual[i].style.display='table-cell' // to make visible

        var delta_human = Math.abs(faces[i].value - actual[i].innerHTML);
        var delta_computer = Math.abs(comp[i].innerHTML - actual[i].innerHTML);
        console.log(delta_computer);
        console.log(delta_human);


        var delta = (comp[i].value - actual[i].value)
        if (delta_human < delta_computer) {
            //  block of code to be executed if condition1 is true
            rows[i].style.backgroundColor = style.getPropertyValue('--success');
        } else if (delta_human > delta_computer) {
            rows[i].style.backgroundColor = style.getPropertyValue('--danger');
            //  block of code to be executed if the condition1 is false and condition2 is true
        } else {
            rows[i].style.backgroundColor = style.getPropertyValue('--info');
            //  block of code to be executed if the condition1 is false and condition2 is false
          }

        // actual[i].style.backgroundColor = style.getPropertyValue('--success');
        // comp[i].style.backgroundColor = style.getPropertyValue('--danger');
        // faces[i].style.backgroundColor = style.getPropertyValue('--danger');
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

