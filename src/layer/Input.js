/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * trigger, distribute, sublicense, and/or sell copies of the Software,
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
 * Input Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.1
 */
define([
    'jquery',
    'layer/Events'
], function(
    $,
    Events
) {
    'use strict';
    
    /**
     * Mouse Event to represent the current mouse state
     *
     * @name Mouse
     * @class Mouse state that represents the current mouse state
     * @constructor
     * @since 1.0
     */
    var Mouse = function() {
        /**
         * X Position of the Mouse
         *
         * @default 0
         * @name Mouse#x
         * @type {number}
         * @since 1.0
         */
        this.x = 0;
        
        /**
         * Y Position of the Mouse
         *
         * @default 0
         * @name Mouse#y
         * @type {number}
         * @since 1.0
         */
        this.y = 0;
    };
    
    /**
     * Input Controller Constructor
     *
     * Controller to manage all UI inputs from a specific container
     * All hit positions are normalized to the container's origin
     * Enabled after initialization
     * TODO: Handle touch events
     * TODO: Handle mouseleave
     * TODO: Handle mouseover/mouseout
     *
     * @name Input
     * @class Input controller to listen to UI Events
     * @constructor
     *
     * @param {HTMLElement} container Container to listen from for the input controller
     * @since 1.0
     */
    var Input = function(container) {
        this.init(container);
    };
    
    /**
     * Initializes the input by attaching to the container
     *
     * @throws {ArgumentsError} If container is undefined or null
     *
     * @param {HTMLElement} container Container to listen from for the input controller
     * @returns {Input}
     * @since 1.0
     */
    Input.prototype.init = function(container) {
        if (container === undefined || container === null) {
            throw new Error('ArgumentsError: container not defined for Input');
        }
        
        /**
         * HTML Container for the input
         *
         * @name Input#container
         * @type {HTMLElement}
         * @since 1.0
         */
        this.container = container;
        
        /**
         * Mouse state of the input
         *
         * @name Input#mouse
         * @type {Mouse}
         * @since 1.0
         */
        this.mouse = new Mouse();
        
        /**
         * Enabled state flag for the input
         *
         * @default false
         * @name Input#enabled
         * @type {boolean}
         * @since 1.0
         */
        this.enabled = false;
        
        return this.setupHandlers().enable();
    };
    
    /**
     * Binds all the handlers for all the events that are handled
     *
     * @returns {Input}
     * @since 1.1
     */
    Input.prototype.setupHandlers = function() {
        /**
         * Bound onMove Handler
         *
         * @private
         * @name Input#onMoveHandler
         * @type {function}
         * @since 1.0
         */
        this.onMoveHandler = this.onMove.bind(this);
        
        /**
         * Bound onDown Handler
         *
         * @private
         * @name Input#onDownHandler
         * @type {function}
         * @since 1.0
         */
        this.onDownHandler = this.onDown.bind(this);
        
        /**
         * Bound onUp Handler
         *
         * @private
         * @name Input#onUpHandler
         * @type {function}
         * @since 1.0
         */
        this.onUpHandler = this.onUp.bind(this);
        
        /**
         * Bound onClick Handler
         *
         * @private
         * @name Input#onClickHandler
         * @type {function}
         * @since 1.0
         */
        this.onClickHandler = this.onClick.bind(this);
        
        return this;
    };
    
    /**
     * Enables the Input controller by attaching to the container
     * Enables only if necessary
     *
     * @returns {Input}
     * @since 1.0
     */
    Input.prototype.enable = function() {
        if (this.enabled) {
            return this;
        }
        
        this.enabled = true;
        
        var $container = $(this.container);
        
        $container
            .on('mousemove', this.onMoveHandler)
            .on('mouseup', this.onUpHandler)
            .on('mousedown', this.onDownHandler)
            .on('click', this.onClickHandler);
        
        return this;
    };
    
    /**
     * Disables the Input controller by attaching to the container
     * Disables only if necessary
     *
     * @returns {Input}
     * @since 1.0
     */
    Input.prototype.disable = function() {
        if (!this.enabled) {
            return this;
        }
        
        this.enabled = false;
        
        var $container = $(this.container);
        
        $container
            .off('mousemove', this.onMoveHandler)
            .off('mouseup', this.onUpHandler)
            .off('mousedown', this.onDownHandler)
            .off('click', this.onClickHandler);
        
        return this;
    };
    
    /**
     * onMove Handler
     * Sets up the mouse state
     *
     * @param {jQueryEvent} event Mouse Move Event
     * @since 1.0
     */
    Input.prototype.onMove = function(event) {
        this.mouse.x = event.offsetX;
        this.mouse.y = event.offsetY;
        
        Events.trigger(Input.MOUSE_MOVE, this.mouse);
    };
    
    /**
     * onUp Handler
     * Sets up the mouse state
     *
     * @param {jQueryEvent} event Mouse Up Event
     * @since 1.0
     */
    Input.prototype.onUp = function(event) {
        this.mouse.x = event.offsetX;
        this.mouse.y = event.offsetY;
        
        Events.trigger(Input.MOUSE_UP, this.mouse);
    };
    
    /**
     * onDown Handler
     * Sets up the mouse state
     *
     * @param {jQueryEvent} event Mouse Down Event
     * @since 1.0
     */
    Input.prototype.onDown = function(event) {
        this.mouse.x = event.offsetX;
        this.mouse.y = event.offsetY;
        
        Events.trigger(Input.MOUSE_DOWN, this.mouse);
    };
    
    /**
     * onClick Handler
     * Sets up the mouse state
     *
     * @param {jQueryEvent} event Mouse Click Event
     * @since 1.0
     */
    Input.prototype.onClick = function(event) {
        this.mouse.x = event.offsetX;
        this.mouse.y = event.offsetY;
        
        Events.trigger(Input.CLICK, this.mouse);
    };
    
    /**
     * Input Mousemove Events event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.MOUSE_MOVE = '/input/mousemove';
    
    /**
     * Input Mouseup Events event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.MOUSE_UP = '/input/mouseup';
    
    /**
     * Input Mousedown Events event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.MOUSE_DOWN = '/input/mousedown';
    
    /**
     * Input Click Events event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.CLICK = '/input/mouseclick';
    
    return Input;
});