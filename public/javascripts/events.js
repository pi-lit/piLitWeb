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

	socket = io.connect("http://pi-lit.herokuapp.com/");
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

	socket.on('command', function(res) {
		console.log('Received response');
	});

	return socket;
}

function displayProfile(user) {

	//Populate user info
	document.getElementById('username').innerHTML = user.userName;
	document.getElementById('password').innerHTML = user.password;
	document.getElementById('email').innerHTML = user.email;

	//Add created and saved configs to tabs
	var ccStr = '<ul class="list-group">';
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
	document.getElementById("savedConfigs").innerHTML = scStr;

	/*
	document.getElementById('commandBtn').onclick = function() {
		socket.emit('command', {'startIndex': $('#startIndex').val(),
			'endIndex': $('#endIndex').val(),
			'color': $('#color').val()});
		return false;
	}
	*/
}
