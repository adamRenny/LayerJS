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
 * QuadraticBezierLine Module Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */
define([
    'layer/Renderable/BezierLine',
    'layer/Renderable/Line'
], function(
    BezierLine,
    Line
) {
    'use strict';

    var NUMBER_OF_SEGMENTS = 20;
    var NUMBER_OF_POINTS = NUMBER_OF_SEGMENTS + 1;

    var QuadraticBezierLine = function(x1, y1, cpX, cpY, x2, y2) {
    	if (x1 !== undefined && y1 !== undefined
            && cpX !== undefined && cpY !== undefined
            && x2 !== undefined && y2 !== undefined
        ) {
            this.init(x1, y1, cpX, cpY, x2, y2);
        }
    };

    QuadraticBezierLine.prototype = new BezierLine();
    QuadraticBezierLine.prototype.constructor = QuadraticBezierLine;

    QuadraticBezierLine.prototype.BezierLine_init = BezierLine.prototype.init;

    QuadraticBezierLine.prototype.init = function(x1, y1, cpX, cpY, x2, y2) {
    	this.BezierLine_init(x1, y1, x2, y2);

    	this.cpX = cpX;
    	this.cpY = cpY;

    	return this;
    };

    QuadraticBezierLine.prototype.calculatePath = function() {
    	// calculate the quadtratic points

    	return this;
    };

    return QuadraticBezierLine;
});