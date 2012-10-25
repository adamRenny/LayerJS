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
 * Looper Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.0
 */
define(function() {
    "use strict";
    
    /**
     * Max number of milliseconds allowed within a frame
     * Essentially 2.5 fps
     * Built to handle the fast-forward bug where when a tab is left, the animations will "fast-forward"
     *
     * @type {number}
     * @constant
     * @since 1.0
     */
    var FRAME_THRESHOLD = 400;
    
    /**
     * Looper Constructor
     *
     * Looper runs a run loop with an update and render cycle
     * Dynamically timed
     * Uses requestAnimFrame to manage the run loop
     *
     * @name Looper
     * @class Run Loop Controller
     * @constructor
     * @since 1.0
     */
    var Looper = function() {
        this.init();
    };
    
    /**
     * Initializes the looper by setting up the state and binding the step function
     *
     * @returns {Looper}
     * @since 1.0
     */
    Looper.prototype.init = function() {
        /**
         * Last timestamp that was hit in milliseconds
         *
         * @name Looper#lastTimestamp
         * @type {number}
         * @since 1.0
         */
        this.lastTimestamp = Date.now();
        
        /**
         * Flag for whether or not the Looper is looping
         *
         * @default false
         * @name Looper#isLooping
         * @type {boolean}
         * @since 1.0
         */
        this.isLooping = false;
        
        /**
         * Scope-bound version of the _step function
         *
         * @function
         * @name Looper#step
         * @type {function}
         * @since 1.0
         */
        this.step = this._step.bind(this);
        
        return this;
    };
    
    /**
     * Begins the run loop
     *
     * @returns {Looper}
     * @since 1.0
     */
    Looper.prototype.start = function() {
        this.isLooping = true;
        this.lastTimestamp = Date.now();
        requestAnimFrame(this.step);
        
        return this;
    };
    
    /**
     * Stops the run loop
     *
     * @returns {Looper}
     * @insce 1.0
     */
    Looper.prototype.stop = function() {
        this.isLooping = false;
        cancelAnimFrame(this.step);
        
        return this;
    };
    
    /**
     * Update Cycle Interface
     * Cycle in the step where all physical properties are modified
     *
     * @interface
     * @param {number} elapsed Elapsed time since last step in milliseconds
     * @since 1.0
     */
    Looper.prototype.update = function(elapsed) {};
    
    /**
     * Render Cycle Interface
     * Cycle in the step where all physical properties are converted into display
     *
     * @interface
     * @since 1.0
     */
    Looper.prototype.render = function() {};
    
    /**
     * Step function
     * Single run loop increment, calculated dynamically
     *
     * @since 1.0
     */
    Looper.prototype._step = function() {
        if (!this.isLooping) {
            return;
        }
        
        requestAnimFrame(this.step);
        
        var timestamp = Date.now();
        var elapsed = timestamp - this.lastTimestamp;
        
        if (elapsed >= FRAME_THRESHOLD) {
            this.lastTimestamp = timestamp;
            return;
        }
        
        this.update(elapsed);
        this.render();
        
        this.lastTimestamp = timestamp;
    };
    
    return Looper;
});