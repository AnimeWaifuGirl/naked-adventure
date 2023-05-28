var Galv = Galv || {};                  // Galv's main object
Galv.QUEST = Galv.QUEST || {};          // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc Galv's Quest Log v.1.3 (modding erahunterteam)
 * 
*/

(function () {

	//-----------------------------------------------------------------------------
	// GET TXT FILE
	//-----------------------------------------------------------------------------

	Galv.QUEST.file = {};

	Galv.QUEST.file.getJsonString = function (filepath) {
		var request = new XMLHttpRequest();
		request.open("GET", filepath);
		request.overrideMimeType('application/json');
		request.onload = function () {
			if (request.status < 400) {
				Galv.QUEST.createQuestsFromJson(request.responseText);
			}
		};
		request.send();
	};

	Galv.QUEST.createQuestsFromJson = function (string) {
		var MAX_LINE_LEN = 42

		var json = {}
		try {
			json = JSON.parse(string)
		}
		catch (e) {
			console.error(e)
		}

		var bIndex = 0;
		Galv.QUEST.txt = {};

		for (var i = 0; i < json.quests.length; i++) {
			var quest = json.quests[i]

			bIndex = Number(quest.id);
			Galv.QUEST.txt[bIndex] = {};
			Galv.QUEST.txt[bIndex].desc = [];

			Galv.QUEST.txt[bIndex].name = quest.name || '???';
			Galv.QUEST.txt[bIndex].difficulty = quest.difficulty || '';
			Galv.QUEST.txt[bIndex].category = quest.category || 0;

			Galv.QUEST.txt[bIndex].desc.push(quest.first)
			Galv.QUEST.txt[bIndex].desc.push('')

			quest.desc = quest.desc || ''

			var arr = [quest.desc]
			if (quest.desc.length > MAX_LINE_LEN) {
				arr = []
				var splitArr = quest.desc.split(' ')
				var tempStr = ''
				for (var q = 0; q < splitArr.length; q++) {
					if ((tempStr + splitArr[q]).length > MAX_LINE_LEN) {
						var newArr = tempStr.split('\n')
						arr = arr.concat(newArr)
						tempStr = ''
					}

					tempStr += splitArr[q] + ' '
				}

				if (tempStr.length) {
					var newArr2 = tempStr.split('\n')
					arr = arr.concat(newArr2)
				}
			}

			Galv.QUEST.txt[bIndex].desc = Galv.QUEST.txt[bIndex].desc.concat(arr)
			Galv.QUEST.txt[bIndex].desc.push('')
		}

		for (var name in json) {
			if (name === 'quests') {
				continue
			}
			Galv.QUEST[name] = json[name]
		}

		Galv.QUEST.categories = [];
		var cats = json.categories.split(',');
		for (var i = 0; i < cats.length; i++) {
			var data = cats[i].split("|")
			Galv.QUEST.categories[i] = { id: i, name: data[0], color: data[1] };
		}
	}

	Galv.QUEST.fileName = function () {
		if (!Galv.QUEST.txt) {
			var filepath = "data/QuestInfo.json"
			
			if (ConfigManager.lang && ConfigManager.lang !== globalVar.skipLang) {
				filepath = "data/" + ConfigManager.lang + "/QuestInfo.json"
			}

			Galv.QUEST.file.getJsonString(filepath)
		};
	}();


	Galv.QUEST.sep = ',';
	Galv.QUEST.fontSize = 22;

	Galv.QUEST.categories = [];

	Galv.QUEST.menuCmd = 'Quests';
	Galv.QUEST.txtCmdActive = '';
	Galv.QUEST.txtCmdComplete = '';
	Galv.QUEST.txtCmdFailed = '';
	Galv.QUEST.txtDesc = '';
	Galv.QUEST.txtObj = '';
	Galv.QUEST.txtDiff = '';
	Galv.QUEST.txtNoTrack = '';

	// Galv.QUEST.menuCmd = 'Quests';
	// Galv.QUEST.txtCmdActive = 'Active';
	// Galv.QUEST.txtCmdComplete = 'Complite';
	// Galv.QUEST.txtCmdFailed = 'Failed';
	// Galv.QUEST.txtDesc = 'Desc';
	// Galv.QUEST.txtObj = 'Obj';
	// Galv.QUEST.txtDiff = '';
	// Galv.QUEST.txtNoTrack = 'NoTrack';

	// Icons
	Galv.QUEST.icon0 = 163;
	Galv.QUEST.icon1 = 164;
	Galv.QUEST.icon2 = 162;
	Galv.QUEST.icon3 = 82;

	// Extra
	Galv.QUEST.popXY = [20, 20];

	Galv.QUEST.popTime = 130;
	Galv.QUEST.txtPopQA = '';
	Galv.QUEST.txtPopQC = '';
	Galv.QUEST.txtPopQF = '';
	Galv.QUEST.txtPopOA = '';
	Galv.QUEST.txtPopOC = '';
	Galv.QUEST.txtPopOF = '';

	//-----------------------------------------------------------------------------
	// FUNCTIONALITY
	//-----------------------------------------------------------------------------


	// change status of a category
	Galv.QUEST.catStatus = function (id, status) {
		$gameSystem._quests.categoryActive[id] = status;
	};

	// remove quest from active, completed or failed lists. Quest will still exist as obtained, however.
	Galv.QUEST.removeQuest = function (id) {
		if ($gameSystem._quests.quest[id]) {
			Galv.QUEST.sliceArray($gameSystem._quests.active, id);
			Galv.QUEST.sliceArray($gameSystem._quests.completed, id);
			Galv.QUEST.sliceArray($gameSystem._quests.failed, id);
			$gameSystem._quests.quest[id]._status = -1;
		}
	};

	Galv.QUEST.sliceArray = function (array, element) {
		var index = array.indexOf(element);
		if (index > -1) {
			array.splice(index, 1);
		}
	};

	// create quest if doesn't exist
	Galv.QUEST.create = function (id) {
		if (!$gameSystem._quests.quest[id] && Galv.QUEST.txt[id]) {
			Galv.QUEST.removeQuest(id);
			$gameSystem._quests.quest[id] = new Game_Quest(id);
		}
	};

	Galv.QUEST.convStatus = {
		0: 'active',
		1: 'completed',
		2: 'failed',
		'-1': 'hidden',
		'hide': -1,
		'active': 0,
		'activate': 0,
		'completed': 1,
		'complete': 1,
		'failed': 2,
		'fail': 2,
	};

	// Change quest status
	Galv.QUEST.put = function (id, status) {
		var status = status || 0;
		var place = Galv.QUEST.convStatus[status];

		if (status != 0) $gameSystem._quests.tracked = null;
		if ($gameSystem._quests.quest[id]) {
			Galv.QUEST.removeQuest(id);          // remove from all array
			$gameSystem._quests[place].unshift(id); // add to desired array
			$gameSystem._quests.quest[id]._status = status;  // set quest status
		}
	};

	Galv.QUEST.fail = function (id, hidePopup) {
		Galv.QUEST.create(id);
		Galv.QUEST.put(id, 2);
		if (!hidePopup) Galv.QUEST.popup(id, 2);
	};

	Galv.QUEST.complete = function (id, hidePopup) {
		Galv.QUEST.create(id);
		Galv.QUEST.put(id, 1);
		if (!hidePopup) Galv.QUEST.popup(id, 1);
	};

	Galv.QUEST.activate = function (id, hidePopup) {
		Galv.QUEST.create(id);
		Galv.QUEST.put(id, 0);
		if (!hidePopup) Galv.QUEST.popup(id, 0);
	};

	Galv.QUEST.popup = function (id, status, obj) {
		// plugin writers overwrite this if they want to use different notification/popup
		if (!SceneManager._scene) return;
		var x = Galv.QUEST.popXY[0];
		var y = Galv.QUEST.popXY[1];
		var time = Galv.QUEST.popTime;
		switch (status) {
			case -1:
				return; // -1 is hiding an objective.
			case 0:
				var txt = obj != undefined ? Galv.QUEST.txtPopOA : Galv.QUEST.txtPopQA;
				break;
			case 1:
				var txt = obj != undefined ? Galv.QUEST.txtPopOC : Galv.QUEST.txtPopQC;
				break;
			case 2:
				var txt = obj != undefined ? Galv.QUEST.txtPopOF : Galv.QUEST.txtPopQF;
				break;
		}
		if (txt) {
			if (obj != undefined) {
				var name = $gameSystem._quests.quest[id].objectives()[obj];
			} else {
				var name = $gameSystem._quests.quest[id].name();
			}
			SceneManager._scene.createCaptionWindow([x, y], time, [txt + " " + name], [], 0);
		}

	};




	// Change quest objective status
	Galv.QUEST.objective = function (id, objId, status, hidePopup) {
		Galv.QUEST.create(id);
		if (isNaN(status)) var status = Galv.QUEST.convStatus[status];
		// status can be: 0 is not yet complete, 1 is completed, 2 is failed
		if ($gameSystem._quests.quest[id]) {
			$gameSystem._quests.quest[id]._objectives[objId] = status;
			if (!hidePopup) Galv.QUEST.popup(id, status, objId);
		}
	};

	Galv.QUEST.track = function (id) {
		if ($gameSystem._quests.quest[id] && $gameSystem._quests.quest[id]._status == 0) {
			$gameSystem._quests.tracked = id;
		} else {
			$gameSystem._quests.tracked = null;
		}
	};

	Galv.QUEST.isTracked = function () {
		return $gameSystem._quests.tracked || 0;
	};

	Galv.QUEST.status = function (id, obj) {
		if ($gameSystem._quests.quest[id]) {
			if (obj != undefined) {
				return $gameSystem._quests.quest[id]._objectives[obj];
			} else {
				return $gameSystem._quests.quest[id]._status;
			}
		} else {
			return -1;
		}
	};

	Galv.QUEST.resolution = function (id, index) {
		if ($gameSystem._quests.quest[id]) $gameSystem._quests.quest[id]._resolution = index;
	};

	Galv.QUEST.viewLog = function () {
		SceneManager.push(Scene_QuestLog);
	};


	//-----------------------------------------------------------------------------
	//  GAME SYSTEM
	//-----------------------------------------------------------------------------

	Galv.QUEST.Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function () {
		Galv.QUEST.Game_System_initialize.call(this);
		this._quests = {
			tracked: null,
			quest: {},        // id: Game_Quest  - to store obtained quest objects
			active: [],       // array of quest id's player has activated
			completed: [],    // array of quest id's player has completed
			failed: [],       // array of quest id's player has failed
			categoryHide: { active: [], completed: [], failed: [] },  // arrays containing data if category id is expanded or not (0/null for open, 1/true for closed)
			categoryActive: [],
		};

		// set all cats to true
		for (var i = 0; i < Galv.QUEST.categories.length; i++) {
			this._quests.categoryActive[i] = true;
		}
	};

})();


