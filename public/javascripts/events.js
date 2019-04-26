// LOGIC GLOBALS
var profile;
var socket;

const ledList = [];
var globalCon;
var tester = 0; // for building command array
var timePosition = 0; // for building command array
var flashBol = false;
var commandList = [];
var rainbowCounter = 0;
var customCounter = 0;
var blockerBol = true; // attemot to stop multiple button press

var flashing = [], customing = [], rainbowing;

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
			user.piList = [];
			user.configs = [];
			profile = user;

			$('#rootContent').load('/partials/navbar.html', function() {
				$('#mainContent').load('/partials/home.html', displayHome);
			});
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
		$('#rootContent').load("/partials/register.html", function() {
			$("#registerBtn").click(() => {
				socket.emit('register', {
					'userName': $('#username').val(),
					'password': $('#password').val(),
					'email': $('#email').val(),
					'name': $('#name').val()
				});

				return false;
			});
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
	    console.log(config);

		$('#confirmDeleteModal').children()[0].children[0].children[1].children[1].onclick = function() {
			$('#confirmDeleteModal').modal('hide');
			socket.emit('deleteConfig', config);
		}
	});

	$('.editConfigBtn').on('click', function(event) {
		var config = $(event.target).data('config');
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

function loadViewConfigPi(pi) {
	globalCon = pi.ledNum;
	var piState = {commandArray:[]};

	$('#mainContent').load('partials/configPi.html', ()=> {

		$('#piName').html(pi.piName);

		for(var config of profile.configs) {
			$('#configDropDown').append(new ConfigDropDownItem(config));
		}

		//Send config
	    $('#sendBtn').click(() => {
	    	let command = {};
			command.pi = pi;
			console.log(commandList);
			command.config = commandList;
	    	socket.emit('command', command);
	    });

		$('#configEditor').load('partials/configEditor.html', ()=>{displayConfig(piState)});
	});
}

function ConfigDropDownItem(config) {
	var dropDownItem = $('<a class="dropdown-item">'+config.configName+'</a>');

	dropDownItem.click(() => {
		$('.led').css('background-color', 'black');
		clearAllIntervals();
		previewLights(config.commandArray);
	});

	return dropDownItem;
}

function loadViewEditConfig(config) {
	globalCon = config.ledNum;

	$('#mainContent').load('partials/config.html', ()=> {

		$('#configName').html(config.configName);

	    $('#saveBtn').click(() => {
			config.commandArray = config.commandArray.concat(commandList);
	    	socket.emit('saveConfig', config);
	    });

		$('#configEditor').load('partials/configEditor.html', ()=>{displayConfig(config)});
	});
}

function displayConfig(config) {
	commandList = [];
	var selectRange;
	initLeds(globalCon);
	addLedListeners();

	previewLights(config.commandArray);

	//Color picker listeners
	$('.color-picker')[0].addEventListener("change", watchColorPicker, false);

	/*
	$('#loadBtn').click(() => {
		selectRange = setConfigModal(globalCon);
	});
	*/

	//Apply a select range
	$('#applyRangeBtn').click(() => {
    	createRangeSetting(commandList, findRange());
    });

    //Listner for timestamps
    $('#effect-selector').on('change', function() {
    	if($('#effect-selector option:selected').val() == 'custom') {
    		$('.timestampCtrl').show();
			$('#solidColorPicker').hide();
    	} else {
    		$('.timestampCtrl').hide();
			$('#solidColorPicker').show();
    	}
    });

    $('.addTimestamp').click(() => {
    	var timestamp = $(
			'<div class="row p-2 timestampVals">'+
                '<input type="number" placeholder="Time" style="width: 100px; height: 35px">'+
                '<input type="color" value="#0000ff" class="btn btn-outline-secondary" style="width: 100px; height: 35px">'+
            '</div>'
    	);

    	timestamp.insertBefore($('.addTimestamp').parent());
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
	config.ledNum = 30;
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
					'<button class="btn btn-primary m-1">Save</button>'+
					'<button class="btn btn-secondary m-1" id="previewBtn" data-toggle="modal" data-target="#previewModal">View</button>'+
				  '</div>'+
				'</div>'+
			'</div>'+
		'</div>'
	);

	publicConfigCard.children()[0].children[0].children[1].children[1].onclick = function() {
		socket.emit('savePublicConfig', config);
	}

	publicConfigCard.children()[0].children[0].children[1].children[2].onclick = function() {
		$('#configName').html(config.configName);
		$('.led-rep').html('');
		initLeds(config.ledNum);
		previewLights(config.commandArray);
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
							'<button class="editConfigBtn btn btn-primary m-1">Edit</button>'+
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

	var editButton = $(configCard.children()[0].children[0].children[1].children[1].children[0].children[0]);
	editButton.click(()=>{loadViewEditConfig(config)});

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
					'<button class="btn btn-primary m-1">Configure</button>'+
				  '</div>'+
				'</div>'+
			'</div>'+
		'</div>'
	);

	var configureBtn = $(piCard.children()[0].children[0].children[1].children[1]);

	configureBtn.click(() => {
		loadViewConfigPi(pi);
	});

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
				console.log(ledList[i].data());
            } else {
                ledList[i].data('selected', false);
                ledList[i].removeClass('selected');
            }
        });
    }
}

