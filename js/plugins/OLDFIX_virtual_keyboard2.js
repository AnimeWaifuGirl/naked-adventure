"use strict";
//=============================================================================
/*:
* @plugindesc virtual keyboard
*
* @param allowKeys
* @default ["q", "w", "a", "s", "x", "shift", "arrow"]
*
* @param offsetY
* @default 0
*
* @param offsetX
* @default 0
*
* @param allowArrowKeys
* @parent ---Proxies---
* @type boolean
* @on YES
* @off NO
* @desc Enable Arrow keys
* NO - false     YES - true
* @default true
*/
//=============================================================================

function is_touch_device4() {
/*  
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    
    var mq = function (query) {
        return window.matchMedia(query).matches;
    }

    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
        return true;
    }

    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
*/

    try {
        var fs = require('fs')
        return false
    }
    catch(e) {
        if ("ontouchstart" in document.documentElement) {
            return true
        }
        else {
            return false
        }
    }
}

(function () {
    var temp_Input__onKeyDown = Input._onKeyDown
    Input._onKeyDown = function (event) {
        if(!event) {
            return
        }

        if (event.preventDefault) {
            temp_Input__onKeyDown.call(this, event)
            return
        }

        // if (this._shouldPreventDefault(event.keyCode)) {
        //     event.preventDefault();
        // }
        if (event.keyCode === 144) {    // Numlock
            this.clear();
        }
        var buttonName = this.keyMapper[event.keyCode];
        if (buttonName) {
            this._currentState[buttonName] = true;
        }
    };

    var params = PluginManager.parameters('OLDFIX_virtual_keyboard2');

    var offsetY = Number(params['offsetY']) || 0;
    var offsetX = Number(params['offsetX']) || 0;

    var allowKeys = String(params['allowKeys']) || "[]";
    var allowArrowKeys = (String(params['allowArrowKeys']) || 'true') === 'true' ? true : false;
    var allowKeysJson = JSON.parse(allowKeys);
    var buttons = {};
    var arrowButtons = {};
    var buttonsShow = false;
    var arrowEnable = false;
    var alwaysShow = false;
    var buttonsDiv = document.createElement('div');
    document.querySelector('body').appendChild(buttonsDiv);

    var patternKeys = {};
    patternKeys['menu'] = { name: 'menuButton', keyCode: 27, label: 'menu' };
    patternKeys['w'] = { name: 'wButton', keyCode: 87, label: 'W' };
    patternKeys['q'] = { name: 'qButton', keyCode: 81, label: 'Q' };
    patternKeys['a'] = { name: 'aButton', keyCode: 65, label: 'A' };
    patternKeys['s'] = { name: 'sButton', keyCode: 83, label: 'S' };
    patternKeys['x'] = { name: 'xButton', keyCode: 88, label: 'X' };
    patternKeys['z'] = { name: 'zButton', keyCode: 90, label: 'Z' };
    patternKeys['d'] = { name: 'dButton', keyCode: 68, label: 'D' };
    patternKeys['v'] = { name: 'vButton', keyCode: 86, label: 'V' };
    patternKeys['f'] = { name: 'fButton', keyCode: 70, label: 'F' };
    patternKeys['c'] = { name: 'zButton', keyCode: 67, label: 'C' };
    patternKeys['space'] = { name: 'spaceButton', keyCode: 32, label: 'OK' };
    patternKeys['enter'] = { name: 'enterButton', keyCode: 13, label: 'OK' };
    patternKeys['ok'] = { name: 'enterButton', keyCode: 13, label: 'OK' };
    patternKeys['shift'] = { name: 'shiftButton', keyCode: 16, label: 'shift' };
    patternKeys['ctrl'] = { name: 'ctrlButton', keyCode: 17, label: 'ctrl' };
    if (allowArrowKeys) {
        patternKeys['arrow'] = { name: 'arrowButton', keyCode: 'arrow', label: 'arrow' };
    }
    var aliasGameEventSetupPageSettings = Game_Event.prototype.setupPageSettings;
    Game_Event.prototype.setupPageSettings = function () {
        aliasGameEventSetupPageSettings.call(this);

        buttonsShow = true;
        alwaysShow = true;

        if(!is_touch_device4()) {
            return false
        }

        if(!alwaysShow) {
            createButton('openButton', 'top', 'right', offsetX + 20, offsetY + 50, 50, 34, 'open', '><', true);
        }
        var keys = [];
        for (var _i = 0, allowKeysJson_1 = allowKeysJson; _i < allowKeysJson_1.length; _i++) {
            var item = allowKeysJson_1[_i];
            if (patternKeys[item]) {
                keys.push(patternKeys[item]);
            }
        }
        if (keys.length > 5) {
            for (var i = 0; i < keys.length; i++) {
                var item = keys[i];
                if (i % 2 == 0) {
                    createButton(item.name, 'top', 'right', offsetX + 20 + 60, offsetY + 100 + ((i / 2) * 50), 50, 34, item.keyCode, item.label);
                }
                else {
                    createButton(item.name, 'top', 'right', offsetX + 20, offsetY + 100 + ((i / 2) * 50), 50, 34, item.keyCode, item.label);
                }
            }
        }
        else {
            for (var i = 0; i < keys.length; i++) {
                var item = keys[i];
                createButton(item.name, 'top', 'right', offsetX + 20, offsetY + 100 + (i * 50), 50, 34, item.keyCode, item.label);
            }
        }
        if (allowArrowKeys) {
            var arrowStartX = 100;
            var arrowStartY = 50;
            var arrowW = 65;
            var arrowH = 65;
            arrowButtons['leftButton'] = createButton('leftButton', 'bottom', 'left', arrowStartX + 0, arrowStartY + 0, arrowW, arrowH, 37, '<');
            arrowButtons['downButton'] = createButton('downButton', 'bottom', 'left', arrowStartX + 80, arrowStartY + 0, arrowW, arrowH, 40, '_');
            arrowButtons['upButton'] = createButton('upButton', 'bottom', 'left', arrowStartX + 80, arrowStartY + 70, arrowW, arrowH, 38, '^');
            arrowButtons['rightButton'] = createButton('rightButton', 'bottom', 'left', arrowStartX + 80 * 2, arrowStartY + 0, arrowW, arrowH, 39, '>');
        }
        document.addEventListener('mouseup', function (e) {
            for (var key in buttons) {
                buttons[key].actionUp(e);
            }
        });
        if (!buttonsShow) {
            hideAllButtons();
        }
        if(!arrowEnable) {
            hideArrowButton();
        }
    };
    function toggleEnableArrowButtons(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!arrowEnable) {
            arrowEnable = true;
            for (var key in arrowButtons) {
                showButton(key);
            }
        }
        else {
            arrowEnable = false;
            for (var key in arrowButtons) {
                hideButton(key);
            }
        }
    }
    function hideArrowButton() {
        for (var key in arrowButtons) {
            hideButton(key);
        }
    }
    function showArrowButton() {
        for (var key in arrowButtons) {
            showButton(key);
        }
    }

    var activateOnScreenPad = false
    var resurtTouchCan;
    var touchCnt = 0;
    var temp_TouchInput_onTouchStart = TouchInput._onTouchStart
    TouchInput._onTouchStart = function (event) {
        if (touchCnt > 0) {

        }
        else {
            temp_TouchInput_onTouchStart.call(this, event)
        }
    }
    var temp_TouchInput_onPointerDown = TouchInput._onPointerDown
    TouchInput._onPointerDown = function (event) {
        if (touchCnt > 0) {

        }
        else {
            temp_TouchInput_onPointerDown.call(this, event)
        }
    }

    function createActionKeyDown(keyCode) {
        return function (e) {
            //clearTimeout(resurtTouchCan)
            //activateOnScreenPad = true
            touchCnt += 1
            var key = keyCode;
            e.preventDefault();
            e.stopPropagation();
            var newKeyCode = {}
            newKeyCode.keyCode = key
            // newKeyCode.preventDefault = e.preventDefault
            // newKeyCode.stopPropagation = e.stopPropagation
            Input._onKeyDown(newKeyCode);
            // setTimeout(function () {
            //     Input._onKeyUp(e)
            // }, 100)
        };
    }
    function createActionKeyUp(keyCode) {
        return function (e) {
            resurtTouchCan = setTimeout(function () { if (touchCnt > 0) touchCnt -= 1 }, 300)
            var key = keyCode;
            e.preventDefault();
            e.stopPropagation();
            // e.keyCode = key;
            var newKeyCode = {}
            newKeyCode.keyCode = key
            // newKeyCode.preventDefault = e.preventDefault
            // newKeyCode.stopPropagation = e.stopPropagation
            Input._onKeyUp(newKeyCode);
        };
    }

    function voidDown(e) {
        console.log(11)
        e.preventDefault();
        e.stopPropagation();

        clearTimeout(resurtTouchCan)
        activateOnScreenPad = true
    }
    function voidUp(e) {
        e.preventDefault();
        e.stopPropagation();

        resurtTouchCan = setTimeout(function () { activateOnScreenPad = false }, 340)
    }

    function hideAllButtons() {
        for (var key in buttons) {
            hideButton(key);
        }
    }
    function showButtons(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!buttonsShow) {
            for (var key in buttons) {
                showButton(key);
            }
            buttonsShow = true;
        }
        else {
            for (var key in buttons) {
                hideButton(key);
            }
            buttonsShow = false;
        }
        if (!arrowEnable) {
            hideArrowButton();
        }
        else {
            showArrowButton();
        }
    }
    function createButton(name, fromY, fromX, x, y, width, height, keyCode, label, notHide) {
        if (!buttons[name]) {
            // darkslateblue
            // #145200
            var template = "<div style='width:" + (16 + width) + "px;height:" + (16 + height) + "px;" + fromX + ":" + x + "px;" + fromY + ":" + y + "px;position: absolute; margin-top: auto; margin-bottom: auto; z-index: 500;display: flex; align-items: center;justify-content: center;'><div class='" + name + "' style='width: " + width + "px; height: " + height + "px; " + fromX + ": " + x + "px; " + fromY + ": " + y + "px;border: 2px solid white;border-radius: 12px; z-index: 501; display: flex; align-items: center;justify-content: center; opacity: 0.5;'><div class='" + name + "__text' style='padding: 6px 10px; font-size: 19px; font-family: Arial; color: white;'>" + label + "</div></div></div>";
            var div = document.createElement('div');
            div.innerHTML = template;
            buttonsDiv.appendChild(div);
            var actionDown = createActionKeyDown(keyCode);
            var actionUp = createActionKeyUp(keyCode);
            if (keyCode === 'open') {
                actionDown = showButtons;
                actionUp = function (e) { };
            }
            else if (keyCode === 'arrow') {
                actionDown = toggleEnableArrowButtons;
                actionUp = function (e) { };
            }
            div.addEventListener('mousedown', actionDown);
            div.addEventListener('touchstart', actionDown);
            div.addEventListener('mouseup', actionUp);
            div.addEventListener('touchend', actionUp);
            buttons[name] = {};
            buttons[name].div = div;
            buttons[name].actionDown = actionDown;
            buttons[name].actionUp = actionUp;
            buttons[name].notHide = notHide;
        }
    }
    function showButton(name) {
        if (buttons[name]) {
            buttons[name].div.style.display = 'block';
        }
    }
    function hideButton(name) {
        if (buttons[name] && !buttons[name].notHide) {
            buttons[name].div.style.display = 'none';
        }
    }
})();
