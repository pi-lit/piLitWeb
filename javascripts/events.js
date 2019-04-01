
//Open connection when the page loads
$(function() {
	var socket = {};

	function openSocket() {
		socket = io.connect("https://pi-lit.herokuapp.com");

		socket.on('login', function(user) {
			if(user.error != "") {
				document.getElementById('errormsg').innerHTML = user.error;
			} else {
				console.log(user);
				$('#mainContent').load("../partials/profile.html", function() {

					//Populate user info
					document.getElementById('username').innerHTML = user.user;
					document.getElementById('password').innerHTML = user.password;
					document.getElementById('email').innerHTML = user.email;

					//Add created and saved configs to tabs
					var ccStr = '<ul>';
					var scStr = '<ul>';
					user.createdConfigs.forEach(function(createdConfig) {
						ccStr += '<li>' + createdConfig + '<li>';
					});
					user.savedConfigs.forEach(function(savedConfig) {
						scStr += '<li>' + savedConfig + '<li>';
					});
					ccStr += '<ul>';
					scStr += '<ul>';
					document.getElementById("createdConfigs").innerHTML = ccStr;
					document.getElementById("savedConfigs").innerHTML = scStr;

					document.getElementById('commandBtn').onclick = function() {
						socket.emit('command', {'startIndex': $('#startIndex').val(),
							'endIndex': $('#endIndex').val(),
							'color': $('#color').val()});
						return false;
					}
				});
			}
		});

		//Handle register function
		socket.on('register', function(res) {
			if(user.error != "") {
				document.getElementById('errormsg').innerHTML = user.error;
			} else {
				console.log(user);
				$('#mainContent').load("../partials/profile.html", function() {

					//Populate user info
					document.getElementById('username').innerHTML = user.user;
					document.getElementById('password').innerHTML = user.password;
					document.getElementById('email').innerHTML = user.email;

					//Add created and saved configs to tabs
					var ccStr = '<ul>';
					var scStr = '<ul>';
					user.createdConfigs.forEach(function(createdConfig) {
						ccStr += '<li>' + createdConfig + '<li>';
					});
					user.savedConfigs.forEach(function(savedConfig) {
						scStr += '<li>' + savedConfig + '<li>';
					});
					ccStr += '<ul>';
					scStr += '<ul>';
					document.getElementById("createdConfigs").innerHTML = ccStr;
					document.getElementById("savedConfigs").innerHTML = scStr;

					document.getElementById('commandBtn').onclick = function() {
						socket.emit('command', {'startIndex': $('#startIndex').val(),
							'endIndex': $('#endIndex').val(),
							'color': $('#color').val()});
						return false;
					}
				});
			}
		});

		socket.on('command', function(res) {
			console.log('Received response');
		});

		return socket;
	}

	//Call login when the login button is clicked
	document.getElementById('loginBtn').onclick = function() {
		openSocket().emit('login', {'userName': $('#username').val(),
		'password': $('#password').val()} );
		return false;
	}

	//Load registration page
	$('#registerDir').click(function(){
		$('#mainContent').load("../partials/register.html", function() {
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