//-----------------------------------------------------------------------------
//  GAME QUEST
//-----------------------------------------------------------------------------

function Game_Quest() {
	this.initialize.apply(this, arguments);
}

Game_Quest.prototype.initialize = function (id, cat) {
	this._id = id;
	this._cat = cat || 0;
	this._objectives = []; // indexes can be 0,1,2 to store the status of objectives. 0 (or undefined/null) is not yet complete, 1 is completed, 2 is failed
	this._resolution = -1; // the selected resolution to display under the quest description in the quest log. -1 for none.
	this._status = 0;      // 0 is not yet completed, 1 is completed, 2 is failed
};

Game_Quest.prototype.desc = function () {
	return Galv.QUEST.txt[this._id].desc.slice(2);  // returns the description without the first 2 lines (which is objectives and resolutions)
};

Game_Quest.prototype.name = function () {
	return Galv.QUEST.txt[this._id].name;
};

Game_Quest.prototype.difficulty = function () {
	return Galv.QUEST.txt[this._id].difficulty;
};

Game_Quest.prototype.category = function () {
	return Galv.QUEST.txt[this._id].category;
};

Game_Quest.prototype.objectives = function () {
	var array = Galv.QUEST.txt[this._id].desc[0].split(Galv.QUEST.sep);
	return array[0].length <= 1 ? [] : array;
};

