define([
    'layer/Renderable'
], function(
    Renderable
) {
    'use strict';

    var Box = function(x, y, width, height) {
        this.init(x, y, width, height);
    };
    
    Box.prototype = new Renderable;
    Box.prototype.constructor = Box;
    
    Box.prototype.Renderable_init = Renderable.prototype.init;
    Box.prototype.Renderable_render = Renderable.prototype.render;
    
    Box.prototype.init = function(x, y, width, height) {

        this.Renderable_init(x, y, width, height);

        this.color = 'rgba(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + (Math.random()) + ')';

        this.startX = 0;
        this.startY = 0;

        this.sceneWidth = 200;
        this.sceneHeight = 200;

        this.dragging = false;
    };

    Box.prototype.setSceneSize = function(width, height) {
        this.sceneWidth = width;
        this.sceneHeight = height;

        return this;
    };
    
    Box.prototype.render = function(context) {
        this.Renderable_render(context);

        context.fillStyle = this.color;
        context.fillRect(0, 0, this.unscaledWidth, this.unscaledHeight);
    };

    Box.prototype.onMouseMove = function(event) {
        if (this.dragging) {
            this.x = Math.max(0, Math.min(this.sceneWidth - this.width, event.x - this.startX));
            this.y = Math.max(0, Math.min(this.sceneHeight - this.height, event.y - this.startY));
            this.setNeedsUpdate();
        }
    };

    Box.prototype.onMouseDown = function(event) {
        this.dragging = true;
        this.startX = event.x - this.x;
        this.startY = event.y - this.y;
    };

    Box.prototype.onMouseUp = function(event) {
        this.dragging = false;
    };
    
    return Box;
});