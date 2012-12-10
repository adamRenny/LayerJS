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
 * Dictionary Module Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */

define(function() {
    'use strict';
    
    /**
     * Index to indicate that an element was not found
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.0
     */
    var NOT_FOUND_INDEX = -1;
    
    /**
     * Dictionary used to store elements on a key-value basis
     * Keys and values may be any element type
     * Non-primitive values are stored via pointer
     * Duplicate keys and values are not supported
     * 
     * @name Dictionary
     * @class Dictionary to store values via key-value
     * @constructor
     *
     * @param {Object[]} keys Array of keys associated by index with the values
     * @param {Object[]} values Array of values associated by index with the keys
     * @since 1.0
     */
    var Dictionary = function(keys, values) {
        /**
         * List of keys
         * Keys are associated to values via index
         *
         * @name Dictionary#keys
         * @type {Object[]}
         * @since 1.0
         */
        this.keys = null;
        
        /**
         * List of values
         * Values are associated to keys via index
         *
         * @name Dictionary#values
         * @type {Object[]}
         * @since 1.0
         */
        this.values = null;
        
        /**
         * Number of key-values currently stored
         * Incremented manually
         * Read-only
         *
         * @default 0
         * @name Dictionary#length
         * @type {number}
         * @since 1.0
         */
        this.length = 0;
        
        if (keys !== undefined && values !== undefined) {
            this.init(keys, values);
        } else {
            this.init();
        }
    };
    
    /**
     * Initializes the dictionary
     * Prepopulates the keys and values if they are supplied
     *
     * @throws {TypeError} If the keys or values parameters are not Arrays
     * @throws {TypeError} If the key and value lengths are not equal
     *
     * @param {*[]} keys Array of keys associated by index with the values
     * @param {*[]} values Array of values associated by index with the keys
     * @returns {Dictionary}
     * @since 1.0
     */
    Dictionary.prototype.init = function(keys, values) {
        this.keys = [];
        this.values = [];
        
        if (arguments.length === 0) {
            return this;
        }
        
        if (!(keys instanceof Array && values instanceof Array)) {
            throw new Error('TypeError: Expected keys and values to be of type Array');
        }
        
        if (keys.length !== values.length) {
            throw new Error('TypeError: Expected keys and values to be of the same length');
        }
        
        var i = 0;
        var length = keys.length;
        for (; i < length; i++) {
            this.addKeyValue(keys[i], values[i]);
        }
    };
    
    /**
     * Adds a key-value pair
     * 
     * @throws {ExistentialError} If the key has already been added
     * @throws {ExistentialError} If the value has already been added
     * 
     * @param {*} key Key associated with the value
     * @param {*} value Value associated with the key
     * @returns {Dictionary}
     * @since 1.0
     */
    Dictionary.prototype.addKeyValue = function(key, value) {
        if (this.hasKey(key)) {
            throw new Error('ExistentialError: key has already been added');
        }
        
        if (this.hasValue(value)) {
            throw new Error('ExistentialError: value has already been added');
        }
        
        this.keys.push(key);
        this.values.push(value);
        this.updateLength();
        
        return this;
    };
    
    /**
     * Checks if a key is currently contained
     *
     * @param {*} key Key to search for
     * @returns {boolean}
     * @since 1.0
     */
    Dictionary.prototype.hasKey = function(key) {
        return this.keys.indexOf(key) !== NOT_FOUND_INDEX;
    };
    
    /**
     * Checks if a value is currently contained
     *
     * @param {*} value Value to search for
     * @returns {Dictionary}
     * @since 1.0
     */
    Dictionary.prototype.hasValue = function(value) {
        return this.values.indexOf(value) !== NOT_FOUND_INDEX;
    };
    
    /**
     * Update the length of the dictionary
     *
     * @private
     * @since 1.0
     */
    Dictionary.prototype.updateLength = function() {
        this.length = this.keys.length;
    };
    
    /**
     * Gets the value for a key
     * If the key is in the dictionary more than once, will only the return the first key encountered
     *
     * @throws {UndefinedError} If the key is not already within the Dictionary
     *
     * @param {*} key Key to use to reference the value
     * @returns {*}
     * @since 1.0
     */
    Dictionary.prototype.getValueForKey = function(key) {
        var index = this.keys.indexOf(key);
        
        if (index === NOT_FOUND_INDEX) {
            throw new Error('UndefinedError: Provided key not found');
        }
        
        return this.values[index];
    };
    
    /**
     * Gets the key for a value
     * If the value is in the dictionary more than once, will only the return the first value encountered
     *
     * @throws {UndefinedError} If the value is not already within the Dictionary
     *
     * @param {*} value Value to use to reference the key
     * @returns {*}
     * @since 1.0
     */
    Dictionary.prototype.getKeyForValue = function(value) {
        var index = this.values.indexOf(value);
        
        if (index === NOT_FOUND_INDEX) {
            throw new Error('UndefinedError: Provided value not found');
        }
        
        return this.keys[index];
    };
    
    /**
     * Removes a key-value pair by index
     *
     * @private
     * @param {number} Index of the key-value pair
     * @returns {Dictionary}
     * @since 1.0
     */
    Dictionary.prototype.removeKeyValueByIndex = function(index) {
        this.keys.splice(index, 1);
        this.values.splice(index, 1);
        this.updateLength();
        
        return this;
    };
    
    /**
     * Removes a key-value by key
     *
     * @throws {UndefinedError} If the key is not already within the Dictionary
     *
     * @param {*} key Key to use to reference the value
     * @returns {Dictionary}
     * @since 1.0
     */
    Dictionary.prototype.removeKeyValueByKey = function(key) {
        var index = this.keys.indexOf(key);
        
        if (index === NOT_FOUND_INDEX) {
            throw new Error('UndefinedError: Provided key not found');
        }
        
        return this.removeKeyValueByIndex(index);
    };
    
    /**
     * Removes a key-value by value
     *
     * @throws {UndefinedError} If the value is not already within the Dictionary
     *
     * @param {*} value Value to use to reference the key
     * @returns {Dictionary}
     * @since 1.0
     */
    Dictionary.prototype.removeKeyValueByValue = function(value) {
        var index = this.values.indexOf(value);
        
        if (index === NOT_FOUND_INDEX) {
            throw new Error('UndefinedError: Provided value not found');
        }
        
        return this.removeKeyValueByIndex(index);
    };
    
    /**
     * Loops through each element to run the provided operation on
     * For each check is atomic
     *
     * Operation is called from the context of the Dictionary and is passed the key, value as the parameters
     * operation(key, value)
     *
     * @param {function} operation An operation to perform on each element
     * @returns {Dictionary}
     * @since 1.0
     */
    Dictionary.prototype.forEach = function(operation) {
        var i = 0;
        var keys = this.keys.slice(0);
        var values = this.values.slice(0);
        var length = this.length;
        
        for (; i < length; i++) {
            operation(keys[i], values[i]);
        }
        
        return this;
    };
    
    /**
     * Clones the current Dictionary and returns the new Dictionary object
     * Does not perform a deep clone
     *
     * @returns {Dictionary}
     * @since 1.0
     */
    Dictionary.prototype.clone = function() {
        return new Dictionary(this.keys, this.values);
    };
    
    return Dictionary;
});