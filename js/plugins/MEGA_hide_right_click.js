/*:
@plugindesc hide text mouse right click

*/

(function() {
  var params = PluginManager.parameters("MessageHide");
  var pKey = String(params["key"]).toLowerCase();
  var pNewPage = (function() { 
    var p = String(params["show on new page"]).toLowerCase();
    if (p.match(/true/i)) {
      return true;
    } else if (p.match(/false/i)) {
      return false;
    } else {
      return Utils.isNwjs();
    }
  })();
 
  var key_ids = {
    "tab":9,"enter":13,"shift":16,"ctrl":17,"alt":18,"space":32,
    "0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,
    "a":65,"b":66,"c":67,"d":68,"e":69,"f":70,"g":71,"h":72,"i":73,"j":74,"k":75,"l":76,"m":77,
    "n":78,"o":79,"p":80,"q":81,"r":82,"s":83,"t":84,"u":85,"v":86,"w":87,"x":88,"y":89,"z":90,
    "semicolon":186,"comma":188,"period":190,"quote":222,
  };
 
  Input.keyMapper[key_ids[pKey]] = "messageHide";
 
  //global variables!
  MessageHide_messageWindowShowNext = false;
  MessageHide_messageWindowVisible = true; //global to persist between maps
 
  //=============================================================================
  // Window Message
  //=============================================================================
 
  var alias_wm_ud = Window_Message.prototype.update;
  Window_Message.prototype.update = function() {
    alias_wm_ud.call(this);
    if (MessageHide_messageWindowShowNext === true) {
      MessageHide_messageWindowVisible = true;
      MessageHide_messageWindowShowNext = false;
    } else if (Input.isTriggered("messageHide") === true) {
      MessageHide_messageWindowVisible = !MessageHide_messageWindowVisible;
    }
    this.visible = MessageHide_messageWindowVisible;
  }
 
  var alias_wm_np = Window_Message.prototype.newPage;
  Window_Message.prototype.newPage = function(textState) {
    alias_wm_np.call(this, textState);
    if (pNewPage) MessageHide_messageWindowVisible = true;
  }
 
  //=============================================================================
  // Game Interpreter
  //=============================================================================
 
  var alias_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
      alias_Game_Interpreter_pluginCommand.call(this, command, args);
      if (command === "ShowMessageWindow") {
        MessageHide_messageWindowShowNext = true;
      }
  }
 
})();

var Imported = Imported || {};

(function(){
    var MRP_HIDERIGHTCLICK_WM_UPDATE_OLD = Window_Message.prototype.update;
    Window_Message.prototype.update = function() {
        MRP_HIDERIGHTCLICK_WM_UPDATE_OLD.call(this);
        this.processRightClick();
    };
   
    Window_Message.prototype.isOpenAndActive = function() {
        return this.isOpen() && this.active;
    };
   
    var MRP_HIDERIGHTCLICK_WM_UPDATEINPUT_OLD = Window_Message.prototype.updateInput;
    Window_Message.prototype.updateInput = function() {
        if(this.pause && this.isTriggered() && !this.visible) {
            return true;
        }
        return MRP_HIDERIGHTCLICK_WM_UPDATEINPUT_OLD.call(this);
    };
   
    Window_Message.prototype.processRightClick = function() {
        if(this.isOpenAndActive() && TouchInput.isCancelled()){
            MessageHide_messageWindowVisible = !MessageHide_messageWindowVisible;
        }
    };
   
    if(Imported.YEP_MessageCore){
        var MRP_HIDERIGHTCLICK_WNB_UPDATE = Window_NameBox.prototype.update;
        Window_NameBox.prototype.update = function() {
            MRP_HIDERIGHTCLICK_WNB_UPDATE.call(this);  
            if(this._parentWindow.isOpen())
            {
                this.visible = this._parentWindow.visible;          
            }
        }
    }
})();