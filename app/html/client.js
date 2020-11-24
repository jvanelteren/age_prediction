"use strict";

//  variables with multiple elements
let el = x => document.getElementById(x);
let style = getComputedStyle(document.body);
let faces = document.getElementsByClassName('age_human');
let comp = document.getElementsByClassName('age_pred_comp');
let actual = document.getElementsByClassName('age_pred_actual');
let rows = document.getElementsByClassName('rows');
let labels = document.getElementsByClassName('label');
let initial_state = true;

let baseurl;
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    // alert('local')
    baseurl = 'http://127.0.0.1:5000';
}
else {
    // alert('nonlocal')
    baseurl = '';
}

function submit_start() {
    reset()
    //  gets faces from server
    let xhr = new XMLHttpRequest();
    let url = baseurl + '/backend/get_images/'

    xhr.onload = function (e) {

        if (this.readyState === 4) {
            let response = JSON.parse(e.target.responseText);
            for (var i = 0; i < faces.length; i++) {
                let img = '<img src="' + response['faceids'][i] + '" class="img-thumbnail" alt="">';
                faces[i].innerHTML = img;
            }
            for (var i = 0; i < comp.length; i++) {
                comp[i].innerHTML = response['computer'][i];
            }
            for (var i = 0; i < actual.length; i++) {
                actual[i].innerHTML = response['actual'][i];
            }
            for (var i = 0; i < rows.length; i++) {
                rows[i].style.backgroundColor = style.getPropertyValue('--bg-light');
            }
            window.value = response['faceids'];
        };
    }
    xhr.onerror = function (e) { // only triggers if the request couldn't be made at all
        alert(`Network Error`);
        alert(e);
    };
    // to get around cors you can:
    // vscode make sure to debug with CORS enabled in launch.json "runtimeArgs": ["--disable-web-security"]
    // or install the cors middleware in fastapi
    xhr.open('GET', url, true);

    var faces = document.getElementsByClassName('face');

    xhr.send() // with optional [body]
}

function submit_preds() {
    // only allow submitting once
    if (!initial_state) { return };

    let xhr = new XMLHttpRequest();
    let url = baseurl + '/backend/submit_preds/'

    xhr.onload = function (e) {

        if (this.readyState === 4) {
            let response = JSON.parse(e.target.responseText);
            var won_from_comp = "You've beaten the computer on this batch!";
            var won_from_human = "Your score is better than the average score of other humans. The faces in this batch could have been easier, or you are just good at this!";
            var batch_difficulty = "The computer found the images in this batch easier than average";
            var overall_winner = "Overall, the computer is performing better than humans";
            var human_mae_batch = Math.round((total_delta_human / faces.length * 10)) / 10;
            var comp_mae_batch = Math.round((total_delta_computer / faces.length * 10)) / 10;
            response['mae_human'] = parseFloat(response['mae_human']);
            response['mae_comp'] = parseFloat(response['mae_comp']);

            if (comp_mae_batch < human_mae_batch) { won_from_comp = 'The computer performed better than you this batch' };
            if (response['mae_human'] < response['mae_comp']) { overall_winner = 'Overall, humans are ahead of the computer' };
            if (response['mae_human'] < human_mae_batch) { won_from_human = 'Other humans had a better score than you. The faces in this batch could be more difficult' };
            if (comp_mae_batch > response['mae_comp']) { batch_difficulty = 'The computer found the images in this batch more difficult than average' };

            el('result_preds').innerHTML = (
                won_from_comp + ' (Your MAE (Mean Absolute Error) ' + human_mae_batch + ' Computer MAE ' + comp_mae_batch + ')'
                + '<br><br>There are now ' + response['items_db'] + ' human predictions in the database'
                + '<br><br>' + overall_winner + ' (Human MAE ' + response['mae_human'] + ' Computer MAE ' + response['mae_comp'] + ')'
                + '<br><br>' + won_from_human
                + '<br><br>' + batch_difficulty);
        }
    };

    xhr.onerror = function () { // only triggers if the request couldn't be made at all
        alert(`Network Error`);
    };


    var arr = []
    // to loop you have to do it in this way
    // check for valid input
    for (var i = 0; i < faces.length; i++) {
        if (isNaN(faces[i].value)) { alert('please enter whole numbers between 0 and 120'); return; }
        if ((faces[i].value.length) == 0) { alert('please enter numbers between 0 and 120'); return; }
        if (faces[i].value < 0) { alert('please enter age above 0'); return; }
        if (faces[i].value > 120) { alert('please enter age below 120'); return; }
        arr.push(faces[i].value)
    }
    // make arrays to send to backend
    var arr_actual = []
    for (var i = 0; i < faces.length; i++) {
        arr_actual.push(actual[i].innerHTML);
    }
    var arr_comp = []
    for (var i = 0; i < faces.length; i++) {
        arr_comp.push(comp[i].innerHTML);
    }
    var total_delta_human = 0;
    var total_delta_computer = 0;
    for (var i = 0; i < faces.length; i++) {
        comp[i].style.display = 'table-cell' // to make visible
        actual[i].style.display = 'table-cell' // to make visible

        var delta_human = Math.abs(faces[i].value - actual[i].innerHTML);
        var delta_computer = Math.abs(comp[i].innerHTML - actual[i].innerHTML);
        total_delta_human += delta_human;
        total_delta_computer += delta_computer;
        var delta = (comp[i].value - actual[i].value);
        for (var j = i * 3; j < i * 3 + 3; j++) {
            if (delta_human < delta_computer) {
                rows[j].style.backgroundColor = style.getPropertyValue('--success');
            } else if (delta_human > delta_computer) {
                rows[j].style.backgroundColor = style.getPropertyValue('--danger');
            } else {
                rows[j].style.backgroundColor = style.getPropertyValue('--info');
            }
        }
    }

    for (var i = 0; i < labels.length; i++) {
        labels[i].style.display = 'table-cell'; // to make visible    
    };
    var obj = { 'age': arr, 'faceids': window.value, 'actual': arr_actual, 'comp': arr_comp };
    initial_state = false
    xhr.open('POST', url, true);
    xhr.send(JSON.stringify(obj)); // with optional [body]
}