Game_Quest.prototype.resolutions = function () {
	var array = Galv.QUEST.txt[this._id].desc[1].split(Galv.QUEST.sep);
	return array[0].length <= 1 ? [] : array;
};

Game_Quest.prototype.hasResolution = function () {
	return this._resolution >= 0;
};

Game_Quest.prototype.resoTxtArray = function () {
	var txt = "";
	if (this._resolution >= 0) {
		var txt = this.resolutions()[this._resolution];
		txt = txt.split('|');
	}
	return txt;
};


//-----------------------------------------------------------------------------
//  SCENE QUESTLOG
//-----------------------------------------------------------------------------

function Scene_QuestLog() {
	this.initialize.apply(this, arguments);
}

Scene_QuestLog.prototype = Object.create(Scene_ItemBase.prototype);
Scene_QuestLog.prototype.constructor = Scene_QuestLog;

Scene_QuestLog.prototype.initialize = function () {
	Scene_ItemBase.prototype.initialize.call(this);
};

Scene_QuestLog.prototype.create = function () {
	Scene_ItemBase.prototype.create.call(this);
	this.createCategoryWindow();
	this.createQuestListWindow();
	this.createInfoWindow();

	this._itemWindow.activate();
	this._itemWindow.select(0);
};

Scene_QuestLog.prototype.createCategoryWindow = function () {
	this._categoryWindow = new Window_QuestCategory();
	this._categoryWindow.setHandler('ok', this.onCategoryOk.bind(this));
	this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
	this.addWindow(this._categoryWindow);
};

