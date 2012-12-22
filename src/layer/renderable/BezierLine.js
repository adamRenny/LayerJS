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
 * BezierLine Module Definition
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
     * A line renderable that has a representation that may be transformed into a subline
     * Does not include rules around color, stroke, or modifying the transform as a result of the line modifications
     * 
     * @name BezierLine
     * @class Linear point to point line renderable
     * @constructor
     * 
     * @param {number} x1 Line start x
     * @param {number} y1 Line start y
     * @param {number} x2 Line end x
     * @param {number} y2 Line end y
     * @since 1.0
     */
    var BezierLine = function (x1, y1, x2, y2) {
        if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
            this.init(x1, y1, x2, y2);
        }
    };
    
    BezierLine.prototype = new Renderable();
    BezierLine.prototype.constructor = Line;

    BezierLine.prototype.Renderable_init = Renderable.prototype.init;
    BezierLine.prototype.Renderable_render = Renderable.prototype.render;

    /**
     * Initializes the Renderable by setting up the spatial properties
     * Sets up the start and end points, and initializes the subline attribute
     *
     * @param {number} x1 Line start x
     * @param {number} y1 Line start y
     * @param {number} x2 Line end x
     * @param {number} y2 Line end y
     * @returns {Line}
     * @since 1.0
     */
    BezierLine.prototype.init = function(x1, y1, x2, y2) {
        this.Renderable_init(0, 0, 1, 1);

        /**
         * Starting x point
         * Internal subline modifications do not modify
         * Used as the start point for subline calculations
         *
         * @name Line#x1
         * @type {number}
         * @since 1.0
         */
        this.x1 = x1;

        /**
         * Starting y point
         * Internal subline modifications do not modify
         * Used as the start point for subline calculations
         *
         * @name Line#y1
         * @type {number}
         * @since 1.0
         */
        this.y1 = y1;

        /**
         * Ending x point
         * Internal subline modifications do not modify
         * Used as the end point for subline calculations
         *
         * @name Line#x2
         * @type {number}
         * @since 1.0
         */
        this.x2 = x2;

        /**
         * Ending y point
         * Internal subline modifications do not modify
         * Used as the end point for subline calculations
         *
         * @name Line#y2
         * @type {number}
         * @since 1.0
         */
        this.y2 = y2;

        /**
         * Start t value
         * Used to represent the starting interpolation/extrapolation point of the subline
         * If the number is [0, 1], then this is considered an interpolation
         * If it goes beyond those points, this is an extrapolation
         * Should not exceed endT
         *
         * @name Line#startT
         * @type {number}
         * @since 1.0
         */
        this.startT = 0;

        /**
         * End t value
         * Used to represent the starting interpolation/extrapolation point of the subline
         * If the number is [0, 1], then this is considered an interpolation
         * If it goes beyond those points, this is an extrapolation
         * Should not be less than endT
         *
         * @name Line#endT
         * @type {number}
         * @since 1.0
         */
        this.endT = 1;

        this.baseSegments = [];
        this.currentSegments = [];
        
        return this;
    };

    BezierLine.prototype.calculatePath = function() {
        throw 'UndefinedError: Error in BezierLine calculating the path, BezierLine must have calculatePath overridden';

        return this;
    };

    /**
     * Subline function to update the interpolation of the line
     *
     * @param {number} endT t parameter to define the subline ending
     * @param {number} startT Optional t parameter to define the subline start
     * @returns {Line}
     * @since 1.0
     */
    BezierLine.prototype.subline = function(endT, startT) {
        if (startT === undefined) {
            startT = 0;
        }

        if (startT > endT) {
            startT = endT;
        }

        var deltaX = this.x2 - this.x1;
        var deltaY = this.y2 - this.y1;

        if (startT === 0) {
            this.xStart = this.x1;
            this.yStart = this.y1;
        } else {
            this.xStart = deltaX * startT;
            this.yStart = deltaY * startT;
        }

        if (endT === 1) {
            this.xEnd = this.x2;
            this.yEnd = this.y2;
        } else {
            this.xEnd = this.x1 + deltaX * endT;
            this.yEnd = this.y1 + deltaY * endT;
        }


        this.startT = startT;
        this.endT = endT;

        return this;
    };

    /**
     * Subline function to update the interpolation of the line
     *
     * @param {number} endT
     * @param {number} startT
     * @returns {Line}
     * @since 1.0
     */
    BezierLine.prototype.hitTest = function(x, y) {
        return false;
    };
    
    /**
     * Sets up the update transform stack and applies the transform
     * Updates the transform if necessary
     *
     * @param {CanvasRenderingContext2D} context Context to render to
     * @since 1.0
     */
    BezierLine.prototype.render = function(context) {
        this.Renderable_render(context);

        var i = 0;
        var currentSegments = this.currentSegments;
        var length = currentSegments.length;

        context.beginPath();
        for (; i < length; i++) {
            currentSegments.draw(context);
        }
    };

    return BezierLine;
});