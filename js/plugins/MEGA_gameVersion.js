/*:
* @plugindesc show game version
* 
* @param version
*
* @param x
* @default 20
*
* @param y
* @default Graphics.height / 4
*
* @param fontSize
* @default 72
*
* @param position
* @default center
*/
'use strict';

(function () {
	var params = params || {}
	params['gameVersion'] = {}
	var tempParameters = PluginManager.parameters('MEGA_gameVersion')
	params['gameVersion'].version = tempParameters['version'] || ''
	params['gameVersion'].x = tempParameters['x'] | 0
	params['gameVersion'].y = tempParameters['y'] | 0
	params['gameVersion'].fontSize = tempParameters['fontSize'] | 0
	params['gameVersion'].position = tempParameters['position']

	var gameVersion = ' v' + params['gameVersion'].version

	Scene_Boot.prototype.updateDocumentTitle = function () {
		// $dataSystem.gameTitle = $dataSystem.gameTitle + ' 0.5';
		document.title = $dataSystem.gameTitle + gameVersion;
	}

	Scene_Title.prototype.drawGameTitle = function () {
		var x = params['gameVersion'].x;
		var y = params['gameVersion'].y;
		var maxWidth = Graphics.width - x * 2;
		var text = $dataSystem.gameTitle + gameVersion;
		this._gameTitleSprite.bitmap.outlineColor = 'black';
		this._gameTitleSprite.bitmap.outlineWidth = 8;
		this._gameTitleSprite.bitmap.fontSize = params['gameVersion'].fontSize;
		this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, params['gameVersion'].position);
	};

})()

