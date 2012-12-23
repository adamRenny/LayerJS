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
 * Render Request Module Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */
define(function() {
    'use strict';
    
    /**
     * RenderRequest Constructor
     *
     * Mediator pattern to communicate from the Renderable infrastructure up to the scene
     * Scenes and Renderables are related through a namespace string
     * Uses a reset type of getter, where any retrieval of needsRender will result in resetting the render flag
     * 
     * @name RenderRequest
     * @class Render Request mediator construct used to communicate between child and parent via string
     * @constructor
     * 
     * @since 1.0
     */
    var RenderRequest = function() {
        this.init();
    };

    /**
     * Initializes the request structure and builds the base render stack
     *
     * @returns {RenderRequest}
     * @since 1.0
     */
    RenderRequest.prototype.init = function() {
        /**
         * Scene Render Stack used to store the needsRender flag for each namespace
         *
         * @default {}
         * @name RenderRequest#sceneRenderStack
         * @type {object}
         * @since 1.0
         */
        this.sceneRenderStack = {};

        return this;
    };

    /**
     * Updates the flag for the given namespace to be true
     *
     * @param {string} sceneNamespace Namespace of the scene to mark as true
     * @returns {RenderRequest}
     * @since 1.0
     */
    RenderRequest.prototype.setNeedsRender = function(sceneNamespace) {
        this.sceneRenderStack[sceneNamespace] = true;

        return this;
    };

    /**
     * Gets the flag for the given namespace, resets the namespace afterwards
     *
     * @param {string} sceneNamespace Namespace of the scene to get the state of
     * @returns {boolean}
     * @since 1.0
     */
    RenderRequest.prototype.getNeedsRender = function(sceneNamespace) {
        var needsRender = this.sceneRenderStack[sceneNamespace];
        this.sceneRenderStack[sceneNamespace] = false;

        return needsRender;
    };

    return RenderRequest;
});