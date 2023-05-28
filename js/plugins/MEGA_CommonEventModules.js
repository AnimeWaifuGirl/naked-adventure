/*:
* @plugindesc zero conf modules by eruhunterteam
*
*/


// const animationBlock = document.createElement('div')
// animationBlock.innerHTML = `
//         <style>                
//             .animation-box {
//                 position: absolute;
//                 width: 100%;
//                 height: 100%;
//                 z-index: 504;
//                 top: -3px;
//                 left: -3px;
//                 overflow: hidden;
//             }
//             .animation-box__image {
//             }
//         </style>
//         <div class="animation-box">
//             <img class="animation-box__image" src='/img/pictures/run.webp'>
//         </div>
//         `

// const body1 = document.querySelector('body')
// let animationIsShow = true
// let oldAnimTransparent = 255

// setTimeout(function () {
//     body1.appendChild(animationBlock)
//     hideAnimations()
// }, 150)

// function showAnimations(transparent) {
//     if (!animationIsShow) {
//         var t = document.querySelector('.animation-box')
//         t.style.display = ''
//         animationIsShow = true
//     }

//     if(transparent !== oldAnimTransparent) {
//         oldAnimTransparent = transparent
//         let image = document.querySelector('.animation-box__image')
//         image.style.opacity = transparent / 255
//     }    
// }

// function hideAnimations() {
//     if (animationIsShow) {
//         var t = document.querySelector('.animation-box')
//         t.style.display = 'none'
//         animationIsShow = false
//     }
// }

