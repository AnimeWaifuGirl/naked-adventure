/*:
* @plugindesc change language by erahunterteam
* 
*/
'use strict';

var globalVar = {}
globalVar.defaultLang = 'eng'
globalVar.skipLang = 'rus'

var langEnum = {
    0: 'eng',
    1: 'rus'
}

var temp_default_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
Window_TitleCommand.prototype.makeCommandList = function () {
    temp_default_makeCommandList.call(this);

    this.addCommand('Language', 'language');
}

var temp_default_createCommandWindow = Scene_Title.prototype.createCommandWindow;
Scene_Title.prototype.createCommandWindow = function () {
    temp_default_createCommandWindow.call(this);
    this._commandWindow.setHandler('language', this.showLanguage.bind(this))
}

Scene_Title.prototype.showLanguage = function () {
    this._commandWindow.close();
    SceneManager.push(Scene_Lang);
}

/*  */

DataManager.loadDataFile = function (name, src) {
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src;

    if (ConfigManager.lang && ConfigManager.lang !== globalVar.skipLang) {
        url = 'data/' + ConfigManager.lang + '/' + src;
    }

    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function () {
        if (xhr.status < 400) {
            window[name] = JSON.parse(xhr.responseText);
            DataManager.onLoad(window[name]);
        }
    };
    xhr.onerror = this._mapLoader || function () {
        DataManager._errorUrl = DataManager._errorUrl || url;
    };
    window[name] = null;
    xhr.send();
};

/*   */

(function () {
    var temp_ConfigManager_makeData = ConfigManager.makeData
    ConfigManager.makeData = function () {
        var config = temp_ConfigManager_makeData.call(this)
        config.lang = this.lang
        return config
    };

    var temp_ConfigManager_applyData = ConfigManager.applyData
    ConfigManager.applyData = function (config) {
        this.lang = config.lang

        temp_ConfigManager_applyData.call(this, config)
    }

    ConfigManager.load()

    var autoLang = ''
    var navLang = navigator.language
    if (~navLang.indexOf('en')) {
        autoLang = 'eng'
    }
    else if (~navLang.indexOf('ru')) {
        autoLang = 'rus'
    }

    var notFindLang = false
    for (var index in langEnum) {
        if (ConfigManager.lang === langEnum[index]) {
            notFindLang = false
            break
        }
        else {
            notFindLang = true
        }
    }
    if (notFindLang) {
        ConfigManager.lang = autoLang
        ConfigManager.save()
    }
})()

/* Scene_Lang */

function Scene_Lang() {
    this.initialize.apply(this, arguments);
}

Scene_Lang.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Lang.prototype.constructor = Scene_Lang;

Scene_Lang.prototype.initialize = function () {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Lang.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);
    this.createOptionsWindow();
};

Scene_Lang.prototype.terminate = function () {
    Scene_MenuBase.prototype.terminate.call(this);
    ConfigManager.save();
};

Scene_Lang.prototype.createOptionsWindow = function () {
    this._optionsWindow = new Lang_Options();
    this._optionsWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._optionsWindow);
};

/* Lang_Options */

function Lang_Options() {
    this.initialize.apply(this, arguments);
}

Lang_Options.prototype = Object.create(Window_Command.prototype);
Lang_Options.prototype.constructor = Lang_Options;

Lang_Options.prototype.initialize = function () {
    Window_Command.prototype.initialize.call(this, 0, 0);
    this.updatePlacement();
};

Lang_Options.prototype.windowWidth = function () {
    return 400;
};

Lang_Options.prototype.windowHeight = function () {
    return this.fittingHeight(Math.min(this.numVisibleRows(), 12));
};

Lang_Options.prototype.updatePlacement = function () {
    this.x = (Graphics.boxWidth - this.width) / 2;
    this.y = (Graphics.boxHeight - this.height) / 2;
};

Lang_Options.prototype.makeCommandList = function () {
    this.addCommand('English', 'lang')
    this.addCommand('Russian', 'lang')
}

Lang_Options.prototype.drawItem = function (index) {
    var rect = this.itemRectForText(index);
    var statusWidth = this.statusWidth();
    var titleWidth = rect.width - statusWidth;
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(this.commandName(index), rect.x, rect.y, titleWidth, 'left');
    this.drawText(this.statusText(index), titleWidth, rect.y, statusWidth, 'right');
};

Lang_Options.prototype.statusWidth = function () {
    return 120;
};

Lang_Options.prototype.statusText = function (index) {
    var symbol = this.commandSymbol(index);
    var value = this.getConfigValue(symbol);

    if (langEnum[index] === value) {
        return '✓'
    }
    else {
        return ''
    }

    return this.booleanStatusText(value);


    // if (langEnum[index] === ConfigManager.lang) {
    //     return 'ON'
    // }
    // else {
    //     return ''
    // }
}

Lang_Options.prototype.processOk = function () {
    // if (!ConfigManager.lang) {
    //     ConfigManager.lang = 'eng'
    // }
    // else if (ConfigManager.lang === 'eng') {
    //     ConfigManager.lang = ''
    // }
    // else {
    //     ConfigManager.lang = 'eng'
    // }
    // ConfigManager.save()
    // location.reload()

    // this._commandWindow.activate()

    var index = this.index()
    var symbol = this.commandSymbol(index)

    if (ConfigManager[symbol] !== langEnum[index]) {
        this.drawAllItems()

        SoundManager.playCursor()

        ConfigManager[symbol] = langEnum[index]
        ConfigManager.save()

        location.reload()
    }
}

Lang_Options.prototype.changeValue = function (symbol, value) {
    var lastValue = this.getConfigValue(symbol);
    if (lastValue !== value) {
        this.setConfigValue(symbol, value);
        this.redrawItem(this.findSymbol(symbol));
        SoundManager.playCursor();
    }
};

Lang_Options.prototype.getConfigValue = function (symbol) {
    return ConfigManager[symbol];
};

Lang_Options.prototype.setConfigValue = function (symbol, volume) {
    ConfigManager[symbol] = volume;
};
