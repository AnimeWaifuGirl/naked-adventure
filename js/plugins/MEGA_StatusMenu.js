/*:
* @plugindesc status menu by erahunterteam
* 
* @param showId
*
* @param value1
*
* @param value1_label
*
* @param value2
*
* @param value2_label
*
* @param value3
*
* @param value3_label
*
* @param value4
*
* @param value4_label
*
*/
'use strict';

var activeStatusMenu = false

var megaParams = megaParams || {}
megaParams['statusMenu'] = {}
var tempParameters = PluginManager.parameters('MEGA_StatusMenu')
megaParams['statusMenu'].showId = Number(tempParameters['showId']) || 0
megaParams['statusMenu'].values = []
megaParams['statusMenu'].labels = []
if (Number(tempParameters['value1'])) {
    megaParams['statusMenu'].values.push(Number(tempParameters['value1']))
    megaParams['statusMenu'].labels.push(tempParameters['value1_label'])
}
if (Number(tempParameters['value2'])) {
    megaParams['statusMenu'].values.push(Number(tempParameters['value2']))
    megaParams['statusMenu'].labels.push(tempParameters['value2_label'])
}
if (Number(tempParameters['value3'])) {
    megaParams['statusMenu'].values.push(Number(tempParameters['value3']))
    megaParams['statusMenu'].labels.push(tempParameters['value3_label'])
}
if (Number(tempParameters['value4'])) {
    megaParams['statusMenu'].values.push(Number(tempParameters['value4']))
    megaParams['statusMenu'].labels.push(tempParameters['value4_label'])
}

var body = document.querySelector('body')
var itemMenu = document.createElement('div')
var statusMenuIsShow = false

function hideStatusMenu() {
    itemMenu.innerHTML = ''
    statusMenuIsShow = false
}

function showStatusMenu() {
    var gameCanvas = document.querySelector('#GameCanvas')

    var clientRect = gameCanvas.getBoundingClientRect()

    var canvasW = gameCanvas.getAttribute('width')
    var canvasH = gameCanvas.getAttribute('height')
    
    var realCanvasW = clientRect.width
    var realCanvasH = clientRect.height

    var canvasX = clientRect.x
    var canvasY = clientRect.y
    
    var deltaW = realCanvasW / canvasW
    var deltaH = realCanvasH / canvasH
    
    var imgWidth = 22

    var fontSize = Math.round(20 * deltaW)
    var widthSize = Math.round(22 * deltaW)
    var padding = Math.round(10 * deltaW)
    var widthShowMenu = Math.round(210 * deltaW)

    if (megaParams['statusMenu'].showId && !$gameSwitches.value(megaParams['statusMenu'].showId)) {
        hideStatusMenu()
        return
    }

    var items = ''

    for (var i = 0; i < megaParams['statusMenu'].values.length; i++) {
        var value = megaParams['statusMenu'].values[i]
        var data = $gameVariables.value(value)
        var label = megaParams['statusMenu'].labels[i]        
        if(~label.indexOf('.png') || ~label.indexOf('.svg') || ~label.indexOf('.jpg') || ~label.indexOf('.webp')) {
            var iconUrl = 'img/pictures/' + label
            items += `
                <div class="statusMenu__text" style='display: flex;'>
                    <span style='margin-right: 7px;'><img style='width: ${widthSize}px; color: white;' src=${iconUrl}></span>
                    <span style='margin-right: 3px;'>${data}</span>
                </div>
                `
        }
        else {
            items += `<div class="statusMenu__text">${label} ${data}</div>`
        }
    }

    var right = window.innerWidth - canvasX - realCanvasW + padding

    itemMenu.innerHTML = `
    <style>
        .statusMenu {
            position: absolute;
            top: ${canvasY + padding}px;
            right: ${right}px;
            background: rgb(21, 18, 22, 0.6);
            border: 1px solid white;
/*
            background: rgb(21, 18, 22, 0.6);
            border: 2px solid white;
            border-radius: 4px;
*/
            border-radius: ${13 * deltaW}px;
            padding-left: ${7 * deltaW}px;
            padding-right: ${7 * deltaW}px;
            padding-top: ${3 * deltaW}px;
            z-index: 501;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .statusMenu__text {
            padding: ${6 * deltaW}px ${10 * deltaW}px;
            font-size: ${fontSize}px;
            font-family: Arial;
            color: white;
        }
    </style>
    <div class="statusMenu">
        ${items}
    </div>
    `

    statusMenuIsShow = true
}

var resizeT
window.onresize = function() {
    if(activeStatusMenu) {
        resizeT = setTimeout(function () {
            clearTimeout(resizeT)
            showStatusMenu()
        }, 5)
    }
}

var tempOnMouseDown = TouchInput._onMouseDown
var noNeedNext = false

TouchInput._onMouseDown = function (event) {
    if (!noNeedNext) {
        tempOnMouseDown.call(this, event)
    }
    else {
        noNeedNext = false
    }
}

itemMenu.addEventListener('mousedown', function (e) {
    e.preventDefault()
    noNeedNext = true
})

setTimeout(function () {
    body.appendChild(itemMenu)
}, 150)

var tempGameVarOnChange = Game_Variables.prototype.onChange
Game_Variables.prototype.onChange = function () {
    activeStatusMenu = true
    showStatusMenu()
    tempGameVarOnChange.call(this)
}

var tempGameSwitchesOnChange = Game_Switches.prototype.onChange
Game_Switches.prototype.onChange = function () {
    activeStatusMenu = true
    showStatusMenu()
    tempGameSwitchesOnChange.call(this)
}

var temp_Scene_Map_callMenu = Scene_Map.prototype.callMenu
Scene_Map.prototype.callMenu = function () {
    activeStatusMenu = false
    hideStatusMenu()
    temp_Scene_Map_callMenu.call(this)
}

// var temp_Scene_Map_update = Scene_Map.prototype.update
// Scene_Map.prototype.update = function() {
//     temp_Scene_Map_update.call(this)
//     if(!statusMenuIsShow) {
//         showStatusMenu()
//     }    
// }