Scene_QuestLog.prototype.createQuestListWindow = function () {
	this._categoryWindow.y = 0
	this._categoryWindow.height = 0

	var wy = this._categoryWindow.y + this._categoryWindow.height;
	var ww = Graphics.boxWidth / 2;
	var wh = Graphics.boxHeight - wy;
	this._itemWindow = new Window_QuestList(0, wy, ww, wh);
	this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
	this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
	this.addWindow(this._itemWindow);
	this._categoryWindow.setItemWindow(this._itemWindow);
};

Scene_QuestLog.prototype.createInfoWindow = function () {
	var ww = this._itemWindow.width;
	var wh = this._itemWindow.height;
	var wx = this._itemWindow.x + ww;
	var wy = this._itemWindow.y;
	this._helpWindow = new Window_QuestInfo(wx, wy, ww, wh);
	this.addWindow(this._helpWindow);

	this._itemWindow.setHelpWindow(this._helpWindow);
	this._categoryWindow.setHelpWindow(this._helpWindow);
};

Scene_QuestLog.prototype.onCategoryOk = function () {
	this._itemWindow.activate();
	this._itemWindow.select(0);
};

Scene_QuestLog.prototype.onItemOk = function () {
	this._itemWindow.setTracking();
	this._itemWindow.refresh();
	this._helpWindow.refresh();
	this._itemWindow.activate();
};

Scene_QuestLog.prototype.onItemCancel = function () {
	this._itemWindow.deselect();
	this._categoryWindow.activate();
};


//-----------------------------------------------------------------------------
//  WINDOW QUESTCATEGORY
//-----------------------------------------------------------------------------

function Window_QuestCategory() {
	this.initialize.apply(this, arguments);
}

Window_QuestCategory.prototype = Object.create(Window_HorzCommand.prototype);
Window_QuestCategory.prototype.constructor = Window_QuestCategory;

Window_QuestCategory.prototype.initialize = function () {
	Window_HorzCommand.prototype.initialize.call(this, 0, 0);
};

Window_QuestCategory.prototype.windowWidth = function () {
	return Graphics.boxWidth;
};

Window_QuestCategory.prototype.maxCols = function () {
	return Galv.QUEST.txtCmdFailed == "" ? 2 : 3;
};

Window_QuestCategory.prototype.update = function () {
	Window_HorzCommand.prototype.update.call(this);
	if (this._itemWindow) {
		this._itemWindow.setCategory(this.currentSymbol());
	}
};

Window_QuestCategory.prototype.makeCommandList = function () {
	this.addCommand(Galv.QUEST.txtCmdActive, 'active');
	this.addCommand(Galv.QUEST.txtCmdComplete, 'completed');
	if (Galv.QUEST.txtCmdFailed != "") this.addCommand(Galv.QUEST.txtCmdFailed, 'failed');
};

Window_QuestCategory.prototype.setItemWindow = function (itemWindow) {
	this._itemWindow = itemWindow;
	this.update();
};


//-----------------------------------------------------------------------------
//  WINDOW QUESTCATEGORY
//-----------------------------------------------------------------------------

function Window_QuestList() {
	this.initialize.apply(this, arguments);
}

Window_QuestList.prototype = Object.create(Window_Selectable.prototype);
Window_QuestList.prototype.constructor = Window_QuestList;

Window_QuestList.prototype.initialize = function (x, y, width, height) {
	Window_Selectable.prototype.initialize.call(this, x, y, width, height);
	this._category = 'none';
	this._data = [];
};

Window_QuestList.prototype.setCategory = function (category) {
	if (this._category !== category) {
		this._category = category;
		this.refresh();
		this.resetScroll();
	}
};

Window_QuestList.prototype.maxCols = function () {
	return 1;
};

Window_QuestList.prototype.spacing = function () {
	return 48;
};

Window_QuestList.prototype.maxItems = function () {
	return this._data ? this._data.length : 1;
};

