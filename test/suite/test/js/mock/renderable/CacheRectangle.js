define([
    'layer/Renderable',
    'layer/RenderCache'
], function(
    Renderable,
    RenderCache
) {
    'use strict';

    var _render = function(context) {
        context.fillStyle = this.fillStyle;
        context.fillRect(0, 0, this.unscaledWidth, this.unscaledHeight);
    };

    var Rectangle = function(x, y, width, height) {
        if (x !== undefined && y !== undefined && width !== undefined && height !== undefined) {
            this.init(x, y, width, height);
        }
    };

    var _super = Renderable.prototype;
    Rectangle.prototype = new Renderable();
    Rectangle.prototype.constructor = Rectangle;

    Rectangle.prototype.init = function(x, y, width, height) {
        _super.init.call(this, x, y, width, height);

        this.fillStyle = 'rgba(0, 0, 0)';

        this.renderCache = new RenderCache(width, height, _render.bind(this));
        this.cache = this.renderCache.getContent();
    };

    Rectangle.prototype.render = function(context) {
        _super.render.call(this, context);

        context.drawImage(this.cache, 0, 0);
    };

    return Rectangle;
});