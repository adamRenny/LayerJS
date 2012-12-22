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
    'layer/Renderable'
], function(
    Renderable
) {
    'use strict';

    var ShapeRenderable = function(x, y, width, height) {
    	if (x !== undefined && y !== undefined
    		&& width !== undefined && height !== undefined
    	) {
    		this.init(x, y, width, height);
    	}
    };

    ShapeRenderable.prototype = new Renderable();
    ShapeRenderable.prototype.constructor = ShapeRenderable;

    ShapeRenderable.prototype.Renderable_init = Renderable.prototype.init;
    ShapeRenderable.prototype.Renderable_render = Renderable.prototype.render;

    ShapeRenderable.prototype.init = function(x, y, width, height) {
    	this.Renderable_init(x, y, width, height);

    	this.strokeColor = 'black';
    	this.fillColor = 'white';
    	this.strokeWidth = 1;

    	return this;
    };

    ShapeRenderable.prototype.draw = function(context) {

    };

    ShapeRenderable.prototype.render = function(context) {
    	this.Renderable_render(context);

    	context.strokeStyle = this.strokeColor;
    	context.fillStyle = this.fillColor;
    	context.lineWidth = this.lineWidth;
    	this.draw(context);
    	context.stroke();
    	context.fill();
    };

    return ShapeRenderable;
});