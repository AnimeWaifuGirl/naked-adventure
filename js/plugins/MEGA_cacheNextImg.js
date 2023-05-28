/*:
* @plugindesc cache next img by erahunterteam
*
*/

(function () {
	var Game_Interpreter_command231 = Game_Interpreter.prototype.command231
	Game_Interpreter.prototype.command231 = function() {
		var x, y;
		if (this._params[3] === 0) {  // Direct designation
			x = this._params[4];
			y = this._params[5];
		} else {  // Designation with variables
			x = $gameVariables.value(this._params[4]);
			y = $gameVariables.value(this._params[5]);
		}
	
		for(var i = this._index + 1; i < this._list.length; i += 1) {
			if(this._list[i].code === 231) {
				console.log(11, this._list[i].parameters[1])
				ImageManager.reserveBitmap('img/pictures/', this._list[i].parameters[1], 0, true, this._list[i].parameters[0])
				break
			}
		}
	
		$gameScreen.showPicture(this._params[0], this._params[1], this._params[2],
			x, y, this._params[6], this._params[7], this._params[8], this._params[9]);
		return true;
	};

	// Game_Interpreter.prototype.command231 = function() {
	// 	for(var i = this._index + 1; i < this._list.length; i += 1) {
	// 		if(this._list[i].code === 231) {
	// 			ImageManager.reserveBitmap('img/pictures/', this._list[i].parameters[1], 0, true, this._list[i].parameters[0])
	// 			break
	// 		}
	// 	}

	// 	return Game_Interpreter_command231.bind(this)
	// };
})()