/*:
* @plugindesc startOnLoadMap by erahunterteam
*
* @param eventId
* @type number
* @desc common event id when map load
*/

(function () {
	var param = PluginManager.parameters('MEGA_startOnLoadMap')
	var data = {}
	data.eventId = Number(param['eventId']) | 0

	var temp_Game_Map_setupEvents = Game_Map.prototype.setupEvents
	Game_Map.prototype.setupEvents = function () {
		temp_Game_Map_setupEvents.call(this)

		if (data.eventId) {
			$gameTemp.reserveCommonEvent(data.eventId)
		}
	}
})()