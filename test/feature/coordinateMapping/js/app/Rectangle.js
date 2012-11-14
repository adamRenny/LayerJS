define([
    'layer/Renderable'
], function(
    Renderable
) {
    "use strict";
    
    var Rectangle = function(x, y, width, height) {
        this.init(x, y, width, height);
    };
    
    Rectangle.prototype = new Renderable();
    Rectangle.prototype.constructor = Rectangle;
    Rectangle.prototype.Renderable_init = Renderable.prototype.init;
    
    Rectangle.prototype.init = function(x, y, width, height) {
        this.Renderable_init(x, y, width, height);
        
        this.fillStyle = 'hsl(' + Math.round(Math.random() * 255) + ', 100%, 50%)';
    };
    
    Rectangle.prototype.onMouseMove = function(event) {
        this.fillStyle = 'hsl(' + Math.round(Math.random() * 255) + ', 100%, 50%)';
        event.bubbles = false;
    };
    
    Rectangle.prototype.render = function(context) {
        if (this.needsUpdate) {
            this.updateTransform();
        }
        
        this.needsRender = false;
        
        this.applyTransform(context);
        context.fillStyle = this.fillStyle;
        context.fillRect(0, 0, this.unscaledWidth, this.unscaledHeight);
    };
    
    window.Rect = Rectangle;
    
    return Rectangle;
});