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
 * EventBus Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.0
 */
define(function() {
    "use strict";
    
    /**
     * Type definition that all callbacks must be
     * Used to compare all callback types against
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    var CALLBACK_TYPE = 'function';
    
    /**
     * EventBus Constructor
     *
     * EventBus structure, using the observer pattern
     * Publishes messages based on topics on a topic-to-callback basis
     *
     * @name EventBus
     * @class Publish-subscribe observer model
     * @constructor
     * @since 1.0
     */
    var EventBus = function() {
        /**
         * Topic associative array
         *
         * @default {}
         * @name EventBus#topics
         * @type {object}
         * @since 1.0
         */
        this.topics = {};
    };
    
    /**
     * Attaches a callback to the provided method
     * Subscriptions during triggers are not recommended as they could incur odd behavior
     *
     * @throws {Error} When subscribe does not contain all parameters
     * @throws {Error} When the callback is not of type function
     * @throws {Error} When the callback is already subscribing to the provided topic
     *
     * @param {string} topic Topic to subscribe to
     * @param {function} callback Callback to invoke upon trigger of the topic
     * @since 1.0
     */
    EventBus.prototype.subscribe = function(topic, callback) {
        if (topic === undefined || callback === undefined) {
            throw 'EventBus::subscribe - Error: Subscribe usage: subscribe(topic, callback)';
        }
        
        if (typeof callback !== CALLBACK_TYPE) {
            throw 'EventBus::subscribe - Error: Callback subscribing is of type ' + (typeof callback) + ' not of type ' + CALLBACK_TYPE;
        }
        
        var topics = this.topics;
        if (!topics.hasOwnProperty(topic)) {
            topics[topic] = [];
        }
        
        var topicMessage = topics[topic];
        if (topicMessage.indexOf(callback) !== -1) {
            throw 'EventBus::subscribe - Error: Callback subscribing to topic ' + topic + ' already exists';
        }
        
        topicMessage.push(callback);
    };
    
    /**
     * Publishes data and triggers any listening callbacks to that given topic
     *
     * @throws {Error} When publish does not contain all parameters
     *
     * @param {string} topic Topic to publish
     * @param {mixed} data Data to pass with publish call
     * @since 1.0
     */
    EventBus.prototype.publish = function(topic, data) {
        if (topic === undefined) {
            throw 'EventBus::publish - Error: Publish usage: publish(topic, data)';
        }
        
        var topics = this.topics;
        if (!topics.hasOwnProperty(topic)) {
            return;
        }
        var topicMessage = topics[topic];
        
        for (var i = 0, length = topicMessage.length; i < length; i++) {
            topicMessage[i](data);
        }
    };
    
    /**
     * Unattaches a callback from the provided topic
     *
     * @throws {Error} When unsubscribe does not contain all parameters
     * @throws {Error} When the callback is not of type function
     *
     * @param {string} topic Topic to unsubscribe from
     * @param {function} callback Callback to remove the subscription of
     * @since 1.0
     */
    EventBus.prototype.unsubscribe = function(topic, callback) {
        if (topic === undefined || callback === undefined) {
            throw 'EventBus::unsubscribe - Error: Unsubscribe usage: unsubscribe(topic, callback)';
        }
        
        if (typeof callback !== CALLBACK_TYPE) {
            throw 'EventBus::unsubscribe - Error: Callback of type ' + (typeof callback) + ' is not of type ' + CALLBACK_TYPE;
        }
        
        var topics = this.topics;
        if (!topics.hasOwnProperty(topic)) {
            return;
        }
        var topicMessage = topics[topic];
        var index = topicMessage.indexOf(callback);
        
        if (index !== -1) {
            topicMessage.splice(index, 1);
        }
    };
    
    return new EventBus();
});