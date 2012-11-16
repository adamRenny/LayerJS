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
 * Render Cache Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.1
 */
define(function() {
    'use strict';
    
    /**
     * Static id used for debugging - makes each render cache a unique id
     *
     * @private
     * @type {number}
     * @since 1.0
     */
    var _id = 0;
    
    /**
     * Cache prefix name used for identifying the id of the cache
     *
     * @private
     * @constant
     * @type {object}
     * @since 1.0
     */
    var CACHE_PREFIX = 'cache-';

    /**
     * Type definition that all renderCommand must be
     * Used to compare all renderCommand types against
     *
     * @type {string}
     * @constant
     */
    var RENDER_COMMAND_TYPE = 'function';
    
    /**
     * Generates a canvas with an id, width, and height specified
     *
     * @private
     * @function
     * @param {string} name Name and ID of the canvas
     * @param {number} width Width of the canvas element
     * @param {number} height Height of the canvas element
     * @returns {HTMLCanvasElement}
     * @since 1.0
     */
    var _makeCanvas = function(name, width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.id = name;
        
        return canvas;
    };
    
    /**
     * RenderCache Constructor
     *
     * Cache structure used to render out content from a functional source
     * Content rendered onto the RenderCache is not updated until render is called
     * 
     * @name RenderCache
     * @class Render Cache structure which renders content on demand to be used for later rendering
     * @constructor
     * 
     * @param {number} width Cache Width
     * @param {number} height Cache Height
     * @param {function} renderCommand Function to render the content with - will include a context parameter
     * @since 1.0
     */
    var RenderCache = function(width, height, renderCommand) {
        /**
         * Debugging id of the cache
         *
         * @default 0
         * @name RenderCache#id
         * @type {number}
         * @since 1.0
         */
        this.id = _id++;
        
        /**
         * Cache width
         *
         * @default 0
         * @name RenderCache#width
         * @type {number}
         * @since 1.0
         */
        this.width = 0;
        
        /**
         * Cache height
         *
         * @default 0
         * @name RenderCache#height
         * @type {number}
         * @since 1.0
         */
        this.height = 0;
        
        /**
         * Canvas used to cache with
         *
         * @default null
         * @name RenderCache#canvas
         * @type {HTMLCanvasElement}
         * @since 1.0
         */
        this.canvas = null;
        
        /**
         * Cached canvas context
         *
         * @default null
         * @name RenderCache#context
         * @type {2dRenderingContext}
         * @since 1.0
         */
        this.context = null;
        
        /**
         * Render command to cache
         *
         * @default null
         * @name RenderCache#renderCommand
         * @type {function}
         * @since 1.0
         */
        this.renderCommand = null;
        
        if (width !== undefined && height !== undefined && renderCommand !== undefined) {
            this.init(width, height, renderCommand)
        }
    };
    
    /**
     * Convenience function to create a canvas
     * 
     * @static
     * 
     * @param {string} name Name and ID of the canvas element
     * @param {number} width Base width of the canvas element
     * @param {number} height Base height of the canvas element
     * @returns {HTMLCanvasElement}
     * @since 1.0
     */
    RenderCache.createCanvas = function(name, width, height) {
        return _makeCanvas(name, width, height);
    };
    
    /**
     * Initializes the cache by creating the canvas and rendering out the command
     *
     * @throws {Error} When the renderCommand is not of type function
     * 
     * @param {number} width Cache Width
     * @param {number} height Cache Height
     * @param {function} renderCommand Function to render the content with - will include a context parameter
     * @returns {RenderCache}
     * @since 1.0
     */
    RenderCache.prototype.init = function(width, height, renderCommand) {
        this.width = width;
        this.height = height;
        
        this.canvas = _makeCanvas(CACHE_PREFIX + this.id, width, height);
        this.context = this.canvas.getContext('2d');
        
        if (typeof renderCommand !== RENDER_COMMAND_TYPE) {
            throw 'RenderCache::init - Error: RenderCommand is of type '
                + (typeof renderCommand) + ' not of type ' + RENDER_COMMAND_TYPE;
        }

        this.renderCommand = renderCommand;
        
        this.render();
        
        return this;
    };
    
    /**
     * Sets up the size of the render cache
     * 
     * @param {number} width Cache Width
     * @param {number} height Cache Height
     * @returns {RenderCache}
     * @since 1.0
     */
    RenderCache.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        
        return this;
    };
    
    /**
     * Gets the currently rendered content
     *
     * @returns {HTMLCanvasElement}
     * @since 1.1
     */
    RenderCache.prototype.getContent = function() {
        return this.canvas;
    };
    
    /**
     * Renders out the command onto the cache
     * Not intended to be run on the main loop at every step
     * 
     * @returns {RenderCache}
     * @since 1.0
     */
    RenderCache.prototype.render = function() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.renderCommand(this.context);
        
        return this;
    };
    
    return RenderCache;
});