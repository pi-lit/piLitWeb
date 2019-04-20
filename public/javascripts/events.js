// LOGIC GLOBALS
const ledList = [];
var tester = 0; // for building command array
var timePosition = 0; // for building command array
var socket = {};
var flashBol = false;
var commandList = [];
var rainbowCounter = 0;
var customCounter = 0;
var blockerBol = true; // attemot to stop multiple button press
$(function() {
	//Call login when the login button is clicked
	document.getElementById('loginBtn').onclick = function() {
		connect().emit('login', {'userName': $('#username').val(),
		'password': $('#password').val()} );
		return false;
	}

	//Load registration page
	$('#registerDir').click(function(){
		$('#mainContent').load("/partials/register.html", function() {
			document.getElementById("registerBtn").onclick = function() {
				connect().emit('register', {
					'userName': $('#username').val(),
					'password': $('#password').val(),
					'email': $('#email').val()});
				return false;
			}
		});
	});
});

function connect() {

	socket = io.connect("https://pi-lit.herokuapp.com");

	socket.on('login', function(user) {
		if(user.error != "") {
			document.getElementById('errormsg').innerHTML = user.error;
		} else {
			console.log(user);
			$('#mainContent').load("/partials/profile.html", () => {displayProfile(user)});
		}
	});

	//Handle register function
	socket.on('register', function(user) {
		if(user.error != "") {
			document.getElementById('errormsg').innerHTML = user.error;
		} else {
			console.log(user);
			$('#mainContent').load("/partials/profile.html",  () => {displayProfile(user)});
		}
	});

	socket.on('saveConfig', function(res) {
		if(res.error != "") {
			console.log('Received response');
		} else {
			console.log(res);
		}
	});

	return socket;
}

function displayProfile(user) {
	//Defining our buttons
	let COLOR_PICKER = $('.color-picker');
	let APPLY_BUTTON = $('#applyBtn');
	let SAVE_BUTTON = $('#save');
	let TIME = $('#time-input');
	COLOR_PICKER[0].addEventListener("change", watchColorPicker, false);
	let ledNum = 30;

	//Set bulbs and color wheel
	//Populate user info
	var strip = [];
	document.getElementById('username').innerHTML = user.userName;
	document.getElementById('password').innerHTML = user.password;
	document.getElementById('email').innerHTML = user.email;
	initLeds(ledNum);
	prevInitLeds(ledNum);
	addLedListeners();

	$('#configureBtn').click(() => {
		var selectRange = setConfigModal(ledNum);
		APPLY_BUTTON.click(() => {
			console.log(TIME);
				if (parseInt(TIME.val()) === 0){
				commandList[tester] = applySetting(selectRange);
				tester++;
			}
				if(TIME.val() > 0){
					commandList[tester-1].timestamps[timePosition] = applySetting(selectRange);
					timePosition++;
					console.log("timestamps")
				}
				console.log(commandList);
				selectRange = 0;
		});
	});

	document.getElementById('changeBulbBtn').onclick = function() {
		var bulbCount = document.getElementById("bulbCount").value;
		strip = setBulbs(bulbCount);
	}
	$('#myModal').on('hide.bs.modal', function (e) {
		$('#selected-led-rep').empty();
		for(let i=0; i<ledList.length; i++) {
			if (ledList[i].data().selected === true) {
                ledList[i].data('selected', false);
                ledList[i].removeClass('selected');
            }
		}
		TIME.val(0); // resets time to 0
		timePosition = 0;
		console.log("clear time")
	});


	$('#previewBtn').click(() => {
		console.log("-----------here------------");
		console.log(commandList);
		$('#previewModal').on('show.bs.modal', function (e) {
			if(blockerBol){ // trying to prevent multiple calls
				blockerBol = false;
				previewLights(commandList);
				}
			});
		});
		$('#previewModal').on('hide.bs.modal', function (e) {
			blockerBol = true;
		});

}

function saveConfig(username, strip) {
	console.log(strip);
	connect().emit('saveConfig', {
		'userName': username,
		'configName': $('#configName').val(),
		'rpArray': strip
	});
	return false;
}


//create led dom elements - add to the ledList array - append to LED_REP dom element
function initLeds(ledNum) {
    for (let i = 0; i < ledNum; i++) {
        var led = $('<div class="led uncolored" id="led'+i+'">'+i+'</div>');
        led.data('selected', false);
        ledList.push(led);
        $('.led-rep').append(led);
    }
}
//create previewled dom elements - add to the ledList array - append to LED_REP dom element
function prevInitLeds(ledNum) {
    for (let i = 0; i < ledNum; i++) {
        var led = $('<div class="led uncolored" id="prevLed'+i+'">'+i+'</div>');
        led.data('selected', false);
        ledList.push(led);
        $('.led-pre').append(led);
    }
}

//add click listeners to led jQuery objects
function addLedListeners() {
    for (let i = 0; i < ledList.length; i++) {
        ledList[i].click(() => {
            //toggle selection
            if (ledList[i].data().selected === false) {
                ledList[i].data('selected', true);
                ledList[i].addClass('selected');
            } else {
                ledList[i].data('selected', false);
                ledList[i].removeClass('selected');
            }
        })
    }
}

