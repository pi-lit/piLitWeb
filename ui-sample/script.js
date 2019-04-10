// GLOBAL CONFIG ELEMENTS
const LED_NUM = 30;

// DOM ELEMENTS
const LED_REP = $('.led-rep');
const COLOR_PICKER = $('.color-picker');
const EFFECT_DROPDOWN = $('#effect-selector');
const APPLY_BUTTON = $('#apply');
const SAVE_BUTTON = $('#save');

// LOGIC GLOBALS
const ledList = [];

//create led dom elements - add to the ledList array - append to LED_REP dom element
function initLeds() {
    for (let i = 0; i < LED_NUM; i++) {
        var led = $(`<div class="led uncolored">${i}</div>`);
        led.data('selected', false);
        ledList.push(led);
        LED_REP.append(led);
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


//package the UI info into JSON format and send
function submitCommand() {
    //JSON object to package as command
    let commandObject  = {};
    
    //now construct all of the object to attatch to commandObject
    let submitRange = [];
    for (let i = 0; i < LED_NUM; i++) {
        if (ledList[i].data().selected === true) {
            submitRange.push(i);
        }
    }
    let currentEffect = EFFECT_DROPDOWN[0].options[EFFECT_DROPDOWN[0].selectedIndex].value;
    
    //value of html color input com in hex string so parse in hex for rgb vals in decimal
    let r = parseInt(`${COLOR_PICKER[0].value[1]}${COLOR_PICKER[0].value[2]}`, 16);
    let g = parseInt(`${COLOR_PICKER[0].value[3]}${COLOR_PICKER[0].value[4]}`, 16);
    let b = parseInt(`${COLOR_PICKER[0].value[5]}${COLOR_PICKER[0].value[6]}`, 16);

    //add everything to the command object
    commandObject.range = submitRange;
    commandObject.effect = currentEffect;
    commandObject.color = {
        r : r,
        g : g,
        b : b
    }

    //clear current selections
    clearSelected();
    
    //this is just a placeholder for an asynchronous command to the server over socket
    return commandObject;

}


//run through all of the led's and "clear" the selections
function clearSelected() {
    ledList.forEach((ledObj) => {
        ledObj.data('selected', false);
        ledObj.removeClass('selected');
    });
}

initLeds();
addLedListeners();
APPLY_BUTTON.click(() => {
    console.log(submitCommand());
});