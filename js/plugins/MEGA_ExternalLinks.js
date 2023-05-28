//=============================================================================
/*:
* @plugindesc Add link to menu
*
* @param URL
* @default https://www.google.com/
*
* @param Text
* @default link
*/
//=============================================================================
var Imported = Imported || {};
Imported.MEGA_ExternalLinks = true;

var megaEL = megaEL || {};
megaEL.Parameters = PluginManager.parameters('MEGA_ExternalLinks');

megaEL.url = String(megaEL.Parameters['URL']);
megaEL.text = String(megaEL.Parameters['Text']);

megaEL.default_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
Window_TitleCommand.prototype.makeCommandList = function () {
	megaEL.default_makeCommandList.call(this);
	this.goToLink();
}

Window_TitleCommand.prototype.goToLink = function () {
	if (megaEL.url.length <= 0) return;
	this.addCommand(megaEL.text, 'goToLink');
}

megaEL.default_createCommandWindow = Scene_Title.prototype.createCommandWindow;
Scene_Title.prototype.createCommandWindow = function () {
	megaEL.default_createCommandWindow.call(this);
	this._commandWindow.setHandler('goToLink', this.commandHomePage.bind(this));
}

Scene_Title.prototype.commandHomePage = function () {
	try {
		var shell = require('nw.gui').Shell
		shell.openExternal(megaEL.url);
		TouchInput.clear();
		Input.clear();
	}
	catch (e) {
		// confirm('Open link ' + megaEL.url + '?')
		alert(megaEL.url)
		window.open(megaEL.url, '_blank');

		// var closeModal = document.querySelector('#closeModal')
		// if (closeModal) {
		// 	closeModal.remove()
		// }

		// var body = document.querySelector('body')
		// var itemLink = document.createElement('div')
		// body.appendChild(itemLink)

		// var html = '<div id="closeModal"><div style="border: 2px solid #295693;border-radius: 9px;top: calc(50% - 100px); left: calc(50% - 120px); margin:0 auto; padding: 20px; background: white;text-align: center;position: absolute;z-index: 999;">'
		// 	+ '<div style="margin-bottom: 20px; text-align: right;" onclick="document.querySelector(\'#closeModal\').remove()"><a style="text-decoration:none;" href="#">Close</a></div>'
		// 	// + '<div>Link to patreon:</div>'
		// 	+ '<a href="' + megaEL.url + '" target="_blank">' + megaEL.url + '</a>'
		// 	+ '</div></div>'

		// itemLink.innerHTML = html
	}

	this._commandWindow.activate();
}

/*
  if (Utils.isNwjs() && Utils.isOptionValid('test')) {
    var _debugWindow = require('nw.gui').Window.get().showDevTools();
    //_debugWindow.moveTo(0, 0);
    window.focus();
  }
*/