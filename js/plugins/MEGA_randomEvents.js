/*:
* @plugindesc random event where comment "random" by erahunterteam
*
*/

(function () {
	var eraseEventIdList = []

    var temp_Game_Map_setup = Game_Map.prototype.setup
    Game_Map.prototype.setup = function(mapId) {
        eraseEventIdList = []
		temp_Game_Map_setup.call(this, mapId)
    }

	var temp_Game_Map_setupEvents = Game_Map.prototype.setupEvents
	Game_Map.prototype.setupEvents = function () {
		temp_Game_Map_setupEvents.call(this)

		if (eraseEventIdList.length) {
			for (var index in eraseEventIdList) {
                var eventId = eraseEventIdList[index]
				if ($gameMap._events[eventId]) {
					$gameMap.eraseEvent(eventId)
				}
			}
			eraseEventIdList = []
		}
	}

	var aliasGameEventSetupPageSettings = Game_Event.prototype.setupPageSettings
	Game_Event.prototype.setupPageSettings = function () {
		aliasGameEventSetupPageSettings.call(this)

		var page = this.page()
		for (var i = 0; i < page.list.length; i++) {
			if (page.list[i].code == 108) {
				var params = page.list[i].parameters[0]
				if (params == 'random') {
					if (randomInteger(0, 3) % 2 == 0) {
						eraseEventIdList.push(this.eventId())
					}
					break
				}
			}
		}
	}

	function randomInteger(min, max) {
		var rand = min - 0.5 + Math.random() * (max - min + 1)
		rand = Math.round(rand)
		return rand
	}
})()