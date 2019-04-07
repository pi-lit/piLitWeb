
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
				$('#mainContent').load("/partials/profile.html", function() {
					function build(){
					  var i = 1;
					  while(i<31) {
					    $(".scrollmenu").append($("<a class = 'bulbs' id = '" + i + "'>"+ i + "</a>"));
					    i++;
					  }
					}
					build();
					var bCanPreview = true; // can preview
					// create canvas and context objects
					var canvas = document.getElementById('picker');
					var ctx = canvas.getContext('2d');
					var id;
					var strip = [];
					for(var i = 1; i<31;i++){
					    var light = {};
					    light.color = [];
					    light.time = 0;
					    strip[i] = light;   
					}
					console.log(strip);
					// drawing active image
					var image = new Image();
					image.onload = function () {
					    ctx.drawImage(image, 0, 0, image.width, image.height); // draw the image on the canvas
					}

					// select desired colorwheel
					var imageSrc = 'images/colorwheel1.png';
					switch ($(canvas).attr('var')) {
					    case '2':
					        imageSrc = 'images/colorwheel2.png';
					        break;
					    case '3':
					        imageSrc = 'images/colorwheel3.png';
					        break;
					    case '4':
					        imageSrc = 'images/colorwheel4.png';
					        break;
					    case '5':
					        imageSrc = 'images/colorwheel5.png';
					        break;
					}
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

					        // update preview color
					        var pixelColor = "rgb("+pixel[0]+", "+pixel[1]+", "+pixel[2]+")";
					        console.log(id);
					        $('#'+id).css('background-color', pixelColor);
					        strip[id].colxor = [pixel[0],pixel[1],pixel[2]];
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
					    $('.colorpicker').fadeToggle("slow", "linear");
					    id = this.id;
					    console.log(id);
					    bCanPreview = true;
					    $('#time').val(0);
					    console.log(strip);
					});

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
				$('#mainContent').load("/partials/profile.html", function() {

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
