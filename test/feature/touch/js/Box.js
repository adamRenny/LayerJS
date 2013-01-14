define([
    'layer/Renderable',
    'layer/Geometry'
], function(
    Renderable,
    Geometry
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
        console.log('mousemove');
        if (this.dragging) {
            this.x = event.x - this.startX;
            this.y = event.y - this.startY;
            this.setNeedsUpdate();
        }
    };

    Box.prototype.hitTest = function(x, y) {
        // If mouse is moving too fast during dragging, ths mouse could be
        // registered outside the bounds of the box from one frame to the
        // next, so always return true when dragging.

        var hit = true;

        if (!this.dragging) {
            hit = Renderable.prototype.hitTest.call(this, x, y);
        }

        return hit;
    };

    Box.prototype.onMouseDown = function(event) {
        console.log('mousedown');
        this.dragging = true;
        this.startX = event.x - this.x;
        this.startY = event.y - this.y;
    };

    Box.prototype.onMouseUp = function(event) {
        console.log('mouseup');
        this.dragging = false;

        if (this.x > this.sceneWidth - this.width * 0.2) {
            this.x = this.sceneWidth - this.width;
        } else if (this.x < -this.width * 0.8) {
            this.x = 0;
        }

        if (this.y > this.sceneHeight - this.height * 0.2) {
            this.y = this.sceneHeight - this.height;
        } else if (this.y < -this.height * 0.8) {
            this.y = 0;
        }

        this.setNeedsUpdate();
    };

    Box.prototype.onMouseOver = function() {
        console.log('over');
    };

    Box.prototype.onMouseOut = function() {
        console.log('out');
    };

    return Box;
});