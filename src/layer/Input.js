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
 * @version 1.1.1
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
     * Namespace ID
     *
     * @private
     * @type {number}
     */
    var namespaceId = 0;

    /**
     * Namespace string
     *
     * @constant
     * @type {string}
     */
    var NAMESPACE = '.input';

    /**
     * Calculate position offset of container
     *
     * @private
     * @param {HTMLElement} container
     * @param {object} containerOffset Object to set top and left offset values to
     * @return {object}
     */
    var getOffset = function(container, containerOffset) {
        var offset = container.getBoundingClientRect();
        var clientTop  = document.clientTop || document.body.clientTop || 0;
        var clientLeft = document.clientLeft || document.body.clientLeft || 0;
        var scrollTop  = window.pageYOffset || document.scrollTop || 0;
       	var scrollLeft = window.pageXOffset || document.scrollLeft || 0;
        var top  = offset.top  + scrollTop  - clientTop;
        var left = offset.left + scrollLeft - clientLeft;

        containerOffset.top = top;
        containerOffset.left = left;
    };
    
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
     * Only propagates content from the input if the input is active
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
         * Unique namespace
         * @name Input#namespace
         * @type {string}
         */
        this.namespace = NAMESPACE + (namespaceId++);
        
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
        
        /**
         * Active state flag for the input
         * Active state listens for when the mouse enters to begin listening for input
         *
         * @default false
         * @name Input#enabled
         * @type {boolean}
         * @since 1.1.1
         */
        this.isActive = false;

        /**
         * Container position offset on page
         *
         * @name Input#containerOffset
         * @type {object}
         */
        this.containerOffset = { top: 0, left: 0 };
        
        return this.setupHandlers().activate().enable();
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
        
        /**
         * Bound onEnter Handler
         *
         * @private
         * @name Input#onEnterHandler
         * @type {function}
         * @since 1.1.1
         */
        this.onEnterHandler = this.onEnter.bind(this);
        
        /**
         * Bound onExit Handler
         *
         * @private
         * @name Input#onExitHandler
         * @type {function}
         * @since 1.1.1
         */
        this.onExitHandler = this.onExit.bind(this);
        
        return this;
    };
    
    /**
     * Attaches the input to the container to listen for entry and exiting
     * Enables the container only if entered
     *
     * @returns {Input}
     * @since 1.1.1
     */
    Input.prototype.activate = function() {
        if (this.isActive) {
            return this;
        }
        
        this.isActive = true;
        
        var $container = $(this.container);
        
        $container.on('mouseover touchstart', this.onEnterHandler);
        $container.on('mouseout touchend', this.onExitHandler);
        
        return this;
    };
    
    /**
     * Detaches the input to the container to stop listening for entry and exiting
     *
     * @returns {Input}
     * @since 1.1.1
     */
    Input.prototype.deactivate = function() {
        if (!this.isActive) {
            return this;
        }
        
        this.isActive = false;
        
        var $container = $(this.container);
        
        $container.off('mouseover touchstart', this.onEnterHandler);
        $container.off('mouseout touchend', this.onExitHandler);
        
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
        
        $container.on('mousemove touchmove', this.onMoveHandler);
        $container.on('mouseup touchend', this.onUpHandler);
        $container.on('mousedown touchstart', this.onDownHandler);
        $container.on('click', this.onClickHandler);
        
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
        
        $container.off('mousemove touchmove', this.onMoveHandler);
        $container.off('mouseup touchend', this.onUpHandler);
        $container.off('mousedown touchstart', this.onDownHandler);
        $container.off('click', this.onClickHandler);
        
        return this;
    };

    /**
     * Get unique namespace
     *
     * @return {string}
     */
    Input.prototype.getNamespace = function() {
        return this.namespace;
    };
    
    /**
     * onMove Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Mouse Move Event
     * @since 1.0
     */
    Input.prototype.onMove = function(event) {
        if (event.originalEvent.touches) {
            this.mouse.x = event.originalEvent.touches[0].pageX - this.containerOffset.left;
            this.mouse.y = event.originalEvent.touches[0].pageY - this.containerOffset.top;
            // Prevent body from scrolling
            event.preventDefault();
        } else {
            this.mouse.x = event.offsetX;
            this.mouse.y = event.offsetY;
        }
        
        Events.trigger(Input.MOUSE_MOVE + this.namespace, this.mouse);
    };
    
    /**
     * onUp Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Mouse Up Event
     * @since 1.0
     */
    Input.prototype.onUp = function(event) {
        if (event.originalEvent.touches) {
            this.mouse.x = 0;
            this.mouse.y = 0;
        } else {
            this.mouse.x = event.offsetX;
            this.mouse.y = event.offsetY;
        }
        
        Events.trigger(Input.MOUSE_UP + this.namespace, this.mouse);
    };
    
    /**
     * onDown Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Mouse Down Event
     * @since 1.0
     */
    Input.prototype.onDown = function(event) {
        if (event.originalEvent.touches) {
            getOffset(this.container, this.containerOffset);
            this.mouse.x = event.originalEvent.touches[0].pageX - this.containerOffset.left;
            this.mouse.y = event.originalEvent.touches[0].pageY - this.containerOffset.top;
        } else {
            this.mouse.x = event.offsetX;
            this.mouse.y = event.offsetY;
        }
        
        Events.trigger(Input.MOUSE_DOWN + this.namespace, this.mouse);
    };
    
    /**
     * onClick Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Mouse Click Event
     * @since 1.0
     */
    Input.prototype.onClick = function(event) {
        this.mouse.x = event.offsetX;
        this.mouse.y = event.offsetY;
        
        Events.trigger(Input.CLICK + this.namespace, this.mouse);
    };
    
    /**
     * onEnter Handler
     * Enables the input on enter
     *
     * @param {jQuery.Event} event Mouse Click Event
     * @since 1.1.1
     */
    Input.prototype.onEnter = function(event) {
        this.enable();
    };
    
    /**
     * onExit Handler
     * Disables the input on exit
     *
     * @param {jQuery.Event} event Mouse Click Event
     * @since 1.1.1
     */
    Input.prototype.onExit = function(event) {
        this.disable();
    };
    
    /**
     * Input Mousemove Events event name
     * Includes a layer-js namespace
     * Supplies the mouse object and the containing element
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.MOUSE_MOVE = 'input/mousemove';
    
    /**
     * Input Mouseup Events event name
     * Includes a layer-js namespace
     * Supplies the mouse object and the containing element
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.MOUSE_UP = 'input/mouseup';
    
    /**
     * Input Mousedown Events event name
     * Includes a layer-js namespace
     * Supplies the mouse object and the containing element
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.MOUSE_DOWN = 'input/mousedown';
    
    /**
     * Input Click Events event name
     * Includes a layer-js namespace
     * Supplies the mouse object and the containing element
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.CLICK = 'input/mouseclick';
    
    return Input;
});