function findRange() {
	let selectRange = [];

    for (var led of $('.selected')) {
		console.log(led.innerHTML);
        selectRange.push(parseInt(led.innerHTML));
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
    let currentEffect = $('#effect-selector option:selected').val()
    if(currentEffect == 'custom') {
    	let timestamps = [];
    	let timestampValues = $('.timestampVals')
    	for(let i=0; i<timestampValues.length; i++) {
    		let individualValues = {};
    		individualValues.time = timestampValues[i].children[0].value;
    		console.log(timestampValues[i].children[1].value);
		    let r = parseInt(`${timestampValues[i].children[1].value[1]}${timestampValues[i].children[1].value[2]}`, 16);
		    let g = parseInt(`${timestampValues[i].children[1].value[3]}${timestampValues[i].children[1].value[4]}`, 16);
		    let b = parseInt(`${timestampValues[i].children[1].value[5]}${timestampValues[i].children[1].value[6]}`, 16);
		    let color = {r:r, g:g, b:b}
		    individualValues.color = color;
		    timestamps.push(individualValues);
    	}
    	commandObject.timestamps = timestamps;
    }

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
    //selected.css('background-color', 'rgb('+r+','+g+','+b+')');
	previewLights(commandList);

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

function clearAllIntervals(event) {
	console.log('clear intervals');
	for(var flasher of flashing) {
		console.log(flasher);
		clearInterval(flasher);
	}

	for(var customer of customing) {
		console.log(customer);
		clearTimeout(customer.timeout);
	}

	/*
	if(rainbowing){
		clearInterval(rainbowing);
		rainbowing = undefined;
		rainbowCounter = 0;
	*/
}

function previewLights(list){
	console.log("previewLights()");
	console.log(list);

	let flashingBol = false;
	let rainbowBol = false;
	let customBol = false;

	flashing = [], customing = [], rainbowing;

	$('#previewModal').on('hidden.bs.modal', clearAllIntervals);

	for(let i=0; i<list.length;i++){
		switch(list[i].effect){
			case "solid" :
				changeColor(list[i].range, list[i].color);
				solidBol = true;
			break;
			case "flash":
				flashing.push(Flasher(list[i].range, list[i].color));
			break;
			case "custom":
				customing.push(Customer(list[i]));
			break;
			/*
			case "rainbow":
					rainbowing = setInterval(function(){rainbow(list[i].range)},1000);
					rainbowBol = t() => {return Object.assign({}, config)};rue;
				break;
			*/
		}
	}
}

function Flasher(range, color) {
	var flasher = {range: range, color: color, on: false};

	var interval = setInterval(function() {
		try {
			flash(flasher.range, flasher.color, flasher);
		} catch(e) {
			clearInterval(interval);
			return;
		}
	}, 1000);

	interval.flasher = flasher;

	return interval;
}

function Customer(commandObject) {
	var customer = {timestamps: commandObject.timestamps, range: commandObject.range, i: 0};

	console.log('Customer');

	var timeout = setTimeout(() => {custom(customer)}, customer.timestamps[0].time);
	customer.timeout = timeout;

	return customer;
}

function custom(customer) {
	try {
		var i = customer.i;
		var prev = 0;

		changeColor(customer.range, customer.timestamps[i].color);

		if(i == customer.timestamps.length - 1) {
			i = 0;
			prev = 0;
		}
		else {
			prev = customer.timestamps[i].time;
			i++;
		}

		customer.i = i;
		customer.timeout = setTimeout(() => {custom(customer)}, customer.timestamps[i].time);
	} catch(e) {
		clearTimeout(customer.timeout);
		return;
	}
}

//changes the color of preview leds
function changeColor(range,color){
	for(let i=0;i<range.length;i++){
		document.getElementById("led"+range[i]).style.backgroundColor =
		"rgb(" + color.r + "," + color.g + "," + color.b + ")";
	}
}

function randomColor(){
	var letters = '0123456789ABCDEF';
	var color = '#';
	for(let i=0;i<6;i++){
		color += letters[Math.floor(Math.random()*16)];
	}
	return color;
}

function flash(range,color, flasher){
	if(flasher.on == true){
		changeColor(range,color);
	}
	else{
		changeColor(range,{r:0,g:0,b:0});
	}

	flasher.on = !flasher.on;
}

function rainbow(range) {
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
