/*:
 * @plugindesc on macos saves in local user dir
 * 
 */

(function () {
	var gui = require('nw.gui');
	var os = require('os');

	var temp_StorageManagerlocalFileDirectoryPath = StorageManager.localFileDirectoryPath
	StorageManager.localFileDirectoryPath = function () {
		try {
			if (os.platform() === 'darwin') {
				return gui.App.dataPath + "\\" + window.$dataSystem.gameTitle + "\\";
			}
			else {
				return temp_StorageManagerlocalFileDirectoryPath.call(this)
			}
		}
		catch (e) {
			return temp_StorageManagerlocalFileDirectoryPath.call(this)
		}
	}
})()