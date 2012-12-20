/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Line Module Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */
define([
    'layer/Renderable',
    'lib/gl-matrix',
    'layer/Geometry'
], function(
    Renderable,
    glMatrix,
    Geometry
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
    var Line = function (x1, y1, x2, y2) {
        if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
            this.init(x1, y1, x2, y2);
        }
    };
    
    Line.prototype = new Renderable();
    Line.prototype.constructor = Line;

    Line.prototype.Renderable_init = Renderable.prototype.init;
    Line.prototype.Renderable_render = Renderable.prototype.render;

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
    Line.prototype.init = function(x1, y1, x2, y2) {
        this.Renderable_init(0, 0, 1, 1);

        this.x1 = x1;
        this.y1 = y1;

        this.t = 1;

        this.x2 = this.xEnd = x2;
        this.y2 = this.yEnd =y2;
        
        return this;
    };

    Line.prototype.subline = function(t) {
        if (t === 1) {
            this.xEnd = this.x2;
            this.yEnd = this.y2;

            return this;
        }

        var deltaX = this.x2 - this.x1;
        var deltaY = this.y2 - this.y1;

        this.xEnd = this.x1 + deltaX * t;
        this.yEnd = this.y1 + deltaY * t;

        return this;
    };

    Line.prototype.hitTest = function(x, y) {
        var t = (x - this.x1) / (this.xEnd - this.x1);
        return t >= 0 && t <= this.t;
    };
    
    /**
     * Sets up the update transform stack and applies the transform
     * Updates the transform if necessary
     *
     * @param {CanvasRenderingContext2D} context Context to render to
     * @since 1.0
     */
    Line.prototype.render = function(context) {
        this.Renderable_render(context);

        context.beginPath();
        context.moveTo(this.x1, this.y1);
        context.lineTo(this.xEnd, this.yEnd);
    };

    return Line;
});