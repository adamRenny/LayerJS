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
 * Set Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.0
 */

define(function() {
    'use strict';
    
    /**
     * Cached version of the native array slice
     *
     * @private
     * @function
     * @see Array#slice
     * @since 1.0
     */
    var Array_slice = Array.prototype.slice;
    
    /**
     * Index to indicate that an element was not found
     *
     * @type {number}
     * @constant
     * @since 1.0
     */
    var NOT_FOUND_INDEX = -1;
    
    /**
     * Set construct to store elements in a list without order and singularly
     * May only store a single instance of any element
     * 
     * @name Set
     * @class Set construct to perform set operations with
     * @constructor
     *
     * @param {...mixed} arguments Elements of the set
     * @since 1.0
     */
    var Set = function() {
        /**
         * List of elements stored
         * Order is not guaranteed
         *
         * @name Set#elements
         * @type {Object[]}
         * @since 1.0
         */
        this.elements = null;
        
        /**
         * Number of elements currently stored
         *
         * @name Set#length
         * @type {number}
         * @since 1.0
         */
        this.length = 0;
        
        if (arguments.length > 0) {
            this.init.apply(this, arguments);
        } else {
            this.init();
        }
    };
    
    /**
     * Initializes and adds any arguments passed
     * May take a variable number of elements to initialize with
     *
     * @param {...mixed} arguments Elements of the set
     * @returns {Set}
     * @since 1.0
     */
    Set.prototype.init = function() {
        this.elements = [];
        
        if (arguments.length === 0) {
            return this;
        }
        
        return this.addElements.apply(this, arguments);
    };
    
    /**
     * Check to determine if the set contains the element provided
     *
     * @param {mixed} element Element to check if it exists
     * @returns {boolean}
     * @since 1.0
     */
    Set.prototype.containsElement = function(element) {
        return this.elements.indexOf(element) !== NOT_FOUND_INDEX;
    };
    
    /**
     * Adds an element to the set
     * If it already exists, it ignores the call
     *
     * @param {mixed} element Element to add
     * @returns {Set}
     * @since 1.0
     */
    Set.prototype.addElement = function(element) {
        if (this.containsElement(element)) {
            return this;
        }
        
        this.elements.push(element);
        this.length = this.elements.length;
        
        return this;
    };
    
    /**
     * Adds elements to the set
     * Allows for a variable number of elements to add
     *
     * @param {...mixed} arguments Elements of the set
     * @returns {Set}
     * @since 1.0
     */
    Set.prototype.addElements = function() {
        if (arguments.length === 0) {
            return this;
        }
        
        var elements = Array_slice.call(arguments, 0);
        
        var i = 0;
        var length = elements.length;
        
        for (; i < length; i++) {
            this.addElement(elements[i]);
        }
        
        return this;
    };
    
    /**
     * Removes an element from the set if it exists
     *
     * @param {mixed} element Element to remove from the set
     * @returns {Set}
     * @since 1.0
     */
    Set.prototype.removeElement = function(element) {
        var elements = this.elements;
        var index = elements.indexOf(element);
        if (index === NOT_FOUND_INDEX) {
            return this;
        }
        
        elements.splice(index, 1);
        this.length = elements.length;
        
        return this;
    };
    
    /**
     * Loops through each element to find if there exists one
     * element that fulfills the condition requested
     * Existential check is atomic
     *
     * Condition is called from the context of the Set and is passed the element as the first parameter
     * condition(element)
     * Condition must return true or false, true indicating that an element was found, false indicating not found
     * Existential check will stop if found
     *
     * @param {function} condition A conditional function to determine if an element exists
     * @returns {boolean}
     * @since 1.0
     */
    Set.prototype.thereExists = function(condition) {
        var i = 0;
        var elements = this.elements.slice(0);
        var length = elements.length;
        var boundCondition = condition.bind(this);
        var thereExists = false;
        
        for (; i < length && !thereExists; i++) {
            thereExists = boundCondition(elements[i]);
        }
        
        return thereExists;
    };
    
    /**
     * Loops through each element to run the provided operation on
     * Existential check is atomic
     *
     * Operation is called from the context of the Set and is passed the element as the first parameter
     * operation(element)
     *
     * @param {function} operation An operation to perform on each element
     * @returns {Set}
     * @since 1.0
     */
    Set.prototype.forEach = function(operation) {
        var i = 0;
        var elements = this.elements.slice(0);
        var length = elements.length;
        var boundOperation = operation.bind(this);
        
        for (; i < length; i++) {
            boundOperation(elements[i]);
        }
        
        return this;
    }
    
    /**
     * Clones the current set and returns the new set object
     * Does not perform a deep clone
     *
     * @returns {Set}
     * @since 1.0
     */
    Set.prototype.clone = function() {
        var set = new Set();
        this.forEach(function(element) {
            set.addElement(element);
        });
        
        return set;
    };
    
    /**
     * Performs intersection of the set with a provided set
     * Intersection is then contained within the current set
     * Does not handle non-set objects
     *
     * @param {Set} set Set to intersect with
     * @return {Set}
     * @since 1.0
     */
    Set.prototype.intersection = function(set) {
        if (!(set instanceof Set)) {
            return this;
        }
        
        this.forEach(function(element) {
            if (!set.containsElement(element)) {
                this.removeElement(element);
            }
        });
        
        return this;
    };
    
    /**
     * Creates an intersection of the set with a provided set
     * Intersection is then contained within the current set
     * Does not handle non-set objects
     *
     * @param {Set} set Set to intersect with
     * @return {Set}
     * @since 1.0
     */
    Set.prototype.getIntersection = function(set) {
        return this.clone().intersection(set);
    };
    
    /**
     * Performs union of the set with a provided set
     * Union is then contained within the current set
     * Does not handle non-set objects
     *
     * @param {Set} set Set to union with
     * @return {Set}
     * @since 1.0
     */
    Set.prototype.union = function(set) {
        if (!(set instanceof Set)) {
            return this;
        }
        
        var self = this;
        
        set.forEach(function(element) {
            self.addElement(element);
        });
        
        return this;
    };
    
    /**
     * Creates a union of the set with a provided set
     * Union is then contained within the current set
     * Does not handle non-set objects
     *
     * @param {Set} set Set to union with
     * @return {Set}
     * @since 1.0
     */
    Set.prototype.getUnion = function(set) {
        return this.clone().union(set);
    };
    
    /**
     * Performs subtraction of the set with the provided set
     * The modified set space is then contained within the current set
     * Does not handle non-set objects
     *
     * @param {Set} set Set to subtract with
     * @return {Set}
     * @since 1.0
     */
    Set.prototype.minus = function(set) {
        if (!(set instanceof Set)) {
            return this;
        }
        
        this.forEach(function(element) {
            if (set.containsElement(element)) {
                this.removeElement(element);
            }
        });
        
        return this;
    };
    
    /**
     * Creates a subtraction of the set with the provided set
     * The modified set space is then contained within the current set
     * Does not handle non-set objects
     *
     * @param {Set} set Set to subtract with
     * @return {Set}
     * @since 1.0
     */
    Set.prototype.getSubtraction = function(set) {
        return this.clone().minus(set);
    };
    
    /**
     * Determines whether the current set is a subset of the provided set
     * Does not handle non-set objects
     *
     * @param {Set} set Set to check
     * @return {boolean}
     * @since 1.0
     */
    Set.prototype.isSubset = function(set) {
        if (!(set instanceof Set)) {
            return false;
        }
        
        if (this.length > set.length) {
            return false;
        }
        
        var isSubset = !this.thereExists(function(element) {
            return !set.containsElement(element);
        });
        
        return isSubset;
    };
    
    return Set;
});