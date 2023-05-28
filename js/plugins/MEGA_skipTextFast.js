/*:
* @plugindesc fast skip text by erahunterteam
*
*/

var sTF = {}

// sTF.parameters = PluginManager.parameters('MEGA_skipTextFast')

Input.keyMapper[18] = 'alt'

sTF.detectFastForward = function () {
    return Input.isPressed('control')
}

sTF.Window_Message_updateInput = Window_Message.prototype.updateInput
Window_Message.prototype.updateInput = function () {
    if (this.pause && sTF.detectFastForward.call(this)) {
        if (!this._textState) {
            this.pause = false
            this.terminateMessage()
        }
    }
    return sTF.Window_Message_updateInput.call(this)
}

sTF.Window_Message_updateShowFast = Window_Message.prototype.updateShowFast
Window_Message.prototype.updateShowFast = function () {
    if (sTF.detectFastForward.call(this)) this._showFast = true
    sTF.Window_Message_updateShowFast.call(this)
}

sTF.Window_Message_updateWait = Window_Message.prototype.updateWait
Window_Message.prototype.updateWait = function () {
    if (sTF.detectFastForward.call(this)) return false
    return sTF.Window_Message_updateWait.call(this)
}

sTF.Window_Message_startWait = Window_Message.prototype.startWait
Window_Message.prototype.startWait = function (count) {
    if (this._checkWordWrapMode) return
    sTF.Window_Message_startWait.call(this, count)
    if (sTF.detectFastForward.call(this)) this._waitCount = 0
}

sTF.Window_Message_updateMainMultiply = Scene_Map.prototype.updateMainMultiply
Scene_Map.prototype.updateMainMultiply = function () {
    sTF.Window_Message_updateMainMultiply.call(this)
    if (($gameMap.isEventRunning() && !SceneManager.isSceneChanging() && Input.isLongPressed('control'))) {
        this.updateMain()
    }
}