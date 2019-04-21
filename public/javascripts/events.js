// LOGIC GLOBALS
const ledList = [];
var profile;
var globalCon;
var socket;

$(function() {
	socket = io.connect("https://pi-lit.herokuapp.com");
	//socket = io.connect("http://localhost:8080");

	socket.on('login', function(user) {
		if(user.error != "") {
			document.getElementById('errormsg').innerHTML = user.error;
		} else {
			console.log(user);
			profile = user;
			$('#rootContent').load('/partials/navbar.html', function() {
				$('#mainContent').load('/partials/home.html', displayHome);
			});
		}
	});

	//Handle register function
	socket.on('register', function(user) {
		if(user.error != "") {
			document.getElementById('errormsg').innerHTML = user.error;
		} else {
			console.log(user);
			$('#mainContent').load("/partials/profile.html", displayHome);
		}
	});

	socket.on('savePublicConfig', function(res) {
		if(res.error) {
			console.log('error: cannot save public config : '+res.error);
		} else {
			console.log(res);

			profile.configs.push(res);
			$('#configs').append(new ConfigCard(res));
		}
	});

	socket.on('getPublicConfigs', function(configs) {
		if(configs.error) {
			console.log('error loading marketplace: '+ configs.error);
		} else {
			console.log(configs);
			for(var config of configs) {
				$('#marketplace').append(new PublicConfigCard(config));
			}
		}
	});

	socket.on('deleteConfig', function(res) {
		if(res.error) {
			console.log('error: cannot delete config : '+res.error);
		} else {
			console.log(res);

			profile.configs.filter(config => config._id == res._id);
			$('#'+res._id).remove();
		}
	});

	socket.on('saveConfig', function(res) {
		if(res.error) {
			console.log('error: cannot save config : '+res.error);
		} else {
			console.log(res);

			if(!profile.configs.find(function(config){return config._id == res._id;})) {
				profile.configs.push(res);
				$('#configs').append(new ConfigCard(res));
			}
		}
	});

	socket.on('command', function(res) {
		if(res.error) {
			console.log('error: cannot send command: '+res.error);
		} else {
			console.log(res);
		}
	})

	//Call login when the login button is clicked
	document.getElementById('loginBtn').onclick = function() {
		socket.emit('login', {'userName': $('#username').val(),
		'password': $('#password').val()} );
		return false;
	}

	//Load registration page
	$('#registerDir').click(function(){
		$('#mainContent').load("/partials/register.html", function() {
			document.getElementById("registerBtn").onclick = function() {
				socket.emit('register', {
					'userName': $('#username').val(),
					'password': $('#password').val(),
					'email': $('#email').val()});
				return false;
			}
		});
	});
});

function displayHome() {
	for(var pi of profile.piList)
		$('#devices').append(new PiCard(pi));

	for(var config of profile.configs)
		$('#configs').append(new ConfigCard(config));

	$('#confirmDeleteModal').on('show.bs.modal', function(event) {
	    var config = $(event.relatedTarget).data('config');

		$('#confirmDeleteModal').children()[0].children[0].children[1].children[1].onclick = function() {
			$('#confirmDeleteModal').modal('hide');
			socket.emit('deleteConfig', config);
		}
	});
}

function logout() {
	socket.disconnect();
	window.location = "/index.html";
}

function displayProfile() {
	$('#username').html(profile.userName);
	$('#email').html(profile.email);
	$('#name').html(profile.name);
}

function loadProfile() {
	$('#mainContent').load('partials/profile.html', displayProfile);
}

function loadHome() {
	$('#mainContent').load('partials/home.html', displayHome);
}

function loadMarketplace() {
	$('#mainContent').load('partials/marketplace.html', function() {
		socket.emit('getPublicConfigs', {});
	});
}

function loadViewEditConfig(config) {
	globalCon = config;
	$('#mainContent').load('partials/config.html', displayConfig);
}