Window_QuestList.prototype.item = function (index) {
	var index = index == undefined ? this.index() : index;
	var obj = isNaN(this._data[index]) ? this._data[index] : $gameSystem._quests.quest[this._data[index]];

	return this._data && index >= 0 ? obj : null;
};

Window_QuestList.prototype.setTracking = function () {
	if (!this.item()) return;
	if (this.item().categoryTitle != undefined) {
		// hide/show category
		var catId = this.item().categoryTitle;
		// $gameSystem._quests.categoryHide[this._category][catId] = !$gameSystem._quests.categoryHide[this._category][catId];
	} else {
		// Track quest
		if (this.item()._id == Galv.QUEST.isTracked()) {
			Galv.QUEST.track();
		} else {
			Galv.QUEST.track(this.item()._id);
		}
	}
};

Window_QuestList.prototype.makeItemList = function () {
	this._data = [];
	this.buildQuestList();

	var q1 = this.buildQuestList($gameSystem._quests.active, 'active');
	var q2 = this.buildQuestList($gameSystem._quests.completed, 'completed');
	var q3 = this.buildQuestList($gameSystem._quests.failed, 'failed');
	this._data = q1.concat(q2, q3)

	// switch (this._category) {
	// 	case 'active':
	// 		this._data = this.buildQuestList($gameSystem._quests.active);
	// 		break;
	// 	case 'completed':
	// 		this._data = this.buildQuestList($gameSystem._quests.completed);
	// 		break;
	// 	case 'failed':
	// 		this._data = this.buildQuestList($gameSystem._quests.failed);
	// 		break;
	// }
};

Window_QuestList.prototype.buildQuestList = function (questList, catName) {
	var list = [];
	var questList = questList || [];

	// setup lists for categories
	for (var i = 0; i < Galv.QUEST.categories.length; i++) {
		switch (catName) {
			case 'active':
				catName = Galv.QUEST.txtCmdActive;
				break;
			case 'completed':
				catName = Galv.QUEST.txtCmdComplete;
				break;
			case 'failed':
				catName = Galv.QUEST.txtCmdFailed;
				break;
		}
		if ($gameSystem._quests.categoryActive[i]) list[i] = [{ categoryTitle: i, count: 0, catName: catName }];
	}

	// put quests into categories
	for (var i = 0; i < questList.length; i++) {
		var cat = $gameSystem._quests.quest[questList[i]].category();
		if (!$gameSystem._quests.categoryActive[cat]) continue;
		list[cat][0].count += 1;

		if (!$gameSystem._quests.categoryHide[this._category][cat]) { // only add it if category isn't hidden
			list[cat].push(questList[i]);
		}
	}

	// concat lists
	var final = [];
	for (var i = 0; i < list.length; i++) {
		final = final.concat(list[i]);
	}
	final = final.filter(function (n) { return n != undefined });

	return final;
};

Window_QuestList.prototype.drawItem = function (index) {
	var item = this.item(index);
	if (item) {
		var rect = this.itemRect(index);
		rect.width -= this.textPadding();

		if (item.categoryTitle != undefined) {
			var cat = Galv.QUEST.categories[item.categoryTitle]
			var txt = item.catName || cat.name;
			this.changeTextColor(cat.color);
			this.drawText(txt, rect.x + 4, rect.y, rect.width);
			this.drawText("(" + item.count + ")", rect.x, rect.y, rect.width, 'right');
			this.changeTextColor(this.normalColor());
		} else {
			var icon = item._id == $gameSystem._quests.tracked ? Galv.QUEST.icon3 : Galv.QUEST['icon' + item._status];
			this.drawIcon(icon, rect.x, rect.y);
			this.drawText(item.name(), rect.x + 40, rect.y, rect.width);
		}
	}
};

Window_QuestList.prototype.updateHelp = function () {
	this.setHelpWindowItem(this.item());
};

Window_QuestList.prototype.refresh = function () {
	this.makeItemList();
	this.createContents();
	this.contents.fontSize = Galv.QUEST.fontSize;
	this.drawAllItems();
};


//-----------------------------------------------------------------------------
//  WINDOW QUESTINFO
//-----------------------------------------------------------------------------

function Window_QuestInfo() {
	this.initialize.apply(this, arguments);
}

Window_QuestInfo.prototype = Object.create(Window_Base.prototype);
Window_QuestInfo.prototype.constructor = Window_QuestInfo;

Window_QuestInfo.prototype.initialize = function (x, y, width, height) {
	Window_Base.prototype.initialize.call(this, x, y, width, height);
	this._quest = null;
	this.refresh();
};