function setConfigModal(ledNum) {
	let selectRange = [];
    for (let i = 0; i < ledNum; i++) {
        if (ledList[i].data().selected === true) {
        	selectRange.push(i);
            $('#selected-led-rep').append($(`<div class="led selected">${i}</div>`));
        }
    }
    return selectRange;
}

//package the UI info into JSON format and send
function applySetting(selectRange) {
	let EFFECT_DROPDOWN = $('#effect-selector');
	let COLOR_PICKER = $('.color-picker');
	let TIME = $('#time-input').val();
	console.log(TIME);
    //JSON object to package as command
    let commandObject  = {};
		let timestamps = [];
    let currentEffect = EFFECT_DROPDOWN[0].options[EFFECT_DROPDOWN[0].selectedIndex].value;

    //value of html color input com in hex string so parse in hex for rgb vals in decimal
    let r = parseInt(`${COLOR_PICKER[0].value[1]}${COLOR_PICKER[0].value[2]}`, 16);
    let g = parseInt(`${COLOR_PICKER[0].value[3]}${COLOR_PICKER[0].value[4]}`, 16);
    let b = parseInt(`${COLOR_PICKER[0].value[5]}${COLOR_PICKER[0].value[6]}`, 16);

    //add everything to the command object
		if(TIME == 0){
    commandObject.range = selectRange;
    commandObject.effect = currentEffect;
    commandObject.color = {
        r : r,
        g : g,
        b : b
    }
		commandObject.timestamps = timestamps;
	 }
	 else{
	  timestamps.color = {
        r : r,
        g : g,
        b : b
    }
		timestamps.time = TIME;
	}
    //Change bulbs in main screen to the proper color
    for(let i=0; i<selectRange.length; i++) {
    	document.getElementById("led"+selectRange[i]).style.backgroundColor = COLOR_PICKER.value;
    }

    //clear current selections
    clearSelected();
    //this is just a placeholder for an asynchronous command to the server over socket
		if (TIME == 0){
    return commandObject;
		commandObject = {};
		}
		else{
			return timestamps;
			timestamps = [];
		}
}

//run through all of the led's and "clear" the selections
function clearSelected() {
    ledList.forEach((ledObj) => {
        ledObj.data('selected', false);
        ledObj.removeClass('selected');
    });
}

function watchColorPicker(event) {
  document.querySelectorAll("[class^='led selected']").forEach(function(p) {
    p.style.backgroundColor = event.target.value;
  });
}



function interval(func, wait, times){
    var interv = function(w, t){
        return function(){
            if(typeof t === "undefined" || t-- > 0){
                setTimeout(interv, w);
                try{
                    func.call(null);
                }
                catch(e){
                    t = 0;
                    throw e.toString();
                }
            }
        };
    }(wait, times);

    setTimeout(interv, wait);
};


function previewLights(list){
	let flashingBol = false;
	let rainbowBol = false;
	let customBol = false;
	for(let i=0; i<list.length;i++){
		switch(list[i].effect){
		case "solid" :
				changeColor(list[i].range,list[i].color);
				solidBol = true;
			break;
		case "flash":
				var flashing = setInterval(function(){flash(list[i].range, list[i].color)},1000);
				flashingBol = true;
			break;
		case "rainbow":
				var rainbowing = setInterval(function(){rainbow(list[i].range)},1000);
				rainbowBol = true;
			break;
		case "custom":
		   var customing = setInterval(function(){custom(list[i].range,list[i].color,list[i].timestamps)},1000);
			 customBol = true;
			break;
		}
	}
	$('#closeBtn').click(() => {
		if(flashingBol){
			clearInterval(flashing);
			flashBol = false;
		}
		if(rainbowBol){
			clearInterval(rainbowing);
			rainbowCounter =0;
		}
		if(customBol){
			clearInterval(customing);
			customCounter =0;
		}
	});
}
//changes the color of preview leds
function changeColor(range,color){
	for(let i=0;i<range.length;i++){
		document.getElementById("prevLed"+range[i]).style.backgroundColor =
		"rgb(" + color.r + "," + color.g + "," + color.b + ")";
	}
}

function randomColor(){
	var letters = '0123456789ABCDEF';
	var color = '#'
	for(let i=0;i<6;i++){
		color += letters[Math.floor(Math.random()*16)];
	}
	return color;
}
function flash(range,color){
		if(flashBol == true){
		changeColor(range,color);
		flashBol = !flashBol;
	}
	else{
		changeColor(range,{r:0,g:0,b:0});
		flashBol = !flashBol;
	}
}

function custom(range,color,times){
	if(customCounter == 0){ // sets to initial color
	  changeColor(range,color);
		customCounter++;
	}
	else if ((customCounter) < 10) { // cycle through colors at time
		for(let i=0;i<times.length;i++){
			if( customCounter == times[i].time){
				console.log(customCounter)
				changeColor(range,times[i].color)
			}
	  }
		customCounter++;
	}
	else{
		customCounter = 0;
	}
}
function rainbow(range){
	let colors = [{r: 255,g:0,b:0},{r:255,g:125,b:0},{r:250,g:235,b:0},{r:0,g:255,b:0},
	{r:0,g:0,b:255},{r:150,g:0,b:255}];
	if(rainbowCounter <= 5){
		changeColor(range,colors[rainbowCounter]);
		rainbowCounter++;
		console.log(rainbowCounter)
	 }
	else{
		rainbowCounter = 0;
		changeColor(range,colors[rainbowCounter]);
		}
	}
