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

	socket = io.connect("http://localhost:5000/");
	//socket = io.connect("https://pi-lit.herokuapp.com");

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

	//Set bulbs and color wheel
	//Populate user info
	var strip = [];
	document.getElementById('username').innerHTML = user.userName;
	document.getElementById('password').innerHTML = user.password;
	document.getElementById('email').innerHTML = user.email;
	strip = setBulbs(1);
	document.getElementById('changeBulbBtn').onclick = function() {
		var bulbCount = document.getElementById("bulbCount").value;
		strip = setBulbs(bulbCount);
	}
	document.getElementById('saveConfigBtn').onclick = function() {
		if(strip) {
			saveConfig(user.userName, strip);
		} else {
			console.log("There is no strip present to save.");
		}
	}
	document.getElementById('applyConfigBtn').onclick = function() {
		if(strip) {
			applyConfig(user.userName, strip);
		} else {
			console.log("There is no strip present to save.");
		}
	}
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

function setBulbs(bulbCount) {
	//Reset scroll menu to be empty
	$(".scrollmenu").empty();
	for(var i=0; i<bulbCount; i++) {
		$(".scrollmenu").append($("<a class = 'bulbs' id = '" + i + "'>"+ (i+1) + "</a>"));
	}
	//Reset strips
	var strip = {effect: "solid", range: [], color:{}};
	//Make strip variables
	for(var i = 0; i<bulbCount;i++) {
		var light = {};
		light.r = 0;
		light.g = 0;
		light.b = 0;
		light.time = 0;
		light.brightness = 1;
		strip[i] = light;
	}
	var bCanPreview = true; // can preview
	// create canvas and context objects
	var canvas = document.getElementById('picker');
	var ctx = canvas.getContext('2d');
	var id;
	// drawing active image
	var image = new Image();
	image.onload = function() {
	    ctx.drawImage(image, 0, 0, image.width, image.height); // draw the image on the canvas
	}

	var imageSrc = 'images/colorwheel5.png';
	image.src = imageSrc;
	$('#picker').mousemove(function(e) { // mouse move handler
	    if (bCanPreview) {
	        // get coordinates of current position
	        var canvasOffset = $(canvas).offset();
	        var canvasX = Math.floor(e.pageX - canvasOffset.left);
	        var canvasY = Math.floor(e.pageY - canvasOffset.top);

	        // get current pixel
	        var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
	        var pixel = imageData.data;

	        var slider = document.getElementById("myRange");
			var brightnessVal = document.getElementById("brightnessVal");
			slider.oninput = function() {
			  brightnessVal.innerHTML = this.value;
			}

	        // update preview color
	        var pixelColor = "rgb("+pixel[0]+", "+pixel[1]+", "+pixel[2]+")";
	        $('#'+id).css('background-color', pixelColor);
	        strip[id].r = pixel[0];
	        strip[id].g = pixel[1];
	        strip[id].b = pixel[2];
	        // update controls
	        $('#rVal').val(pixel[0]);
	        $('#gVal').val(pixel[1]);
	        $('#bVal').val(pixel[2]);
	        $('#rgbVal').val(pixel[0]+','+pixel[1]+','+pixel[2]);
	        if($('#time').val !== undefined){
	        	strip[id].time = $('#time').val();
	        }

	        var dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
	        $('#hexVal').val('#' + ('0000' + dColor.toString(16)).substr(-6));
	    }
	});
	$('#picker').click(function(e) { // click event handler
	    bCanPreview = !bCanPreview;
	}); 
	$('.bulbs').click(function(e) { // preview click
	    $('.colorpicker').toggle("slow", "linear");
	    id = this.id;
	    bCanPreview = true;
	    $('#time').val(0);
	});
	return strip;
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

function applyConfig(username, strip) {
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
	console.log(strip);
	connect().emit('forwardCommand', {
		'userName': username,
		'configName': $('#configName').val(),
		'command': strip
	});
	return false;
}
