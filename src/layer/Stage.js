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
 * Stage Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.1
 */
define([
    'jquery',
    'layer/Layer',
    'layer/RenderCache'
], function(
    $,
    Layer,
    RenderCache
) {
    'use strict';
    
    /**
     * Hardware CSS Styles to modify for acceleration
     *
     * @private
     * @type {Array}
     * @constant
     * @since 1.0
     */
    var HARDWARE_STYLES = [
        '-webkit-transform'
    ];
    
    /**
     * Settings for each hardware CSS styles to modify for acceleration
     *
     * @private
     * @type {Object}
     * @constant
     * @since 1.0
     */
    var HARDWARE_SETTINGS = {
        '-webkit-transform': 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)'
    };
    
    /**
     * Prepares and calculates the hardware settings
     * Attempts to apply settings only if unset
     *
     * @private
     * @function
     * @param {HTMLElement} element Element to prepare hardware acceleration for
     * @returns {Array}
     * @since 1.0
     */
    var _prepareHardwareSettings = function(element) {
        var $element = $(element);
        var i = 0;
        var length = HARDWARE_STYLES.length;
        var styles = {};
        for (; i < length; i++) {
            if ($element.css(HARDWARE_STYLES[i]) === "none") {
                styles[HARDWARE_STYLES[i]] = HARDWARE_SETTINGS[HARDWARE_STYLES[i]];
            }
        }
        
        return styles;
    };
    
    /**
     * Applies a statically generated layer name/id
     *
     * @private
     * @function
     * @since 1.0
     */
    var _applyAutoLayerName = function(layer) {
        layer.id = LAYER_PREFIX + _canvasId++;
    };
    
    /**
     * <p>Stage Constructor</p>
     *
     * <p>Manager of the layers of the stage and controls hardware acceleration</p>
     * 
     * @name Stage
     * @class Container to manage the canvas elements and layers
     * @constructor
     * 
     * @param {HTMLElement} viewport Container for the canvas elements
     * @param {number} width Base width of the stage
     * @param {number} height Base height of the stage
     * @since 1.0
     */
    var Stage = function(viewport, width, height) {
        this.init(viewport, width, height);
    };
    
    /**
     * Stage initialization
     *
     * Initializes the layer management container
     * Generates layers for canvas layer elements located within the container
     * 
     * @throws {ArgumentsError} If the stage doesn't receive all the arguments
     * 
     * @param {HTMLElement} viewport Container for the canvas elements
     * @param {number} width Base width of the stage
     * @param {number} height Base height of the stage
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.init = function(viewport, width, height) {
        if (arguments.length !== 3) {
            throw new Error('ArgumentsError: Stage expects arguments: new Stage(viewport, width, height) received ' + arguments.length);
        }
        
        /**
         * Viewport container object to contain the layers/canvases
         *
         * @name Stage#viewport
         * @type {HTMLElement}
         * @since 1.0
         */
        this.viewport = viewport;

        /**
         * jQuery object of viewport
         *
         * @name Stage#$viewport
         * @type {jQuery}
         */
        this.$viewport = $(this.viewport);
        
        /**
         * Width of the stage
         *
         * @name Stage#width
         * @type {number}
         * @since 1.0
         */
        this.width = width;
        
        /**
         * Height of the stage
         *
         * @name Stage#height
         * @type {number}
         * @since 1.0
         */
        this.height = height;
        
        /**
         * Layer list which mimics the DOM representation
         *
         * @default []
         * @name Stage#layers
         * @type {Array}
         * @since 1.0
         */
        var layers = this.layers = [];
        
        /**
         * Layer cache which stores layers by name for quick lookup
         *
         * @default {}
         * @name Stage#layerCache
         * @type {Array}
         * @since 1.0
         */
        this.layerCache = {};
        
        // Creates representative layers for existing canvases
        this.$viewport.children().each(function() {
            this.width = width;
            this.height = height;
            layers.push(new Layer(this));
        });
        
        /**
         * Count of the layers in the stage
         *
         * @name Stage#layerCount
         * @type {number}
         * @since 1.0
         */
        this.layerCount = layers.length;
        
        return this;
    };
    
    /**
     * Creates a layer with the dimensions of the stage and name provided
     * 
     * @throws {ArgumentsError} If the name is undefined
     * 
     * @param {string} name Layer name/id
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.createLayer = function(name) {
        if (name === undefined) {
            throw new Error('ArgumentsError: Layer name is undefined');
        }
        
        return new Layer(RenderCache.createCanvas(name, this.width, this.height));
    };
    
    /**
     * Enables hardware acceleration for all canvases
     *
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.enableCSSAcceleration = function() {
        var i = 0;
        var length = this.layers.length;
        var canvas;
        for (; i < length; i++) {
            canvas = this.layers[i].getCanvas();
            $(canvas).css(_prepareHardwareSettings(canvas));
        }
        
        return this;
    };
    
    /**
     * Enables hardware acceleration for a specific layer
     *
     * @param {Layer} layer Layer to enable acceleration for
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.enableCSSAccelerationForLayer = function(layer) {
        var canvas = layer.getCanvas();
        $(canvas).css(_prepareHardwareSettings(canvas));
        
        return this;
    };
    
    /**
     * Enables acceleration by a layer name contained within the stage
     *
     * @param {string} name Name of the layer to enable
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.enableCSSAccelerationByName = function(name) {
        return this.enableCSSAccelerationForLayer(this.getLayerByName(name));
    };
    
    /**
     * Enables acceleration by a layer index
     *
     * @param {string} index Index of the layer to enable acceleration
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.enableCSSAccelerationByIndex = function(index) {
        return this.enableCSSAccelerationForLayer(this.getLayerByIndex(index));
    };
    
    /**
     * Creates and prepends a layer into stage
     *
     * @param {string} name Name of the layer to create
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.createAndPrependLayer = function(name) {
        return this.prependLayer(this.createLayer(name));
    };
    
    /**
     * Creates and appends a layer into stage
     *
     * @param {string} name Name of the layer to create
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.createAndAppendLayer = function(name) {
        return this.appendLayer(this.createLayer(name));
    };
    
    /**
     * Creates and inserts a layer into stage
     *
     * @param {string} name Name of the layer to create
     * @param {number} index Index to insert into
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.createAndInsertLayerAtIndex = function(name, index) {
        return this.insertLayerAtIndex(this.createLayer(name), index);
    };
    
    /**
     * Using the cache, gets a layer by name
     *
     * @throws {UndefinedError} If the layer by the provided name doesn't exist
     *
     * @param {string} name Name of the layer to find
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.getLayerByName = function(name) {
        if (!this.layerCache.hasOwnProperty(name)) {
            throw new Error('UndefinedError: Layer with name ' + name + ' does not exist');
        }
        
        return this.layerCache[name];
    };
    
    /**
     * Gets a layer by index
     *
     * @throws {UndefinedError} If the index is out of bounds
     *
     * @param {number} index Index of the layer to find
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.getLayerByIndex = function(index) {
        if (index < 0 || index >= this.layerCount) {
            throw new Error('UndefinedError: Index ' + index + ' is out of bounds');
        }
        
        return this.layers[index];
    };
    
    /**
     * Prepends the layer to the viewport and stage
     *
     * @param {Layer} layer Layer to prepend
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.prependLayer = function(layer) {
        this.$viewport.prepend(layer.getCanvas());
        this.layerCache[layer.name] = layer;
        this.layers.unshift(layer);
        this.layerCount = this.layers.length;
        
        return this;
    };
    
    /**
     * Appends the layer to the viewport and stage
     *
     * @param {Layer} layer Layer to append
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.appendLayer = function(layer) {
        this.viewport.appendChild(layer.getCanvas());
        this.layerCache[layer.name] = layer;
        this.layers.push(layer);
        this.layerCount = this.layers.length;
        
        return this;
    };
    
    /**
     * Insert the layer to the viewport and stage
     *
     * @param {Layer} layer Layer to insert
     * @param {number} index Index to insert layer after
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.insertLayerAtIndex = function(layer, index) {
        if (index < 0) {
            return this.prependLayer(layer);
        } else if (index >= this.layerCount) {
            return this.appendLayer(layer);
        }
        
        var targetLayer = this.layers[index];
        this.$viewport.find('#' + targetLayer.name).after(layer.getCanvas());
        this.layerCache[layer.name] = layer;
        this.layers.splice(index, 0, layer);
        this.layerCount = this.layers.length;
        
        return this;
    };
    
    /**
     * Public convenience function to loop on the layers with
     *
     * @param {function} callback Callback that expects layer as a parameter
     * @since 1.1
     */
    Stage.prototype.forEachLayer = function(callback) {
        var i = 0;
        var layerCount = this.layerCount;
        
        for (; i < layerCount; i++) {
            callback(this.getLayerByIndex(i));
        }
    };
    
    return Stage;
});