define([
    'layer/Renderable'
], function(
    Renderable
) {
    'use strict';

    var Box = function(x, y, width, height) {
        if (x !== undefined && y !== undefined && width !== undefined && height !== undefined) {
            this.init(x, y, width, height);
        }
    };

    var _super = Renderable.prototype;
    Box.prototype = new Renderable();
    Box.prototype.constructor = Box;

    Box.prototype.init = function(x, y, width, height) {
        _super.init.call(this, x, y, width, height);

        this.isDragging = false;
        this.isOver = false;
        this.clicked = false;

        this.startX = 0;
        this.startY = 0;

        return this;
    };

    Box.prototype.onMouseDown = function(event) {
        this.isDragging = true;
        this.startX = event.x - this.x;
        this.startY = event.y - this.y;
    };

    Box.prototype.onMouseUp = function(event) {
        this.isDragging = false;
    };

    Box.prototype.onMouseMove = function(event) {
        if (this.isDragging) {
            this.x = event.x - this.startX;
            this.y = event.y - this.startY;
            this.setNeedsUpdate();
        }
        console.log('move', this.x, this.y);
    };

    Box.prototype.onMouseOver = function(event) {
        this.isOver = true;
    };

    Box.prototype.onMouseOut = function(event) {
        this.isOver = false;
    };

    Box.prototype.onClick = function(event) {
        this.clicked = true;
    };

    return Box;
});