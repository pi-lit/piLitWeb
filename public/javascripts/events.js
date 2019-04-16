// LOGIC GLOBALS
const ledList = [];

var socket = {};

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
	var commandList = [];
	var strip = [];
	var selectRange;
	//Defining our buttons
	let COLOR_PICKER = $('.color-picker');
	let SAVE_BUTTON = $('#save');
	COLOR_PICKER[0].addEventListener("change", watchColorPicker, false);
	let ledNum = 30;

	//Set bulbs and color wheel
	//Populate user info
	document.getElementById('username').innerHTML = user.userName;
	document.getElementById('password').innerHTML = user.password;
	document.getElementById('email').innerHTML = user.email;
	strip = initLeds(ledNum);
	addLedListeners();
	$('#configureBtn').click(() => {
		selectRange = setConfigModal(ledNum);
	});
	$('#applyBtn').click(() => {
	    createRangeSetting(commandList, selectRange);
	    console.log(commandList);
	});
	document.getElementById('changeBulbBtn').onclick = function() {
		let ledCount = document.getElementById("ledCount").value;
		strip = initLeds(ledCount);
	}
	$('#myModal').on('hide.bs.modal', function (e) {
		$('#selected-led-rep').empty();
		for(let i=0; i<ledList.length; i++) {
			if (ledList[i].data().selected === true) {
                ledList[i].data('selected', false);
                ledList[i].removeClass('selected');
            }
		}
	});
	/*document.getElementById('saveConfigBtn').onclick = function() {
		if(strip) {
			saveConfig(user.userName, strip);
		} else {
			console.log("There is no strip present to save.");
		}
	}
	document.getElementById('applyConfigBtn').onclick = function() {
		if(strip) {
			applyConfig(user, strip);
		} else {
			console.log("There is no strip present to save.");
		}
	}*/
	/*document.getElementById('reset').onclick = function() {
		reset(strip);
	}*/

	//Add created and saved configs to tabs
	/**var ccStr = '<ul class="list-group">';
	var scStr = '<ul class="list-group">';

	if(user.configs)
		user.configs.forEach(function(createdConfig) {
			ccStr += '<li class="list-group-item">';
			ccStr += createdConfig.configName + "<br/>";
			ccStr += '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#editConfigModal">Edit</button>';
			ccStr += '</li>';
		});

	user.savedConfigs.forEach(function(savedConfig) {
		scStr += '<li class="list-group-item">' + savedConfig.configName + '</li>';
	});
	
	ccStr += '</ul>';
	scStr += '</ul>';

	document.getElementById("createdConfigs").innerHTML = ccStr;
	document.getElementById("savedConfigs").innerHTML = scStr;*/

	/*
	document.getElementById('commandBtn').onclick = function() {
		socket.emit('command', {'startIndex': $('#startIndex').val(),
			'endIndex': $('#endIndex').val(),
			'color': $('#color').val()});
		return false;
	}
	*/
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

function applyConfig(user, strip) {
	var range = $('#bulbRange').val().split(" ");
	var effect = $('#effectName').val();
	for(var i=0; i<range.length; i++) {
		range[i] = +range[i]; 
	}
	strip.range = range;
	strip.effect = effect;
	strip.color.r = strip[0].r;
	strip.color.g = strip[0].g;
	strip.color.b = strip[0].b;
	console.log(user.piList[0]);
	var socket = io.connect("http://"+user.piList[0].address+":"+4000+"/");
	socket.emit('command', 
	{
		'pi': {},
		'config': strip
	});
	return false;
}

//create led dom elements - add to the ledList array - append to LED_REP dom element
function initLeds(ledNum) {
	//Clear the representation if anything is there
	$('.led-rep').empty();
    for (let i = 0; i < ledNum; i++) {
        var led = $('<div class="led uncolored" id="led'+i+'">'+i+'</div>');
        led.data('selected', false);
        ledList.push(led);
        $('.led-rep').append(led);
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
            $('#selected-led-rep').append($(`<div class="led selectedSub">${i}</div>`));
        }
    }
    return selectRange;
}

//package the UI info into JSON format and send
function createRangeSetting(commandList, selectRange) {
	console.log("createRangeSetting called!");
	let EFFECT_DROPDOWN = $('#effect-selector');
	let COLOR_PICKER = $('.color-picker');
    //JSON object to package as command
    let commandObject  = {};
    let currentEffect = EFFECT_DROPDOWN[0].options[EFFECT_DROPDOWN[0].selectedIndex].value;
    
    //value of html color input com in hex string so parse in hex for rgb vals in decimal
    let r = parseInt(`${COLOR_PICKER[0].value[1]}${COLOR_PICKER[0].value[2]}`, 16);
    let g = parseInt(`${COLOR_PICKER[0].value[3]}${COLOR_PICKER[0].value[4]}`, 16);
    let b = parseInt(`${COLOR_PICKER[0].value[5]}${COLOR_PICKER[0].value[6]}`, 16);

    //add everything to the command object
    commandObject.range = selectRange;
    commandObject.effect = currentEffect;
    commandObject.color = {
        r : r,
        g : g,
        b : b
    }
    let selected = $('.selected');
    commandList.push(commandObject);

    //Change bulbs in main screen to the proper color
    selected.css('background-color', 'rgb('+r+','+g+','+b+')');

    //clear current selections
    clearSelected();

    //this is just a placeholder for an asynchronous command to the server over socket
    return;

}

//run through all of the led's and "clear" the selections
function clearSelected() {
    ledList.forEach((ledObj) => {
        ledObj.data('selected', false);
        ledObj.removeClass('selected');
    });
}

function watchColorPicker(event) {
  document.querySelectorAll("[class^='led selectedSub']").forEach(function(p) {
    p.style.backgroundColor = event.target.value;
  });
}
