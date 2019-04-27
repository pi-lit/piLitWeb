// LOGIC GLOBALS
var profile;
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
});
