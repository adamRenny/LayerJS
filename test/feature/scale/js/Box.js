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

        this.color = 'rgba(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', 1)';

    };

    Box.prototype.render = function(context) {
        this.Renderable_render(context);

        context.fillStyle = this.color;
        context.fillRect(0, 0, this.unscaledWidth, this.unscaledHeight);
    };

    return Box;
});