; (function () {
    var commonEventInit = false
    var faceToStandList = {}
    var changeMoveSpeed = {
        runSpeed: 256,
        walkSpeed: 256,
    }

    function parseFaceToStandBlock(list) {
        // let haveParams = {}
        // let needAddHaveParams = false

        let json = {}

        let baseInit = {}
        for (let n = 1; n < list.length; n++) {
            let event = list[n]
            if (event.code === 108 && !event.parameters[0].match(/^\s*?img/)) {
                var str = event.parameters[0]
                var _a = str.split(':').map(function (itm) { return itm.trim(); }), key = _a[0], value = _a[1];

                if (key == 'x') {
                    console.log(22, Graphics.boxWidth, value)
                    if (~value.indexOf('%')) {
                        value = parseInt(value.slice(0, -1))
                        value = Math.round(Graphics.boxWidth / 100 * value)
                    }
                    else {
                        value = parseInt(value)
                    }

                    if (value < 0) {
                        value = Graphics.boxWidth + value
                    }
                    console.log(23, value)
                }

                baseInit[key] = value
            }
        }
        json.baseInit = baseInit

        let imgArr = []
        for (let n = 1; n < list.length; n++) {
            let event = list[n]
            if (event.code === 108 && !event.parameters[0].match(/^\s*?img/)) {
                continue
            }
            else if (event.code === 108) {
                const str = event.parameters[0]

                const [key, value] = str.split(':').map(itm => itm.trim())
                const [imgTag, imgId] = key.split(' ').map(itm => itm.trim())

                const imgOne = {
                    type: 'img',
                    imgName: value,
                    imgId: parseInt(imgId),
                }

                imgArr.push(imgOne)

                // if (needAddHaveParams) {
                //     imgOne.haveParams = Object.assign({}, haveParams)
                //     needAddHaveParams = false
                // }

                // json['img'].push(imgOne)
            }
            else if (event.code === 111) { // if
                // [1, 12, 0, 5, 0]                         
                let item = {}

                item.type = 'if'

                switch (event.parameters[0]) {
                    case 0: item.subtype = 'switch'; break;
                    case 1: item.subtype = 'var'; break;
                    case 4: item.subtype = 'armor'; break;
                    case 9: item.subtype = 'haveweapon'; break;
                    case 10: item.subtype = 'haveclothes'; break;
                    default: item.subtype = 'unknown'
                }

                item.varId = event.parameters[1]
                item.varEq = event.parameters[2]
                item.varValue = event.parameters[3]

                imgArr.push(item)

                // haveParams.type = event.parameters[0]
                // if (haveParams.type === 1) {
                //     haveParams.varId = event.parameters[1]
                //     haveParams.varEq = event.parameters[2]
                //     haveParams.varValue = event.parameters[3]
                //     needAddHaveParams = true
                // }
                // else {
                //     haveParams.id = event.parameters[1]
                //     haveParams.isNeed = event.parameters[2]
                //     haveParams.else = false
                //     needAddHaveParams = true
                // }
            }
            else if (event.code === 411) {
                let item = {}
                item.type = 'else'
                imgArr.push(item)

                // haveParams.type = haveParams.type // from last if for this else
                // haveParams.id = haveParams.id
                // haveParams.isNeed = haveParams.isNeed
                // haveParams.else = true
                // needAddHaveParams = true
            }
            else if (event.code === 0) {
            }
            else if (event.code === 412) {
                let item = {}
                item.type = 'endIf'
                imgArr.push(item)
            }
            else {
                let item = {}

                item.type = 'unknown'
                item.event = event

                imgArr.push(item)
            }
        }

        const forMax = imgArr.filter(itm => itm.type === 'img').map(itm => itm.imgId)
        json.baseInit['maxId'] = Math.max(...forMax)

        imgArr = makeRecursiveItemArr(imgArr)
        if (imgArr.length) {
            imgArr = imgArr[0]
        }
        json.imgArr = imgArr


        faceToStandList[json.baseInit.faceName] = json
    }

    function makeRecursiveItemArr(arr, index = 0, lvl = 0, mode = 'findIf') {
        let i = index
        let newArr = []
        for (i = i; i < arr.length; i++) {
            let item = arr[i]
            if (item.type === 'if') {
                let [inner, newIndex] = makeRecursiveItemArr(arr, i + 1, lvl + 1, 'findEndIf')
                i = newIndex
                item.inner = inner
                mode = 'findIf'
            }
            else if (item.type === 'else') {
                if (mode === 'findEndIf') {
                    i -= 1
                    break
                }
                else {
                    let [inner, newIndex] = makeRecursiveItemArr(arr, i + 1, lvl + 1, 'findEndIf')
                    i = newIndex
                    item.inner = inner
                    mode = 'findIf'
                }
            }
            else if (item.type === 'endIf') {
                if (mode === 'findEndIf') {
                    i -= 1
                    break
                }
                else {
                    continue
                }
            }

            newArr.push(item)
        }

        return [newArr, i]
    }

    var TH_SceneMap_initialize = Scene_Map.prototype.initialize
    Scene_Map.prototype.initialize = function () {
        TH_SceneMap_initialize.call(this)

        if (!commonEventInit) {
            for (var eventId = 1; eventId < $dataCommonEvents.length; eventId++) {
                const list = $dataCommonEvents[eventId].list
                if (list) {
                    for (let q = 0; q < list.length; q++) {
                        var eventOneLine = list[q]
                        if (eventOneLine.code === 108 && eventOneLine.parameters[0] === "// change equip") {
                            changeEquipCommonEventId = eventId
                        }
                        else if (eventOneLine.code === 108 && eventOneLine.parameters[0] === "// face to stand") {
                            parseFaceToStandBlock(list)
                        }
                        else if (eventOneLine.code === 108 && eventOneLine.parameters[0] === "// change speed") {
                            for (let n = q + 1; n < list.length; n++) {
                                let eventOneLine2 = list[n]
                                if (!eventOneLine2.parameters[0]) {
                                    continue
                                }

                                let match = eventOneLine2.parameters[0].match(/.*?:\s?([0-9]{1,})/)
                                if (match) {
                                    let value = match[1]
                                    if (eventOneLine2.code === 108 && ~eventOneLine2.parameters[0].indexOf('run speed')) {
                                        changeMoveSpeed.runSpeed = value
                                    }
                                    else if (eventOneLine2.code === 108 && ~eventOneLine2.parameters[0].indexOf('walk speed')) {
                                        changeMoveSpeed.walkSpeed = value
                                    }
                                }
                            }
                        }
                        else if (eventOneLine.code === 108 && eventOneLine.parameters[0] === "// animations") {
                            prepareAnimations(q, list)
                        }
                    }
                }
            }

            commonEventInit = true
        }

        // this.loadCommonEventButtons()
    }

    var animations = {}
    function prepareAnimations(startIndex, list) {
        let arr = []
        for (let i = startIndex + 1; i < list.length; i++) {
            let json = {}
            if (list[i].code === 111) { // ifElse native block
                json.type = 'nativeIf'
                json.ifType = list[i].parameters[0] // type == 0 - switch
                json.id = list[i].parameters[1] // param id
                json.needEquipment = list[i].parameters[2]
                json.needOn = list[i].parameters[2] == 0 ? true : false
            }
            else if (list[i].code === 108) { // comments block
                json.type = 'initParams'
                const str = list[i].parameters[0]
                const [key, value] = str.split(':').map(itm => itm.trim())
                json.key = key
                json.value = value
            }
            else if (list[i].code === 0) {
                json.type = 'endBlock'
            }
            else {
                json.type = 'unknown'
                json.list = list[i]
            }
            arr.push(json)
        }

        let anim = {}
        for (let item of arr) {
            if (item.key) {
                anim[item.key] = item.value
            }
            if (item.type === 'nativeIf') {
                anim.nativeIf = anim.nativeIf || []
                anim.nativeIf.push({
                    ifType: item.ifType,
                    id: item.id,
                    needEquipment: item.needEquipment,
                    needOn: item.needOn,
                })
            }
        }

        let name = anim['name'] || "animation_" + ((1e9 * Math.random()) >>> 0)

        let animParams = {}
        animParams.dir = anim.dir || ''
        animParams.pattern = anim.pattern
        animParams.maxChunk = anim.maxChunk | 0
        animParams.timing = anim.timing | 0
        animParams.x = anim.x | 0
        animParams.y = anim.y | 0

        animations[name] = {}
        animations[name].name = name
        animations[name].animParams = animParams
        animations[name].animIf = anim.if
        animations[name].checkIf = function () {
            let needIfActivate = anim.nativeIf.length
            for (let nativeIf of anim.nativeIf) {
                if (nativeIf.ifType === 0) {
                    if (nativeIf.needOn && $gameSwitches.value(nativeIf.id)) {
                        needIfActivate -= 1
                    }
                    else if (!nativeIf.needOn && !$gameSwitches.value(nativeIf.id)) {
                        needIfActivate -= 1
                    }
                }
            }
            if (needIfActivate <= 0) {
                return true
            }
            return false
        }
    }


    var TH_SceneMap_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        TH_SceneMap_update.call(this)

        // this.updateCommonEventButtons()
    }

    /* *************************** MODULE CHANGE EQUIP ************************* */

    // change equip
    var openEquipWindow = false
    var changeEquipCommonEventId = 0

    // Game_Actor.prototype.isEquipChangeOk = function(slotId) {

    var default_onPersonalOk = Scene_Menu.prototype.onPersonalOk
    Scene_Menu.prototype.onPersonalOk = function () {
        default_onPersonalOk.call(this)

        switch (this._commandWindow.currentSymbol()) {
            case 'equip':
                openEquipWindow = true
                break
        }
    }

    /* fix actors */
    var tempActors = []
    var Game_Actors_actor = Game_Actors.prototype.actor
    Game_Actors.prototype.actor = function (actorId) {
        if (this._data[actorId]) {
            // if ($dataActors[actorId] && !tempActors[actorId]) {
            if ($dataActors[actorId]) {
                tempActors[actorId] = new Game_Actor(actorId)
            }
            if (tempActors[actorId]._equips.length > this._data[actorId]._equips.length) {
                for (var i = this._data[actorId]._equips.length; i < tempActors[actorId]._equips.length; i += 1) {
                    this._data[actorId]._equips[i] = tempActors[actorId]._equips[i]
                }
            }
        }

        return Game_Actors_actor.call(this, actorId)
    };
    /* end fix */

    var default_changeEquip = Game_Actor.prototype.changeEquip;
    Game_Actor.prototype.changeEquip = function (slotId, item) {
        default_changeEquip.call(this, slotId, item)

        if (changeEquipCommonEventId && openEquipWindow) {
            $gameTemp.reserveCommonEvent(changeEquipCommonEventId)
            openEquipWindow = false
        }
    }

    /* *************************** MODULE FACE TO STAND ************************* */
    const faceToStand = {}

    faceToStand.Game_Message_setFaceImage = Game_Message.prototype.setFaceImage
    Game_Message.prototype.setFaceImage = function (faceName, faceIndex) {
        if (faceToStandList[faceName]) {
            faceToStand.faceName = faceName
            faceName = ''
        }
        faceToStand.Game_Message_setFaceImage.call(this, faceName, faceIndex)
    }

    function generateStandImg(arr, baseInit, startId, imgArrJson) {
        imgArrJson = imgArrJson || {}
        startId = startId || 50
        let failedNowSkipToElseOrIfEnd = false
        let skipElse = false
        for (let line of arr) {
            if (skipElse && line.type === 'else') {
                continue
            }
            skipElse = false

            if (failedNowSkipToElseOrIfEnd) {
                // no needed if recursive
            }

            if (line.type === 'if') {
                if (line.subtype === 'switch') {
                    if ($gameSwitches.value(line.varId)) {
                        skipElse = true
                    }
                    else {
                        failedNowSkipToElseOrIfEnd = true
                        continue
                    }
                }
                else if (line.subtype === 'var') {
                    if (line.varEq === 0) {
                        if ($gameVariables.value(line.varId) == line.varValue) {
                            skipElse = true
                        }
                        else {
                            failedNowSkipToElseOrIfEnd = true
                            continue
                        }
                    }
                    else {
                        failedNowSkipToElseOrIfEnd = true
                        continue
                    }
                }
                else if (line.subtype === 'armor') {
                    const actor = $gameActors.actor(1)
                    const equips = actor.equips()
                    let isFind = false
                    for (let i = 0; i < equips.length; i++) {
                        if (!equips[i]) continue

                        if (line.varValue == equips[i].id) {
                            isFind = true
                            skipElse = true
                            break
                        }
                    }
                    if (!isFind) {
                        failedNowSkipToElseOrIfEnd = true
                        continue
                    }
                }
                else if (line.subtype === 'haveweapon' || line.subtype === 'haveclothes') {
                    const actor = $gameActors.actor(1)
                    const equips = actor.equips()
                    let isFind = false
                    for (let i = 0; i < equips.length; i++) {
                        if (!equips[i]) continue

                        if (line.varEq === true && line.varId == equips[i].id) {
                            isFind = true
                            skipElse = true
                            break
                        }
                    }
                    if (!isFind) {
                        failedNowSkipToElseOrIfEnd = true
                        continue
                    }
                }
            }
            else if (line.type === 'img') {
                imgArrJson[startId + line.imgId] = { url: baseInit['dir'] + line.imgName, x: baseInit['x'], y: baseInit['y'] }
                // showImg(startId + line.imgId, baseInit['dir'] + line.imgName, baseInit['x'], baseInit['y'])
                // $gameScreen.showPicture(startId + line.imgId, baseInit['dir'] + line.imgName, 0, baseInit['x'], baseInit['y'], 100, 100, 255, 0)
                //$gameScreen.tintPicture(startId + line.imgId, [-68, -68, 0, 68], 1)
            }

            if (line.inner) {
                imgArrJson = generateStandImg(line.inner, baseInit, startId, imgArrJson)
            }
        }

        return imgArrJson
    }

    var faces = {}
    var facesCount = 0

    faceToStand.Window_Message_startMessage = Window_Message.prototype.startMessage
    Window_Message.prototype.startMessage = function () {
        clearTimeout(nowOnScreenTimeout)
        clearTimeout(drawTimeout)
        clearTimeout(drawTimeoutFade)
        if (faceToStand.faceName) {
            if (!faces[faceToStand.faceName]) {
                faces[faceToStand.faceName] = {}
                faces[faceToStand.faceName].startId = 50 + 10 * facesCount
                facesCount += 1
            }
            faces[faceToStand.faceName].needErase = false

            // if(faces[faceToStand.faceName].isShow)

            // clearTimeout(imgsEraseTimeout)

            var json = faceToStandList[faceToStand.faceName]
            var baseInit = json.baseInit
            var imgArr = json.imgArr

            var imgArrJson = generateStandImg(imgArr, baseInit, faces[faceToStand.faceName].startId)
            var showImgsId = []
            for (var id in imgArrJson) {
                showImgsId.push(id)
            }
            showImgsId = showImgsId.reverse()
            for (var i = 0; i < showImgsId.length; i += 1) {
                var item = imgArrJson[showImgsId[i]]
                ImageManager.reserveBitmap('img/pictures/', item.url, 0, true, showImgsId[i])
                showImg(showImgsId[i], item.url, item.x, item.y)
            }

            var faceIndex = ('' + $gameMessage.faceIndex()).padStart(3, '0')

            var faceId = faces[faceToStand.faceName].startId + baseInit.maxId + 1
            var faceUrl = baseInit['dir'] + baseInit['emotionPatern'] + faceIndex
            ImageManager.reserveBitmap('img/pictures/', faceUrl, 0, true, faceId)
            showFadeImg(faceId, faceUrl, baseInit['x'], baseInit['y'])
            curFaceImg = baseInit['dir'] + baseInit['emotionPatern'] + faceIndex
            // $gameScreen.showPicture(50 + baseInit.maxId + 1, baseInit['dir'] + baseInit['emotionPatern'] + faceIndex, 0, baseInit['x'], baseInit['y'], 100, 100, 255, 0)
            //$gameScreen.tintPicture(50 + baseInit.maxId + 1, [-68, -68, 0, 68], 1)

            faces[faceToStand.faceName].isShow = true
            faces[faceToStand.faceName].maxId = baseInit.maxId + 1

            emoOnScreen = true
        }
        else {
            eraseAllEmo()
            emoOnScreen = false
        }

        faceToStand.Window_Message_startMessage.call(this)
    }

    faceToStand.Window_Message_terminateMessage = Window_Message.prototype.terminateMessage
    Window_Message.prototype.terminateMessage = function () {
        if (faceToStand.faceName) {
            faces[faceToStand.faceName].needErase = true

            for (let i = faces[faceToStand.faceName].startId; i <= faces[faceToStand.faceName].startId + faceToStandList[faceToStand.faceName].baseInit['maxId'] + 1; i++) {
                eraseImg(i)
                // $gameScreen.erasePicture(i)
            }

            faceToStand.faceName = ''

            eraseAllEmo()
        }
        faceToStand.Window_Message_terminateMessage.call(this)
    }

    var drawTimeout
    var drawTimeoutFade
    var emoOnScreen = false
    var imgsShow = {}
    var imgsDelete = []
    var curFaceImg = ''
    var nowOnScreen = {}
    function showImg(zIndex, imgUrl, x, y, origin, scaleX, scaleY, opacity, blendMode) {
        origin = 0
        scaleX = 100
        scaleY = 100
        opacity = 255
        blendMode = 0

        imgsShow[zIndex] = {
            zIndex, imgUrl, x, y, origin, scaleX, scaleY, opacity, blendMode,
        }


        if (!emoOnScreen) {
            opacity = 100
            var iter = 14
            var delta = 155 / iter
            // $gameScreen.showPicture(zIndex, imgUrl, origin, x, y, scaleX, scaleY, opacity, blendMode)
            // nowOnScreen[zIndex] = true
            for (var i = 0; i < iter; i += 1) {
                opacity += delta

                if (opacity > 240) {
                    opacity = 255
                }

                drawTimeout = setTimeout(function (tempOpacity) {
                    // $gameScreen.movePicture(zIndex, origin, x, y, scaleX, scaleY, tempOpacity, blendMode, 1)
                    $gameScreen.showPicture(zIndex, imgUrl, origin, x, y, scaleX, scaleY, tempOpacity, blendMode)
                    nowOnScreen[zIndex] = true
                }.bind(this, opacity), i * 10)
            }
        }
        else {
            $gameScreen.showPicture(zIndex, imgUrl, origin, x, y, scaleX, scaleY, opacity, blendMode)
            nowOnScreen[zIndex] = true
        }
    }

    function showFadeImg(zIndex, imgUrl, x, y, origin, scaleX, scaleY, opacity, blendMode) {
        origin = 0
        scaleX = 100
        scaleY = 100
        opacity = 255
        blendMode = 0

        imgsShow[zIndex] = {
            zIndex, imgUrl, x, y, origin, scaleX, scaleY, opacity, blendMode,
        }

        if (curFaceImg != imgUrl && !emoOnScreen) {
            opacity = 100
            var iter = 7
            var delta = 155 / iter
            for (var i = 0; i < iter; i += 1) {
                opacity += delta

                if (opacity > 240) {
                    opacity = 255
                }

                drawTimeoutFade = setTimeout(function (tempO) {
                    $gameScreen.showPicture(zIndex, imgUrl, origin, x, y, scaleX, scaleY, tempO, blendMode)
                    nowOnScreen[zIndex] = true
                }.bind(this, opacity), i * 10)
            }
        }
        else {
            $gameScreen.showPicture(zIndex, imgUrl, origin, x, y, scaleX, scaleY, opacity, blendMode)
            nowOnScreen[zIndex] = true
        }
    }

    function eraseImg(zIndex) {
        // $gameScreen.erasePicture(zIndex)

        imgsDelete.push(zIndex)
        queryImgsErase()
    }

    var imgsEraseTimeout
    var nowOnScreenTimeout
    function queryImgsErase() {
        clearTimeout(imgsEraseTimeout)

        imgsEraseTimeout = setTimeout(function () {

            for (var name in faces) {
                var item = faces[name]
                if (item.needErase) {
                    for (var i = item.startId; i <= item.startId + item.maxId; i += 1) {
                        console.log(11, name, i)
                        $gameScreen.erasePicture(i)
                    }
                }
                faces[name].isShow = false
            }

            // for (var i = 0; i < imgsDelete.length; i += 1) {
            //     var zIndex = imgsDelete[i]
            //     $gameScreen.erasePicture(zIndex)
            //     delete nowOnScreen[zIndex]
            // }
            // emoOnScreen = false
            // imgsDelete = []
            // curFaceImg = ''

        }, 50)
    }

    function eraseAllEmo() {
        nowOnScreenTimeout = setTimeout(_ => {
            for (let zIndex in nowOnScreen) {
                $gameScreen.erasePicture(zIndex)
            }
        }, 200)
    }

    /* *************************** MODULE CHANGE MOVE SPEED ************************* */
    var temp_Game_CharacterBase_prototype_distancePerFrame = Game_CharacterBase.prototype.distancePerFrame
    Game_CharacterBase.prototype.distancePerFrame = function () {
        if (this.isDashing()) {
            return Math.pow(2, this.realMoveSpeed()) / changeMoveSpeed.runSpeed
        }
        return Math.pow(2, this.realMoveSpeed()) / changeMoveSpeed.walkSpeed
        // return Math.pow(2, this.realMoveSpeed()) / 256;
    }

    /* *************************** MODULE SHOW ANIMATIONS *************************** */
    var isAnimationsRun = false
    var isAnimationsTimerRun = false
    var animationTimer
    var cacheAnimationRun = false
    var cacheAnimationWalk = false

    var animationActiveNow = false
    var curAnimName = ''
    var curAnimImageId = 1
    var eraseTimer
    var animCache = {}
    var lastAnimTiming = 0

    // object.keys polyfill
    if (!Object.keys) {
        Object.keys = (function () {
            'use strict';
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                dontEnums = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ],
                dontEnumsLength = dontEnums.length;

            return function (obj) {
                if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result = [], prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }());
    }
    //  Polyfill end


    var temp_Game_Player_prototype_moveByInput = Game_Player.prototype.moveByInput
    Game_Player.prototype.moveByInput = function () {
        if (this.isMoving()) {
            if (!animationActiveNow) {
                //for (let [name, value] of Object.entries(animations)) {
                for (let name of Object.keys(animations)) {
                    let value = animations[name]
                    if (animations[name].checkIf()) {
                        if (animations[name].animIf === 'run' && this.isDashing()) {
                            curAnimName = name
                            break
                        }
                        else if (animations[name].animIf === 'walk' && !this.isDashing()) {
                            curAnimName = name
                            break
                        }
                    }
                }
            }

            if (curAnimName) {
                clearTimeout(eraseTimer)
            }
        }
        else {
            if (animationActiveNow) {
                eraseTimer = setTimeout(_ => {
                    clearInterval(animationTimer)
                    animationActiveNow = false
                    curAnimName = ''
                    $gameScreen.erasePicture(80)
                }, lastAnimTiming + 50)
            }
        }

        // if (!animationActiveNow && curAnimName && !animCache[curAnimName]) {
        //     const animParams = animations[curAnimName].animParams
        //     for (let q = 0; q < 2; q++) {
        //         for (let i = 1; i <= animParams.maxChunk; i++) {
        //             const imageIdStr = ('' + i).padStart(3, '0')
        //             const img = animParams.dir + animParams.pattern + imageIdStr
        //             let transparent = 100
        //             showPictureWithCache(80, img, 0, 0, 0, 100, 100, transparent, 0)
        //         }
        //     }
        //     $gameScreen.erasePicture(80)
        //     animCache[curAnimName] = true
        // }

        if (curAnimName && !animationActiveNow) {
            animationActiveNow = true

            var animParams = animations[curAnimName].animParams
            var imageIdStr = ('' + curAnimImageId).padStart(3, '0')
            var img = animParams.dir + animParams.pattern + imageIdStr

            var transparent = 255
            if (playerDirection === 6) {
                transparent = 70
            }

            showPictureWithCache(80, img, 0, animParams.x, animParams.y, 100, 100, transparent, 0)
            lastAnimTiming = animParams.timing

            animationTimer = setInterval(() => {
                curAnimImageId += 1
                if (curAnimImageId > animParams.maxChunk) {
                    curAnimImageId = 1
                }

                var imageIdStr = ('' + curAnimImageId).padStart(3, '0')
                var img = animParams.dir + animParams.pattern + imageIdStr

                let transparent = 255
                if (playerDirection === 6) {
                    transparent = 70
                }

                showPictureWithCache(80, img, 0, animParams.x, animParams.y, 100, 100, transparent, 0)
            }, animParams.timing)
        }

        temp_Game_Player_prototype_moveByInput.call(this)
    }

    var playerDirection = 2

    let temp_Input_updateDirection = Input._updateDirection
    Input._updateDirection = function () {
        temp_Input_updateDirection.call(this)

        playerDirection = this._dir4
    }

    var cacheImg = {}
    let nowAnimImgShowName = ''
    function showPictureWithCache(id, img, var1, x, y, var2, var3, transparent, var4) {
        if (img === nowAnimImgShowName) {
            return
        }
        nowAnimImgShowName = img
        if (cacheImg[img]) {
            $gameScreen.showPicture(id, img, var1, x, y, var2, var3, transparent, var4)
        }
        else {
            $gameScreen.showPicture(id, img, var1, x, y, var2, var3, 1, var4)
            cacheImg[img] = true
        }
    }

})()