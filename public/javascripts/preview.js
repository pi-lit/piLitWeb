var tester = 0; // for building command array
var timePosition = 0; // for building command array
var flashBol = false;
var rainbowCounter = 0;
var customCounter = 0;
var blockerBol = true; // attemot to stop multiple button press

var flashing = [], customing = [], rainbowing;

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