function submit_image() {
    //get the input and the file
    var input = document.querySelector('input[type=file]'),
        file = input.files[0];
    let xhr = new XMLHttpRequest();
    let url = baseurl + '/backend/upload/'
    xhr.open("POST", url, true);

    //you are free to implement a fallback
    if (!file || !file.type.match(/image.*/)) alert('File not recognized as an image');
    el('img_predicted_age').innerHTML = 'Running the model, this can take a couple of seconds...'

    //Creates the FormData object and attach to a key name "file"
    var fd = new FormData();
    fd.append("file", file);

    xhr.onload = function (e) {
        //The response of de upload
        let response = JSON.parse(e.target.responseText);

        el('img_predicted_age').innerHTML = ('<br>Your estimated age is ' + response['status'] + '<br>Enjoy your wisdom and/or youthfullness!'
            + "<br>And remember: it's just a computer looking at pixels, you are as old as you feel &#128519;");

    }

    xhr.send(fd);
}

function reset() {
    initial_state = true
    for (var i = 0; i < faces.length; i++) {
        faces[i].value = '';
    }
    for (var i = 0; i < comp.length; i++) {
        comp[i].innerHTML = "";
        comp[i].style.display = 'none' // to make visible
    };
    for (var i = 0; i < actual.length; i++) {
        actual[i].innerHTML = "";
        actual[i].style.display = 'none' // to make visible
    };
    for (var i = 0; i < labels.length; i++) {
        labels[i].style.display = 'none' // to make visible
    };
    for (var i = 0; i < rows.length; i++) { rows[i].style.backgroundColor = style.getPropertyValue('--bg-light'); };
    var imgs = document.getElementsByClassName('face');
    el('result_preds').innerHTML = ""

    for (var i = 0; i < imgs.length; i++) { imgs[i].innerHTML = "" };
    return;

}

function click_participate() {
    el('upload').style.display = 'none';
    el('participate').style.display = 'block';
    submit_start();
    faces[0].focus();
}
function click_upload() {
    el('participate').style.display = 'none';
    el('upload').style.display = 'block';
    el('upload').focus();
}

function goto_blog() {
    window.open('https://jvanelteren.github.io/blog/2020/11/15/age_pure_pytorch.html', '_blank');
}

el('click_participate').addEventListener("click", click_participate);
el('click_upload').addEventListener("click", click_upload);
el('goto_blog').addEventListener("click", goto_blog);
el('submit_image').addEventListener("click", submit_image);
el('submit_preds').addEventListener("click", submit_preds);
el('reset').addEventListener("click", click_participate);