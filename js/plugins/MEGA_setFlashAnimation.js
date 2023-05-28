/*:
 * @plugindesc original plugin Lloyd (Red Iron Labs)
 * @author Lloyd (Red Iron Labs)
 *
 * @help This plugin does not provide plugin commands.
 *
 * @param color
 * @desc CSS color format of the bitmap.  RGB & RGBA allowed (i.e. rgba(0, 255, 0, 0.3)).
 * @default white
 *
 * @param settype
 * @desc none, circle, square, box, url, text, circleoutline
 * @default none
 *
 * @param scale
 * @desc scale from 0 to 1
 * @default 1
 *
 * @param data
 * @desc the text string (i.e. X) OR reference URL to an image to use (i.e. img/system/Shadow1.png)
 * @default img/system/Shadow1.png
 *
 * @param animate
 * @desc Bouncing animation
 * @default on
 *
 * @param bouncespeed
 * @desc Speed of bounce
 * @default 20
 *
 */

(function () {

    function toNumber(str, def) {
        return isNaN(str) ? def :  + (str || def);
    }

    var parameters = PluginManager.parameters('MEGA_setFlashAnimation');
    var color = parameters['color'].toLowerCase();
    var settype = parameters['settype'].toLowerCase();
    var scale = toNumber(parameters['scale'], 1);
    var data = parameters['data'];
    var animate = parameters['animate'].toLowerCase() == "on";
    var bouncespeed = toNumber(parameters['bouncespeed'], 20);

    Sprite_Destination.prototype.updateAnimation = function () {
        if (animate) {
            this._frameCount++;
            this._frameCount %= bouncespeed;
            this.opacity = (bouncespeed - this._frameCount) * 6;
            this.scale.x = 1 + this._frameCount / bouncespeed;
            this.scale.y = this.scale.x;
        }
    };

    Spriteset_Map.prototype.createDestination = function () {
        if (settype != 'none') {
            this._destinationSprite = new Sprite_Destination();
            this._destinationSprite.z = 9;
            this._tilemap.addChild(this._destinationSprite);
        }
    };

    Sprite_Destination.prototype.createBitmap = function () {

        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.bitmap = new Bitmap(tileWidth, tileHeight);

        if (settype == 'square' || settype == 'box') {
            this.bitmap.fillRect(
                (tileWidth - (tileWidth * scale)) / 2,
                (tileHeight - (tileHeight * scale)) / 2,
                tileWidth * scale,
                tileHeight * scale,
                color);
            if (settype == 'box') {
                this.bitmap.clearRect(
                    ((tileWidth - (tileWidth * scale)) / 2) + 4,
                    ((tileHeight - (tileHeight * scale)) / 2) + 4,
                    (tileWidth * scale) - 8,
                    (tileHeight * scale) - 8);
            }
        }

        if (settype == 'circle' || settype == 'circleoutline') {
            var minSize = tileWidth;
            if (tileHeight < tileWidth)
                minSize = tileHeight;
            this.bitmap.drawCircle(tileWidth / 2, tileHeight / 2, (minSize / 2) * scale, color);
            if (settype == 'circleoutline') {
                this.bitmap.drawCircle(tileWidth / 2, tileHeight / 2, ((minSize / 2) * scale) - 4, 'clear');
            }
        }

        if (settype == 'text') {
            this.bitmap.outlineColor = color;
            this.bitmap.drawText(
                data,
                (tileWidth - (tileWidth * scale)) / 2,
                (tileHeight - (tileHeight * scale)) / 2,
                tileWidth * scale,
                tileHeight * scale,
                'center');
            this.bitmap.blur();
        }

        if (settype == 'url') {
            this.bitmap = ImageManager.requestNormalBitmap(data, 0); // Bitmap.load(data);
            this.bitmap.resize(tileWidth, tileHeight);
        };

        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.blendMode = Graphics.BLEND_ADD;
    };

})();