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

        return this;
    };

    Box.prototype.onMouseDown = function() {
        this.isDragging = true;
    };

    Box.prototype.onMouseUp = function() {
        this.isDragging = false;
    };

    Box.prototype.onMouseOver = function(event) {
        this.isOver = true;
    };

    Box.prototype.onMouseOut = function() {
        this.isOver = false;
    };

    Box.prototype.onClick = function() {
        this.clicked = true;
    };

    return Box;
});