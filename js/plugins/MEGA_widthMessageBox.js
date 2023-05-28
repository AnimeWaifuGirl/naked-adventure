var wmpi = Window_Message.prototype.initialize 

Window_Message.prototype.initialize = function() {
    var width = 1020;
    var height = this.windowHeight();
    var x = (Graphics.boxWidth - width) / 2;
    Window_Base.prototype.initialize.call(this, x, 0, width, height);
    this.openness = 0;
    this.initMembers();
    this.createSubWindows();
    this.updatePlacement();
};