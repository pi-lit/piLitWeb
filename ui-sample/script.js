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

function submitCommand() {
    let commandObject  = {};
    let submitRange = [];
    for (let i = 0; i < LED_NUM; i++) {
        if (ledList[i].data().selected === true) {
            submitRange.push(i);
        }
    }
    let currentEffect = EFFECT_DROPDOWN[0].options[EFFECT_DROPDOWN[0].selectedIndex].value;
    let colorInHex = COLOR_PICKER[0].value
    let r = parseInt(`${COLOR_PICKER[0].value[1]}${COLOR_PICKER[0].value[2]}`, 16);
    let g = parseInt(`${COLOR_PICKER[0].value[3]}${COLOR_PICKER[0].value[4]}`, 16);
    let b = parseInt(`${COLOR_PICKER[0].value[5]}${COLOR_PICKER[0].value[6]}`, 16);

    commandObject.range = submitRange;
    commandObject.effect = currentEffect;
    commandObject.color = {
        r : r,
        g : g,
        b : b
    }

    clearSelected();
    return commandObject;

}

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