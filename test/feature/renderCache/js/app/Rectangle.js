define([
    'layer/Renderable',
    'layer/RenderCache'
], function(
    Renderable,
    RenderCache
) {
    'use strict';
    
    var _renderRectangle = function(context) {
        context.fillStyle = this.fillStyle;
        context.fillRect(0, 0, this.unscaledWidth, this.unscaledHeight);
    };
    
    var Rectangle = function(x, y, width, height) {
        this.init(x, y, width, height);
    };
    
    Rectangle.prototype = new Renderable();
    Rectangle.prototype.constructor = Rectangle;
    Rectangle.prototype.Renderable_init = Renderable.prototype.init;
    Rectangle.prototype.Renderable_render = Renderable.prototype.render;
    
    Rectangle.prototype.init = function(x, y, width, height) {
        this.Renderable_init(x, y, width, height);
        
        this.fillStyle = 'hsl(' + Math.round(Math.random() * 255) + ', 100%, 50%)';
        
        this.renderCache = new RenderCache(width, height, _renderRectangle.bind(this));
        this.cache = this.renderCache.getContent();
    };
    
    Rectangle.prototype.onMouseMove = function(event) {
        this.fillStyle = 'hsl(' + Math.round(Math.random() * 255) + ', 100%, 50%)';
        event.bubbles = false;
        this.renderCache.render();
    };
    
    Rectangle.prototype.render = function(context) {
        this.Renderable_render(context);
        context.drawImage(this.cache, 0, 0);
    };
    
    return Rectangle;
});