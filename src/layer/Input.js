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
 * @version 1.6
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
     * @type {number}
     * @private
     * @since 1.2
     */
    var namespaceId = 0;

    /**
     * Namespace string
     *
     * @type {string}
     * @constant
     * @since 1.2
     */
    var NAMESPACE = '.input';

    /**
     * Page document object
     *
     * @type {HTMLDocument}
     * @constant
     * @since 1.3
     */
    var DOCUMENT = document;

    /**
     * Page window object
     *
     * @type {window}
     * @constant
     * @since 1.3
     */
    var WINDOW = window;

    /**
     * jQuery object of window object
     * @type {jQuery}
     * @constant
     * @since 1.5
     */
    var $WINDOW = $(WINDOW);

    /**
     * Page body element
     *
     * @type {HTMLElement}
     * @constant
     * @since 1.3
     */
    var BODY = DOCUMENT.body;

    /**
     * jQuery page body element
     *
     * @type {jQuery}
     * @constant
     * @since 1.6
     */
    var $BODY = $(BODY);

    /**
     * Calculate position offset of container
     *
     * @param {HTMLElement} container
     * @param {object} containerOffset Object to set top and left offset values to
     * @return {object}
     * @private
     * @since 1.3
     */
    var getOffset = function(container, containerOffset) {
        var offset = container.getBoundingClientRect();

        var clientTop  = DOCUMENT.clientTop || BODY.clientTop || 0;
        var clientLeft = DOCUMENT.clientLeft || BODY.clientLeft || 0;

        var scrollTop  = WINDOW.pageYOffset || DOCUMENT.scrollTop || 0;
       	var scrollLeft = WINDOW.pageXOffset || DOCUMENT.scrollLeft || 0;

        containerOffset.top = offset.top + scrollTop - clientTop;
        containerOffset.left = offset.left + scrollLeft - clientLeft;
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
     * TODO: Handle mouseleave
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
         * @name Input#isActive
         * @type {boolean}
         * @since 1.1.1
         */
        this.isActive = false;

        /**
         * Active state flag for drage mode
         *
         * @default false
         * @name Input#inDragMode
         * @type {boolean}
         * @since 1.5
         */
        this.inDragMode = false;

        /**
         * Container position offset on page
         *
         * @name Input#containerOffset
         * @type {object}
         * @since 1.3
         */
        this.containerOffset = { top: 0, left: 0 };

        return this.setupHandlers().activate();
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
         * Bound onTouchMove Handler
         *
         * @private
         * @name Input#onTouchMoveHandler
         * @type {function}
         * @since 1.4
         */
        this.onTouchMoveHandler = this.onTouchMove.bind(this);

        /**
         * Bound onTouchStart Handler
         *
         * @private
         * @name Input#onTouchStartHandler
         * @type {function}
         * @since 1.4
         */
        this.onTouchStartHandler = this.onTouchStart.bind(this);

        /**
         * Bound onTouchEnd Handler
         *
         * @private
         * @name Input#onTouchEndHandler
         * @type {function}
         * @since 1.4
         */
        this.onTouchEndHandler = this.onTouchEnd.bind(this);

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

        /**
         * Boudn updateOffset Handler
         *
         * @private
         * @name Input#onResizeHandler
         * @type {function}
         * @since 1.6
         */
        this.onResizeHandler = this.updateOffset.bind(this);

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

        this.updateOffset();

        $(this.container)
            .on('mouseenter', this.onEnterHandler)
            .on('touchstart', this.onEnterHandler)
            .on('touchstart', this.onTouchStartHandler)
            .on('mouseleave', this.onExitHandler);

        $WINDOW.on('resize', this.onResizeHandler);

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

        $(this.container)
            .off('mouseeter', this.onEnterHandler)
            .off('touchstart', this.onEnterHandler)
            .off('touchstart', this.onTouchStartHandler)
            .off('mouseleave', this.onExitHandler);

        $WINDOW.off('resize', this.onResizeHandler);

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

        $(this.container)
            .on('mousemove', this.onMoveHandler)
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
        if (!this.enabled || this.inDragMode) {
            return this;
        }

        this.enabled = false;

        $(this.container)
            .off('mousemove', this.onMoveHandler)
            .off('mousedown', this.onDownHandler)
            .off('click', this.onClickHandler);

        return this;
    };

    /**
     * Unbind move and up event handlers from container and bind them to the window
     *
     * @return {Input}
     * @private
     * @since 1.5
     */
    Input.prototype.startDragMode = function() {
        if (this.inDragMode) {
            return this;
        }
        Input.CURRENTLY_DRAGGING = this.inDragMode = true;

        $(this.container)
            .off('mousemove', this.onMoveHandler)
            .off('mouseup', this.onUpHandler);

        $WINDOW
            .on('mousemove', this.onMoveHandler)
            .on('mouseup', this.onUpHandler);

        $BODY
            .on('touchmove', this.onTouchMoveHandler)
            .on('touchend', this.onTouchEndHandler);

        return this;
    };

    /**
     * Unbind move and up event handlers from window and bind them back to the container
     *
     * @return {Input}
     * @private
     * @since 1.5
     */
    Input.prototype.stopDragMode = function() {
        if (!this.inDragMode) {
            return this;
        }
        Input.CURRENTLY_DRAGGING = this.inDragMode = false;

        $WINDOW
            .off('mousemove', this.onMoveHandler)
            .off('mouseup', this.onUpHandler);

        $BODY
            .off('touchmove', this.onTouchMoveHandler)
            .off('touchend', this.onTouchEndHandler);

        if (this.isOver) {
            $(this.container)
                .on('mousemove', this.onMoveHandler)
                .on('mouseup', this.onUpHandler);
        } else {
            this.onExit();
        }

        return this;
    };

    /**
     * Get unique namespace
     *
     * @return {string}
     * @since 1.2
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
        this.mouse.x = event.pageX - this.containerOffset.left;
        this.mouse.y = event.pageY - this.containerOffset.top;

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
        this.mouse.x = event.pageX - this.containerOffset.left;
        this.mouse.y = event.pageY - this.containerOffset.top;

        this.stopDragMode();

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
        this.updateOffset();

        this.mouse.x = event.pageX - this.containerOffset.left;
        this.mouse.y = event.pageY - this.containerOffset.top;

        this.startDragMode();

        Events.trigger(Input.MOUSE_DOWN + this.namespace, this.mouse);
    };

    /**
     * onTouchMove Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Touch Move Event
     * @since 1.4
     */
    Input.prototype.onTouchMove = function(event) {
        this.mouse.x = event.originalEvent.touches[0].pageX - this.containerOffset.left;
        this.mouse.y = event.originalEvent.touches[0].pageY - this.containerOffset.top;

        // Prevent body from scrolling
        event.preventDefault();

        Events.trigger(Input.MOUSE_MOVE + this.namespace, this.mouse);
    };

    /**
     * onTouchEnd Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Touch Start Event
     * @since 1.4
     */
    Input.prototype.onTouchEnd = function(event) {
        // touchend does not return any x/y coordinates, so leave the
        // mouse object as the last coordinates from onTouchMove or onTouchStart
        this.stopDragMode();

        Events.trigger(Input.MOUSE_UP + this.namespace, this.mouse);
    };

    /**
     * onTouchStart Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Touch Start Event
     * @since 1.4
     */
    Input.prototype.onTouchStart = function(event) {
        this.updateOffset();

        this.mouse.x = event.originalEvent.touches[0].pageX - this.containerOffset.left;
        this.mouse.y = event.originalEvent.touches[0].pageY - this.containerOffset.top;

        this.startDragMode();

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
        if (!Input.CURRENTLY_DRAGGING) {
            this.isOver = true;
            this.enable();
        }
    };

    /**
     * onExit Handler
     * Disables the input on exit
     *
     * @param {jQuery.Event} event Mouse Click Event
     * @since 1.1.1
     */
    Input.prototype.onExit = function(event) {
        this.isOver = false;
        this.disable();
    };

    /**
     * Update container offset
     *
     * @name Input#updateOffset
     * @since 1.6
     */
    Input.prototype.updateOffset = function() {
        getOffset(this.container, this.containerOffset);
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

    /**
     * Flag to determine if any instance of Input is currently dragging
     *
     * @static
     * @type {boolean}
     * @since 1.6
     */
    Input.CURRENTLY_DRAGGING = false;

    return Input;
});