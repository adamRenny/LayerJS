define([
    'layer/renderable/Line'
], function(
    Line
) {
    'use strict';
    
    /**
     * Line Constructor
     *
     * 
     * 
     * @name Line
     * @class Linear point to point line
     * @constructor
     * 
     * @param {number} x1 Line start x
     * @param {number} y1 Line start y
     * @param {number} x2 Line end x
     * @param {number} y2 Line end y
     * @since 1.0
     */
    var ColorLine = function (x1, y1, x2, y2) {
        if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
            this.init(x1, y1, x2, y2);
        }
    };
    
    ColorLine.prototype = new Line();
    ColorLine.prototype.constructor = ColorLine;

    ColorLine.prototype.Line_init = Line.prototype.init;
    ColorLine.prototype.Line_render = Line.prototype.render;

    /**
     * Initializes the Renderable by setting up the spatial properties
     * Sets up the center offset, position, size, scale, rotation, and transform
     *
     * @param {number} x1 Line start x
     * @param {number} y1 Line start y
     * @param {number} x2 Line end x
     * @param {number} y2 Line end y
     * @returns {Line}
     * @since 1.0
     */
    ColorLine.prototype.init = function(x1, y1, x2, y2) {
        this.Line_init(x1, y1, x2, y2);
        
        var red = Math.ceil((Math.random() * 255));
        var green = Math.ceil((Math.random() * 255));
        var blue = Math.ceil((Math.random() * 255));

        this.color = 'rgba(' + red + ', ' + green + ', ' + blue + ', 255)';
        console.log(this.color);
        
        return this;
    };
    
    /**
     * Sets up the update transform stack and applies the transform
     * Updates the transform if necessary
     *
     * @param {CanvasRenderingContext2D} context Context to render to
     * @since 1.0
     */
    ColorLine.prototype.render = function(context) {

        this.Line_render(context);
        
        context.strokeStyle = this.color;
        context.stroke();
    };

    return ColorLine;
});