function displayConfig() {
	var commandList = [];
	var selectRange;
	initLeds(globalCon);
	addLedListeners();

	//Color picker listeners
	$('.color-picker')[0].addEventListener("change", watchColorPicker, false);

	//Open config range modal
	$('#configBtn').click(() => {
		selectRange = setConfigModal(globalCon);
	});

	//Apply a select range
	$('#applyRangeBtn').click(() => {
    	createRangeSetting(commandList, selectRange);
    	console.log(commandList);
    });

    //Modal close behavior
	$('#myModal').on('hide.bs.modal', function (e) {
		$('#selected-led-rep').empty();
		for(let i=0; i<ledList.length; i++) {
			if (ledList[i].data().selected === true) {
                ledList[i].data('selected', false);
                ledList[i].removeClass('selected');
            }
        }
    });

    //Send config
    $('#sendBtn').click(() => {
    	let pi = {}; let command = {};
    	pi.userName = profile.userName;
		pi.description = $("#configDescription").val() || "Default description";
		pi.piName = profile.piList[0].piName;
		command.pi = pi;
		command.config = commandList;
    	socket.emit('command', command);
    });

    $('#saveBtn').click(() => {
    	let config = {};
    	config.userName = profile.userName;
		config.configName = "New Config";
		config.commandArray = commandList;
    	socket.emit('saveConfig', config);
    });
}

function saveConfig() {
	var config = {};

	if(!$("#configForm")[0].checkValidity()) {
		!$("#configForm")[0].reportValidity();
		return;
	}

	config.userName = profile.userName;
	config.configName = $("#configName").val();
	config.description = $("#configDescription").val() || "Default description";
	//config.description = $("#configDescription").val();
	console.log($("#configDescription").val());
	config.isPublic = false;

	socket.emit('saveConfig', config);
}

function PublicConfigCard(config) {
	var publicConfigCard = $(
		'<div class="row flex">'+
			'<div class="col-lg-7">'+
				'<div class="card mb-2">'+
				  '<h5 class="card-header">'+config.configName+'</h5>'+
				  '<div class="card-body">'+
					'<p class="card-text">'+config.description+'</p>'+
					'<a class="btn btn-primary m-1">Save</a>'+
					'<a class="btn btn-secondary m-1">View</a>'+
				  '</div>'+
				'</div>'+
			'</div>'+
		'</div>'
	);

	publicConfigCard.children()[0].children[0].children[1].children[1].onclick = function() {
		socket.emit('savePublicConfig', config);
	}

	return publicConfigCard;
}

function ConfigCard(config) {
	var checked = "";

	if(config.isPublic) checked = "checked";

	var configCard = $(
		'<div class="row flex">'+
			'<div class="col-lg-7">'+
				'<div id="'+config._id+'" class="card mb-2">'+
				  '<h5 class="card-header">'+config.configName+'</h5>'+
				  '<div class="card-body">'+
				    '<p class="card-text">'+config.description+'</p>'+
					'<div class="row flex">'+
						'<div class="col">'+
							'<a href="#" class="configBtn btn btn-primary m-1">Edit</a>'+
							'<button type="button" class="btn btn-danger" data-toggle="modal" data-target="#confirmDeleteModal">Delete</button>'+
						'</div>'+
						'<div class="col">'+
							'<input class="ml-auto" type="checkbox" id="publicCheckBox"'+checked+'>'+
							'<label class="ml-auto" for="publicCheckBox">Public</label>'+
						'</div>'+
					'</div>'+
				  '</div>'+
				'</div>'+
			'</div>'+
		'</div>'
	);

	configCard.children()[0].children[0].children[1].children[1].children[1].children[0].onclick = function() {
		config.isPublic = this.checked;
		socket.emit('saveConfig', config);
	}

	var deleteButton = $(configCard.children()[0].children[0].children[1].children[1].children[0].children[1]);

	deleteButton.data('config', config);

	return configCard;
}

function PiCard(pi) {
	var piCard = $(
		'<div class="row flex">'+
			'<div class="col-lg-7">'+
				'<div class="card mb-2">'+
				  '<h5 class="card-header">'+pi.piName+'</h5>'+
				  '<div class="card-body">'+
					'<p class="card-text">'+pi.description+'</p>'+
					'<a href="#" onclick="loadViewEditConfig('+pi.ledNum+')" class="btn btn-primary m-1">Configure</a>'+
				  '</div>'+
				'</div>'+
			'</div>'+
		'</div>'
	);

	return piCard;
}

//create led dom elements - add to the ledList array - append to LED_REP dom element
function initLeds(ledNum) {
	//Clear the representation if anything is there
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