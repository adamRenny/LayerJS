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
     * RenderMediator Constructor
     *
     * Mediator pattern to communicate from the Renderable infrastructure up to the scene
     * Scenes and Renderables are related through a namespace string
     * Uses a reset type of getter, where any retrieval of needsRender will result in resetting the render flag
     * 
     * @name RenderMediator
     * @class Render Request mediator construct used to communicate between child and parent via string
     * @constructor
     * 
     * @since 1.0
     */
    var RenderMediator = function() {
        this.init();
    };

    /**
     * Initializes the request structure and builds the base render stack
     *
     * @returns {RenderMediator}
     * @since 1.0
     */
    RenderMediator.prototype.init = function() {
        /**
         * Flag to determine if the render stack needs a render
         *
         * @default false
         * @name RenderMediator#needsRender
         * @type {boolean}
         * @since 1.0
         */
        this.needsRender = false;

        return this;
    };

    /**
     * Updates the flag for the given namespace to be true
     *
     * @param {string} sceneNamespace Namespace of the scene to mark as true
     * @returns {RenderMediator}
     * @since 1.0
     */
    RenderMediator.prototype.setNeedsRender = function(sceneNamespace) {
        this.needsRender = true;

        return this;
    };

    /**
     * Gets the flag for the given namespace, resets the namespace afterwards
     *
     * @param {string} sceneNamespace Namespace of the scene to get the state of
     * @returns {boolean}
     * @since 1.0
     */
    RenderMediator.prototype.pullNeedsRender = function(sceneNamespace) {
        var needsRender = this.needsRender;
        this.needsRender = false;

        return needsRender;
    };

    return RenderMediator;
});