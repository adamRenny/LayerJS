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
 * HitEvent Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.1
 */
define(function() {
    "use strict";
    
    /**
     * Hit Event Callback Method Names
     * Maps the event name to the respective method name
     * 
     * @private
     * @type {object}
     * @since 1.0
     */
    var _hitCallbackMethods = {
        mousemove: 'onMouseMove',
        mouseup: 'onMouseUp',
        mousedown: 'onMouseDown',
        click: 'onClick',
        mouseover: 'onMouseOver',
        mouseout: 'onMouseOut'
    };
    
    /**
     * HitEvent Constructor
     *
     * Event that represents a hit position
     * Built for user interaction with hit positions
     * Handles mouse events
     * Transient and intended to be primarily immutable
     * Not intended to be extended
     * 
     * @name HitEvent
     * @class Event to represent a user interaction hit point
     * @constructor
     *
     * @throws {UndefinedError} If type is unsupported or undefined
     * @throws {ArgumentsError} If x or y is undefined or NaN
     *
     * @param {string} type Hit Event Type Name
     * @param {number} x X Hit position
     * @param {number} y Y Hit position
     * @param {Scene} source Hit source the hit originates from, could potentially be anything, but should be Scene at a minimum
     * @param {boolean} bubbles Whether the event should bubble, optional
     * @since 1.0
     */
    var HitEvent = function(type, x, y, hitTarget, bubbles) {
        // Only handle the hit if it supports the hit type
        if (!_hitCallbackMethods.hasOwnProperty(type)) {
            throw new Error('UndefinedError: HitEvent for ' + type + ' does not exist');
        }
        
        // Handle the x and y only if they are defined and a number
        if (x === undefined || typeof x !== 'number'
           || y === undefined || typeof y !== 'number'
        ) {
            throw new Error('ArgumentsError: Error with x or y coordinates');
        }
        
        /**
         * Event type of the hit event
         * Uses the event type constants
         *
         * @name HitEvent#type
         * @type {string}
         * @since 1.0
         */
        this.type = type;
        
        /**
         * Name of the callback relative to the hit type
         *
         * @name HitEvent#callback
         * @type {string}
         * @since 1.0
         */
        this.callback = _hitCallbackMethods[type];
        
        /**
         * X Position of the Hit
         *
         * @name HitEvent#x
         * @type {number}
         * @since 1.0
         */
        this.x = x;
        
        /**
         * Y Position of the Hit
         *
         * @name HitEvent#y
         * @type {number}
         * @since 1.0
         */
        this.y = y;
        
        /**
         * Hit target structure to access the renderable that were hit
         * Uses an array to represent a stack of targets in order of topmost to bottommost
         * Uses a single renderable when there is only one target
         *
         * @name HitEvent#hitTarget
         * @type {Array|Renderable}
         * @since 1.0
         */
        this.hitTarget = hitTarget;
        
        /**
         * Bubbles flag to decide whether the event should bubble
         * When overridden in the event handler, the event will discontinue execution
         *
         * @default false
         * @name HitEvent#bubbles
         * @type {boolean}
         * @since 1.0
         */
        this.bubbles = bubbles || false;
        
        // Execute the hit only if the hit stack has actionable targets
        if ((hitTarget instanceof Array && hitTarget.length)
            || (!(hitTarget instanceof Array) && hitTarget !== null)
        ) {
            this.executeHit();
        }
    };
    
    /**
     * Executes the actual hit by calling the callback for each hit Renderable object
     * Uses the hitTarget to execute on by iterating through
     * Uses the hitTarget as a single executable to iterate through
     *
     * @private
     * @since 1.0
     */
    HitEvent.prototype.executeHit = function() {
        var callbackName = this.callback;
        var hitTarget = this.hitTarget;
        
        if (hitTarget instanceof Array) {
            var i = hitTarget.length - 1 || 0;
            var hitRenderable;

            do {
                hitRenderable = hitTarget[i];
                if (hitRenderable[callbackName] !== undefined) {
                    hitRenderable[callbackName](this);
                }
                i--;
            } while (i >= 0 && this.bubbles === true);
        } else {
            if (hitTarget[callbackName] !== undefined) {
                hitTarget[callbackName](this);
            }
        }
    };
    
    /**
     * Mousemove event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    HitEvent.MOUSE_MOVE = 'mousemove';
    
    /**
     * Mouseup event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    HitEvent.MOUSE_UP = 'mouseup';
    
    /**
     * Mousedown event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    HitEvent.MOUSE_DOWN = 'mousedown';
    
    /**
     * Click event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    HitEvent.CLICK = 'click';
    
    /**
     * Mouseover event name
     *
     * @type {string}
     * @constant
     * @since 1.1
     */
    HitEvent.MOUSE_OVER = 'mouseover';
    
    /**
     * Mouseout event name
     *
     * @type {string}
     * @constant
     * @since 1.1
     */
    HitEvent.MOUSE_OUT = 'mouseout';
    
    return HitEvent;
})