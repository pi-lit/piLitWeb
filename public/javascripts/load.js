$(() => {
    //Call login when the login button is clicked
    $('#loginBtn').click(() => {
        socket.emit('login', {'userName': $('#username').val(),
        'password': $('#password').val()} );
        return false;
    });

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


function logout() {
	socket.disconnect();
	window.location = "/index.html";
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

function displayProfile() {
	$('#username').html(profile.userName);
	$('#email').html(profile.email);
	$('#name').html(profile.name);
}

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

	$('.editConfigBtn').on('click', function(event) {
		var config = $(event.target).data('config');
	});
}

function registerPi() {
	var pi = {};

	if(!$("#registerPiForm")[0].checkValidity()) {
		!$("#registerPiForm")[0].reportValidity();
		return;
	}

	pi.userName = profile.userName;
	pi.piName = $("#piName").val();
	pi.description = $("#piDescription").val() || "Default description";
    pi.mac = $('#macAddress').val();
	pi.ledNum = 30;

	socket.emit('registerPi', pi);
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
