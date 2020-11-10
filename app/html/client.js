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
    xhr.timeout = 10000;
    // let url = ('GET', `${loc.protocol}//${loc.hostname}:${loc.port}/get_images`)
    // let url = 'http://34.121.58.11/app/get_images/';
    // let url = '/backend/get_images/';
    let url
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        url = 'http://127.0.0.1:5000/backend/get_images/';
        alert('local')
    }
    else {
        alert('nonlocal')

        url = '/backend/get_images/';
    }



    console.time('Execution Time');
    xhr.onload = function (e) {

        if (this.readyState === 4) {
            console.timeEnd('Execution Time');
            // alert('binnen!!!!');
            // alert(e.target.responseText);
            let response = JSON.parse(e.target.responseText);
            // alert(response['faces'][0]);
            // alert(response['faceids'][0]);
            // el('demo').innerHTML = `Result = ${response['result']}`;
            for (var i = 0; i < faces.length; i++) {
                // textToWrite = faces[i].value;
                let img = '<img src="' + response['faceids'][i] + '" class="rounded-circle" alt="">';
                faces[i].innerHTML = img;
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
            window.value = response['faceids'];
        };
    }
    xhr.onerror = function (e) { // only triggers if the request couldn't be made at all
        alert(`Network Error`);
        alert(e);
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


    xhr.timeout = 10000;

    xhr.send() // with optional [body]
    xhr.timeout = 10000;

}

function submit_preds() {


    let xhr = new XMLHttpRequest();
    let url = '/backend/submit_preds/';

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
        if (isNaN(faces[i].value)) { alert('please enter whole numbers between 0 and 120'); return; }
        if ((faces[i].value.length) == 0) { alert('please enter numbers between 0 and 120'); return; }
        if (faces[i].value < 0) { alert('please enter age above 0'); return; }
        if (faces[i].value > 120) { alert('please enter age below 120'); return; }
        arr.push(faces[i].value)

    }


    for (var i = 0; i < faces.length; i++) {
        comp[i].style.display = 'table-cell' // to make visible
        actual[i].style.display = 'table-cell' // to make visible

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

    var obj = { 'age': arr, 'faceids': window.value }
    console.log(obj)
    xhr.send(JSON.stringify(obj)) // with optional [body]


}

function submit_image() {

    //get the input and the file
    var input = document.querySelector('input[type=file]'),
        file = input.files[0];
    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/backend/upload/", true);


    //if the file isn't a image nothing happens.
    //you are free to implement a fallback
    if (!file || !file.type.match(/image.*/)) alert('hoooes');

    //Creates the FormData object and attach to a key name "file"


    var fd = new FormData();
    fd.append("file", file);




    xhr.onload = function (e) {
        //The response of de upload
        alert(xhr.responseText);
        xhr.responseText;

    }

    xhr.send(fd)
    alert(document.getElementById('upload').value)
}

document.getElementById('submit_image').addEventListener("click", submit_image)
document.getElementById('submit_preds').addEventListener("click", submit_preds)
document.getElementById('submit_start').addEventListener("click", submit_start)
