/*global Element:true */
/**
 * @fileOverview
 * Copyright (c) 2012-2013 Adam Ranfelt
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
 * @author Adam Ranfelt
 * @author Aaron Gloege
 * @version 2.0
 */
define([
    'lib/EventBus',
    'layer/Geometry'
], function(
    EventBus,
    Geometry
) {
    'use strict';

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
     * Page body element
     *
     * @type {HTMLElement}
     * @constant
     * @since 1.3
     */
    var BODY = DOCUMENT.body;

    // Element.contains polyfill
    if (!Element.prototype.contains) {
        if (document.compareDocumentPosition) {
            Element.prototype.contains = function(b) {
                return b && !!(this.compareDocumentPosition(b) & 16);
            };
        } else {
            Element.prototype.contains = function(b) {
                while ((b = b.parentNode)) {
                    if (b === this) {
                        return true;
                    }
                }
                return false;
            };
        }
    }

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
     * Current Window X/Y mouse coordinates
     * Updated on mousemove within window
     * Used to track the mouse position for activation of
     * input controllers upon entry into their containers
     *
     * @type {Mouse}
     * @private
     * @since 1.8
     */
    var _windowMousePosition = (function() {
        var mouse = new Mouse();

        var onScroll = function(e) {
            mouse.x = e.pageX;
            mouse.y = e.pageY;
        };

        WINDOW.addEventListener('mousemove', onScroll, false);

        return mouse;
    }());

    /**
     * Mouse Enter/Leave handler to determine if use has moused over/out container
     *
     * @param {MouseEvent} event
     * @private
     * @since 1.9
     */
    var _mouseEnterMouseLeaveHandler = function(event) {
        var target = event.target;
        var related = event.relatedTarget;

        // For mousenter/leave call the handler if related is outside the target.
        // NB: No relatedTarget if the mouse left/entered the browser window
        if (!related || (related !== target && !target.contains(related))) {
            if (event.type === 'mouseover') {
                this.onEnter();
            } else {
                this.onExit();
            }
        }
    };

    /**
     * Input Controller Constructor
     *
     * Controller to manage all UI inputs from a specific container
     * All hit positions are normalized to the container's origin
     * Enabled after initialization
     *
     * @name Input
     * @class Input controller to listen to UI Events
     * @constructor
     *
     * @param {HTMLElement} container Container to listen from for the input controller
     * @since 1.0
     */
    var Input = function(container) {
        if (container !== undefined) {
            this.init(container);
        }
    };

    Input.prototype = new EventBus();
    Input.prototype.constructor = Input;

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

        // Call the super constructor/init
        EventBus.call(this);

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
         * Active state flag for drag mode
         *
         * @default false
         * @name Input#isDragging
         * @type {boolean}
         * @since 1.5
         */
        this.isDragging = false;

        /**
         * Active state flag for mouse currently being over container
         *
         * @default false
         * @name Input#isMouseOver
         * @type {boolean}
         * @since 1.6
         */
        this.isMouseOver = false;

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

        /**
         * Bound onMouseEnterMouseLeaveHandler Handler
         *
         * @private
         * @name Input#onMouseEnterMouseLeaveHandler
         * @type {function}
         * @since 1.7
         */
        this.onMouseEnterMouseLeaveHandler = _mouseEnterMouseLeaveHandler.bind(this);

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

        this.container.addEventListener('mouseover', this.onMouseEnterMouseLeaveHandler, false);
        this.container.addEventListener('mouseout', this.onMouseEnterMouseLeaveHandler, false);
        this.container.addEventListener('touchstart', this.onEnterHandler, false);
        this.container.addEventListener('touchstart', this.onTouchStartHandler, false);
        this.container.addEventListener('touchend', this.onExitHandler, false);

        WINDOW.addEventListener('resize', this.onResizeHandler, false);

        this.updateOffset();

        if (Geometry.isPointInRect(
            _windowMousePosition.x,
            _windowMousePosition.y,
            this.containerOffset.left,
            this.containerOffset.top,
            this.container.clientWidth,
            this.container.clientHeight
        )) {
            this.onEnterHandler();
        }

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

        if (this.isDragging) {
            this.stopDragging();
        }

        if (this.enabled) {
            this.disable();
        }

        this.isActive = false;

        this.container.removeEventListener('mouseover', this.onMouseEnterMouseLeaveHandler, false);
        this.container.removeEventListener('mouseout', this.onMouseEnterMouseLeaveHandler, false);
        this.container.removeEventListener('touchstart', this.onEnterHandler, false);
        this.container.removeEventListener('touchstart', this.onTouchStartHandler, false);
        this.container.removeEventListener('touchend', this.onExitHandler, false);

        WINDOW.removeEventListener('resize', this.onResizeHandler, false);

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

        this.container.addEventListener('mousemove', this.onMoveHandler, false);
        this.container.addEventListener('mousedown', this.onDownHandler, false);
        this.container.addEventListener('click', this.onClickHandler, false);

        return this.updateOffset();
    };

    /**
     * Disables the Input controller by attaching to the container
     * Disables only if necessary
     *
     * @returns {Input}
     * @since 1.0
     */
    Input.prototype.disable = function() {
        if (!this.enabled || this.isDragging) {
            return this;
        }

        this.enabled = false;

        this.container.removeEventListener('mousemove', this.onMoveHandler, false);
        this.container.removeEventListener('mousedown', this.onDownHandler, false);
        this.container.removeEventListener('click', this.onClickHandler, false);

        this.trigger(Input.DISABLE, this.mouse);

        return this;
    };

    /**
     * Destroy Input by calling deactivate
     * @return {Input}
     * @since 2.0
     */
    Input.prototype.destroy = function() {
        return this.deactivate();
    };

    /**
     * Unbind move and up event handlers from container and bind them to the window
     *
     * @return {Input}
     * @private
     * @since 1.5
     */
    Input.prototype.startDragging = function() {
        if (this.isDragging) {
            return this;
        }

        Input.isCurrentlyDragging = this.isDragging = true;

        this.container.removeEventListener('mousemove', this.onMoveHandler, false);

        // Mouse events must be bound to window because
        // body may not be the full window height
        WINDOW.addEventListener('mousemove', this.onMoveHandler, false);
        WINDOW.addEventListener('mouseup', this.onUpHandler, false);

        // Touch move event must be bound to body
        // to prevent scrolling on touchmove events
        BODY.addEventListener('touchmove', this.onTouchMoveHandler, false);

        // Remove onExitHandler handler so we can bind the onTouchEndHandler handler first
        // This will ensure events will trigger in the correct order: onUp, onOut
        this.container.removeEventListener('touchend', this.onExitHandler, false);
        this.container.addEventListener('touchend', this.onTouchEndHandler, false);
        this.container.addEventListener('touchend', this.onExitHandler, false);

        return this;
    };

    /**
     * Unbind move and up event handlers from window and bind them back to the container
     *
     * @return {Input}
     * @private
     * @since 1.5
     */
    Input.prototype.stopDragging = function() {
        if (!this.isDragging) {
            return this;
        }

        Input.isCurrentlyDragging = this.isDragging = false;

        WINDOW.removeEventListener('mousemove', this.onMoveHandler, false);
        WINDOW.removeEventListener('mouseup', this.onUpHandler, false);

        BODY.removeEventListener('touchmove', this.onTouchMoveHandler, false);
        this.container.removeEventListener('touchend', this.onTouchEndHandler, false);
        // No need to remove the exit handler here. Deactivate will handle that

        // If we are still over the container, rebind the mousemove event.
        // Otherwise, call the onExit handler
        if (this.isMouseOver) {
            this.container.addEventListener('mousemove', this.onMoveHandler, false);
        } else {
            this.onExit();
        }

        return this;
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

        this.trigger(Input.MOUSE_MOVE, this.mouse);
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

        this.trigger(Input.MOUSE_UP, this.mouse);

        this.stopDragging();
    };

    /**
     * onDown Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Mouse Down Event
     * @since 1.0
     */
    Input.prototype.onDown = function(event) {
        if (event.which !== 1) {
            return;
        }

        this.updateOffset();

        this.mouse.x = event.pageX - this.containerOffset.left;
        this.mouse.y = event.pageY - this.containerOffset.top;

        this.trigger(Input.MOUSE_DOWN, this.mouse);

        this.startDragging();
    };

    /**
     * onTouchMove Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Touch Move Event
     * @since 1.4
     */
    Input.prototype.onTouchMove = function(event) {
        this.mouse.x = event.touches[0].pageX - this.containerOffset.left;
        this.mouse.y = event.touches[0].pageY - this.containerOffset.top;

        // Prevent body from scrolling
        event.preventDefault();

        this.trigger(Input.MOUSE_MOVE, this.mouse);
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
        this.trigger(Input.MOUSE_UP, this.mouse);

        this.stopDragging();
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

        this.mouse.x = event.touches[0].pageX - this.containerOffset.left;
        this.mouse.y = event.touches[0].pageY - this.containerOffset.top;

        this.trigger(Input.MOUSE_DOWN, this.mouse);

        this.startDragging();
    };

    /**
     * onClick Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Mouse Click Event
     * @since 1.0
     */
    Input.prototype.onClick = function(event) {
        this.mouse.x = event.pageX - this.containerOffset.left;
        this.mouse.y = event.pageY - this.containerOffset.top;

        this.trigger(Input.CLICK, this.mouse);
    };

    /**
     * onEnter Handler
     * Enables the input on enter
     *
     * @param {jQuery.Event} event Mouse Click Event
     * @since 1.1.1
     */
    Input.prototype.onEnter = function(event) {
        this.isMouseOver = true;
        if (!Input.isCurrentlyDragging) {
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
        this.isMouseOver = false;
        this.disable();
    };

    /**
     * Update container offset
     *
     * @returns {Input}
     * @since 1.6
     */
    Input.prototype.updateOffset = function() {
        getOffset(this.container, this.containerOffset);

        return this;
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
     * Input disable event name
     * Includes a layer-js namespace
     * Supplies the mouse object and the containing element
     *
     * @type {string}
     * @constant
     * @since 1.7
     */
    Input.DISABLE = 'input/disable';

    /**
     * Flag to determine if any instance of Input is currently dragging
     *
     * @type {boolean}
     * @static
     * @since 1.6
     */
    Input.isCurrentlyDragging = false;

    return Input;
});