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
 * Layer Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.1
 */
define([
    'layer/RenderableGroup'
], function(
    RenderableGroup
) {
    "use strict";
    
    /**
     * Layer ID Prefix
     *
     * @private
     * @type {string}
     * @constant
     * @since 1.0
     */
    var LAYER_PREFIX = 'layer-';
    
    /**
     * Canvas ID number that increments whenever a new id is applied
     *
     * @static
     * @private
     * @type {number}
     * @since 1.0
     */
    var _canvasId = 0;
    
    /**
     * Layer Constructor
     *
     * Layer model which stores the canvas information
     *
     * @name Layer
     * @class Canvas Layer object
     * @constructor
     * @extends RenderableGroup
     *
     * @param {HTMLCanvasElement} canvas Canvas element that the layer represents
     * @since 1.0
     */
    var Layer = function(canvas) {
        this.init(canvas);
    };
    
    /**
     * Initializes the layer and sets up the width, height, canvas, and context
     *
     * @param {HTMLCanvasElement} canvas Canvas element that the layer represents
     * @returns {Layer}
     * @since 1.0
     */
    Layer.prototype.init = function(canvas) {
        // If the id is undefined, define it
        if (canvas.id === undefined) {
            canvas.id = LAYER_PREFIX + _canvasId;
        }
        
        /**
         * Layer name
         *
         * @name Layer#name
         * @type {string}
         * @since 1.0
         */
        this.name = canvas.id;
        
        /**
         * Canvas the layer represents
         *
         * @name Layer#canvas
         * @type {HTMLCanvasElement}
         * @since 1.0
         */
        this.canvas = canvas;
        
        /**
         * Context the layer uses from the canvas
         *
         * @name Layer#context
         * @type {CanvasRenderingContext2D}
         * @since 1.0
         */
        this.context = null;
        
        /**
         * Layer width
         *
         * @name Layer#width
         * @type {number}
         * @since 1.0
         */
        this.width = canvas.width;
        
        /**
         * Layer height
         *
         * @name Layer#height
         * @type {number}
         * @since 1.0
         */
        this.height = canvas.height;
        
        /**
         * Root Layer Node
         * When a layer is rendered, the root renders
         *
         * @name Layer#root
         * @type {RenderableGroup}
         * @since 1.1
         */
        this.root = new RenderableGroup(0, 0, this.width, this.height);
        
        return this;
    };
    
    /**
     * Gets the layer's canvas element
     *
     * @returns {HTMLCanvasElement}
     * @since 1.0
     */
    Layer.prototype.getCanvas = function() {
        return this.canvas;
    };
    
    /**
     * Gets the layer's context
     *
     * @returns {CanvasRenderingContext2D}
     * @since 1.0
     */
    Layer.prototype.getContext = function() {
        if (this.context === null) {
            this.context = this.canvas.getContext('2d');
        }
        
        return this.context;
    };
    
    /**
     * Gets the rendering layer's root node
     * Root node is expected to be an instance of RenderableGroup
     *
     * @returns {RenderableGroup}
     * @since 1.1
     */
    Layer.prototype.getRoot = function() {
        return this.root;
    };
    
    /**
     * Renders the layer's root if it needs to be rendered
     * Intended to be called from a run loop that doesn't check on the root for its render requirement
     * TODO: Integrate the needsRender prerequisite
     *
     * @since 1.1
     */
    Layer.prototype.render = function() {
        var root = this.root;
        var context = this.getContext();
        
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.width, this.height);
        root.render(context);
    };
    
    return Layer;
});