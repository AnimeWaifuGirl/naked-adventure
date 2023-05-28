/*:
* @plugindesc change dash by erahunterteam
* 
*/
'use strict';

var Imported = Imported || {};
var MEGA_changeDash = {};
var onlyDash = false;
var onlyWalk = false;

var Game_Player_updateDashing_Temp = Game_Player.prototype.updateDashing

Game_Player.prototype.updateDashing = function () {
    if (onlyDash) {
        this._dashing = true
    }
    else if (onlyWalk) {
        this._dashing = false
    }
    else {
        Game_Player_updateDashing_Temp.call(this)
    }
}

    ; (function ($) {
        $.onlyDashReset = function () {
            onlyDash = false
            onlyWalk = false
        }

        $.setOnlyDash = function () {
            onlyDash = true
            onlyWalk = false
        }

        $.setOnlyWalk = function () {
            onlyDash = false
            onlyWalk = true
        }
    })(MEGA_changeDash)

Imported["MEGA_changeDash"] = 1.0