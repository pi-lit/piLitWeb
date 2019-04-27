const ledList = [];
var globalCon;
var commandList = [];

function displayConfig(config) {
	commandList = [];
	var selectRange;
	initLeds(globalCon);
	addLedListeners();

	previewLights(config.commandArray);

	//Color picker listeners
	$('.color-picker')[0].addEventListener("change", watchColorPicker, false);

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