Window_QuestInfo.prototype.clear = function () {
	this.setItem();
};

Window_QuestInfo.prototype.setItem = function (quest) {
	if (this._quest !== quest) {
		this._quest = quest;
		this.refresh();
	}
};

Window_QuestInfo.prototype.refresh = function () {
	this.contents.clear();
	if (this._quest) {
		this.drawQuest(this._quest);
	} else if ($gameSystem._quests.tracked) {
		this.drawQuest($gameSystem._quests.quest[$gameSystem._quests.tracked]);
	} else {
		this.drawNoQuest();
	}
};

Window_QuestInfo.prototype.drawHorzLine = function (y) {
	var lineY = y + this.lineHeight() / 2 - 1;
	this.contents.paintOpacity = 48;
	this.contents.fillRect(0, lineY, this.contentsWidth(), 2, this.normalColor());
	this.contents.paintOpacity = 255;
};

Window_QuestInfo.prototype.standardFontSize = function () {
	return Galv.QUEST.fontSize;
};

Window_QuestInfo.prototype.lineHeight = function () {
	return Galv.QUEST.fontSize + 6;
};

Window_QuestInfo.prototype.drawQuest = function (quest) {
	if (quest.categoryTitle != undefined) return;
	this.changeTextColor(this.normalColor());
	// quest heading
	var icon = quest._id == $gameSystem._quests.tracked ? Galv.QUEST.icon3 : Galv.QUEST['icon' + quest._status];
	this.drawIcon(icon, 0, 0);
	var oy = Math.max((28 - this.standardFontSize()) / 2, 0);
	this.drawText(quest.name(), 40, oy, this.contentsWidth() - 40);
	var lineY = Math.max(32, this.lineHeight());
	this.drawHorzLine(lineY);

	var line = this.lineHeight();
	var y = lineY + line;
	var w = this.contentsWidth();

	// quest difficulty
	this.drawText(Galv.QUEST.txtDiff + " " + quest.difficulty(), 0, y, w, 'right');

	// quest desc
	this.changeTextColor(this.systemColor());
	this.drawText(Galv.QUEST.txtDesc, 0, y, w);

	this.changeTextColor(this.normalColor());
	var desc = quest.desc().slice();

	if (quest.hasResolution()) {
		// if quest has a selected resolution, add it
		desc.push("");
		desc = desc.concat(quest.resoTxtArray()); // add resolution txt
	}

	y += 10;
	for (var i = 0; i < desc.length; i++) {
		y += line;
		this.drawTextEx(desc[i], 0, y);
	}
	y += line * 2;

	// quest objectives
	var objs = quest.objectives();
	if (objs.length > 0) {
		this.changeTextColor(this.systemColor());
		this.drawText(Galv.QUEST.txtObj, 0, y, w);
		this.changeTextColor(this.normalColor());
		y += line + 10;

		// list objectives
		for (var i = 0; i < objs.length; i++) {
			var status = quest._objectives[i] || 0;
			if (status >= 0) {
				var icon = Galv.QUEST['icon' + status];
				this.drawIcon(icon, 0, y);
				this.drawTextEx(objs[i], 40, y + oy);
				y += line + 8;
			}
		}
	}
};

Window_QuestInfo.prototype.drawNoQuest = function () {
	var y = this.contentsHeight() / 2 - this.standardFontSize() / 2 - this.standardPadding();
	this.drawText(Galv.QUEST.txtNoTrack, 0, y, this.contentsWidth(), 'center');
};


//-----------------------------------------------------------------------------
//  ADD MENU COMMAND
//-----------------------------------------------------------------------------

if (Galv.QUEST.menuCmd) { // only add this if there's menu command text
	Galv.QUEST.Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
	Window_MenuCommand.prototype.addOriginalCommands = function () {
		Galv.QUEST.Window_MenuCommand_addOriginalCommands.call(this);
		this.addQuestCommand();
	};

	Window_MenuCommand.prototype.addQuestCommand = function () {
		var enabled = true;
		this.addCommand(Galv.QUEST.menuCmd, 'quest', enabled);
	};

	Galv.QUEST.Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
	Scene_Menu.prototype.createCommandWindow = function () {
		Galv.QUEST.Scene_Menu_createCommandWindow.call(this);
		this._commandWindow.setHandler('quest', this.commandQuestLog.bind(this));
	};

	Scene_Menu.prototype.commandQuestLog = function () {
		Galv.QUEST.viewLog();
	};
};