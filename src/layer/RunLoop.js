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
 * RunLoop Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.1
 */
define(function() {
    'use strict';
    
    /**
     * Max number of milliseconds allowed within a frame
     * Essentially 2.5 fps
     * Built to handle the fast-forward bug where when a tab is left, the animations will "fast-forward"
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.0
     */
    var FRAME_THRESHOLD = 400;
    
    /**
     * Index to indicate that an element was not found
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.1
     */
    var NOT_FOUND_INDEX = -1;
    
    /**
     * Inserts a call into a cycle object at the given index
     * If the index is out of bounds, the index will be clamped to the size
     *
     * @param {function[]} cycle Call cycle collection
     * @param {function} call Function to call
     * @param {number} index Index to insert the call into, if undefined will push to the end
     * @since 1.1
     */
    var _insertCallToCycle = function(cycle, call, index) {
        if (index === undefined || index >= cycle.length) {
            cycle.push(call);
        } else if (index < 0) {
            cycle.unshift(call);
        } else {
            cycle.splice(index, 0, call);
        }
    };
    
    /**
     * Removes a call from a cycle object
     *
     * @throws {UndefinedError} If the call does not exist
     *
     * @param {function[]} cycle Call cycle collection
     * @param {function} call Function to call
     * @since 1.1
     */
    var _removeCallFromCycle = function(cycle, call) {
        var callIndex = cycle.indexOf(call);
        
        if (callIndex === NOT_FOUND_INDEX) {
            throw new Error('UndefinedError: call has not been added');
        }
        
        cycle.splice(callIndex, 1);
    };
    
    /**
     * RunLoop Constructor
     *
     * RunLoop runs a run loop with an update and render cycle
     * Dynamically timed
     * Uses requestAnimFrame to manage the run loop
     *
     * @name RunLoop
     * @class Run Loop Controller
     * @constructor
     * @since 1.0
     */
    var RunLoop = function() {
        this.init();
    };
    
    /**
     * Initializes the run loop by setting up the state and binding the step function
     *
     * @returns {RunLoop}
     * @since 1.0
     */
    RunLoop.prototype.init = function() {
        /**
         * Last timestamp that was hit in milliseconds
         *
         * @name RunLoop#lastTimestamp
         * @type {number}
         * @since 1.0
         */
        this.lastTimestamp = Date.now();
        
        /**
         * Flag for whether or not the RunLoop is looping
         *
         * @default false
         * @name RunLoop#isLooping
         * @type {boolean}
         * @since 1.0
         */
        this.isLooping = false;
        
        /**
         * Scope-bound version of the _step function
         *
         * @function
         * @name RunLoop#step
         * @type {function}
         * @since 1.0
         */
        this.step = this._step.bind(this);
        
        this.updateCallCycle = [];
        this.renderCallCycle = [];
        
        return this;
    };
    
    /**
     * Begins the run loop
     *
     * @returns {RunLoop}
     * @since 1.0
     */
    RunLoop.prototype.start = function() {
        this.isLooping = true;
        this.lastTimestamp = Date.now();
        requestAnimFrame(this.step);
        
        return this;
    };
    
    /**
     * Stops the run loop
     *
     * @returns {RunLoop}
     * @since 1.0
     */
    RunLoop.prototype.stop = function() {
        this.isLooping = false;
        cancelAnimFrame(this.step);
        
        return this;
    };
    
    /**
     * Adds a call function to the loop
     *
     * @throws {ArgumentsError} If the type is not a cycle enumeration
     * @throws {ArgumentsError} If the call is not defined or a function
     *
     * @param {function} call Function to call during the cycle
     * @param {number} Cycle type to add it to, may be both
     * @returns {RunLoop}
     * @since 1.1
     */
    RunLoop.prototype.addCall = function(call, type) {
        if (type === undefined || type <= RunLoop.NO_CYCLE || type > RunLoop.ALL_CYCLES) {
            throw new Error('ArgumentsError: type must be of type CYCLE enumeration');
        }
        
        if (call === undefined || typeof call !== 'function') {
            throw new Error('ArgumentsError: call must be of type function');
        }
        
        if (type & RunLoop.UPDATE_CYCLE) {
            _insertCallToCycle(this.updateCallCycle, call);
        }
        
        if (type & RunLoop.RENDER_CYCLE) {
            _insertCallToCycle(this.renderCallCycle, call);
        }
        
        return this;
    };
    
    /**
     * Inserts a call function to the loop at a specified index
     *
     * @throws {ArgumentsError} If the type is not a cycle enumeration
     * @throws {ArgumentsError} If the call is not defined or a function
     * @throws {ArgumentsError} If the index is not a type of number
     *
     * @param {function} call Function to call during the cycle
     * @param {number} Cycle type to add it to, may be both
     * @returns {RunLoop}
     * @since 1.1
     */
    RunLoop.prototype.insertCall = function(call, index, type) {
        if (type === undefined || type <= RunLoop.NO_CYCLE || type > RunLoop.ALL_CYCLES) {
            throw new Error('ArgumentsError: type must be of type CYCLE enumeration');
        }
        
        if (call === undefined || typeof call !== 'function') {
            throw new Error('ArgumentsError: call must be of type function');
        }
        
        if (typeof index !== 'number') {
            throw new Error('ArgumentsError: call must be of type number');
        }
        
        if (type & RunLoop.UPDATE_CYCLE) {
            _insertCallToCycle(this.updateCallCycle, call, index);
        }
        
        if (type & RunLoop.RENDER_CYCLE) {
            _insertCallToCycle(this.renderCallCycle, call, index);
        }
        
        return this;
    };
    
    /**
     * Removes a call function from the loop
     *
     * @throws {ArgumentsError} If the type is not a cycle enumeration
     * @throws {ArgumentsError} If the call is not defined or a function
     *
     * @param {function} call Function that was called during the cycle
     * @param {number} Cycle type to remove from, may be both
     * @returns {RunLoop}
     * @since 1.1
     */
    RunLoop.prototype.removeCall = function(call, type) {
        if (type === undefined || type <= RunLoop.NO_CYCLE || type > RunLoop.ALL_CYCLES) {
            throw new Error('ArgumentsError: type must be of type CYCLE enumeration');
        }
        
        if (call === undefined || typeof call !== 'function') {
            throw new Error('ArgumentsError: call must be of type function');
        }
        
        if (type & RunLoop.UPDATE_CYCLE) {
            _removeCallFromCycle(this.updateCallCycle, call);
        }
        
        if (type & RunLoop.RENDER_CYCLE) {
            _removeCallFromCycle(this.renderCallCycle, call);
        }
        
        return this;
    };
    
    /**
     * Update Cycle Interface
     * Cycle in the step where all physical properties are modified
     * Runs each of the functions passing in the elapsed time since last step
     *
     * @param {number} elapsed Elapsed time since last step in milliseconds
     * @since 1.0
     */
    RunLoop.prototype.update = function(elapsed) {
        var i = 0;
        var cycle = this.updateCallCycle;
        var length = cycle.length;
        
        for (; i < length; i++) {
            cycle[i](elapsed);
        }
    };
    
    /**
     * Render Cycle Interface
     * Cycle in the step where all physical properties are converted into display
     * Runs each of the functions
     *
     * @since 1.0
     */
    RunLoop.prototype.render = function() {
        var i = 0;
        var cycle = this.renderCallCycle;
        var length = cycle.length;
        
        for (; i < length; i++) {
            cycle[i]();
        }
    };
    
    /**
     * Step function
     * Single run loop increment, calculated dynamically
     *
     * @since 1.0
     */
    RunLoop.prototype._step = function() {
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
    
    /**
     * Cycle Bitwise Enumeration
     * No Cycle
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.1
     */
    RunLoop.NO_CYCLE = 0;
    
    /**
     * Cycle Bitwise Enumeration
     * Update Cycle
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.1
     */
    RunLoop.UPDATE_CYCLE = 1;
    
    /**
     * Cycle Bitwise Enumeration
     * Render Cycle
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.1
     */
    RunLoop.RENDER_CYCLE = 2;
    
    /**
     * Cycle Bitwise Enumeration
     * All Cycles
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.1
     */
    RunLoop.ALL_CYCLES = 3;
    
    return RunLoop;
});