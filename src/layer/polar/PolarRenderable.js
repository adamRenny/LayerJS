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
 * PolarRenderable Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.0
 */
define([
    'layer/Renderable',
    'layer/Geometry'
], function(
    Renderable,
    Geometry
) {
    'use strict';
    
    /**
     * Locally cached Math.sqrt function
     * Optimization step to decrease the access to Math.sqrt
     *
     * @private
     * @function
     * @type {function}
     * @since 1.0
     */
    var sqrt = Math.sqrt;
    
    /**
     * Locally cached Math.round function
     * Optimization step to decrease the access to Math.round
     *
     * @private
     * @function
     * @type {function}
     * @since 1.0
     */
    var round = Math.round;
    
    /**
     * Locally cached Math.atan2 function
     * Optimization step to decrease the access to Math.atan2
     *
     * @private
     * @function
     * @type {function}
     * @since 1.0
     */
    var atan2 = Math.atan2;
    
    /**
     * Reused cache version of the 2d vector
     * Used to calculate vector calculations without the need
     * for multiple instances of the array within calculations
     *
     * Should not be used within a loop that could call children of the same type or supertype
     *
     * @private
     * @type {number[]}
     * @since 1.0
     */
    var vector = [0, 0];
    
    /**
     * Reused cache version of the polar vector
     * Used to calculate vector calculations without the need
     * for multiple instances of the array within calculations
     * (r, theta)
     *
     * Should not be used within a loop that could call children of the same type or supertype
     *
     * @private
     * @type {number[]}
     * @since 1.0
     */
    var polarVector = [0, 0];
    
    /**
     * PolarRenderable Constructor
     *
     * Base implementation built to be extended
     * Supports mouse events via onClick, onMouseMove, onMouseUp, onMouseDown
     * Handles point-based rotations, scale, and position on a run loop
     * Updates the transform content on demand
     * Supports demand flag for when the renderable has been modified
     * X and Y is assumed to be the x and y with respect to a polar coordinate space
     * 
     * @name PolarRenderable
     * @class Polar Renderable structure used to render objects in polar space
     * @constructor
     * @extends Renderable
     * 
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} radius Radius in polar coordinates
     * @param {number} theta Angle in radians
     * @since 1.0
     */
    var PolarRenderable = function(x, y, radius, theta) {
        this.init(x, y, radius, theta);
    };
    
    PolarRenderable.prototype = new Renderable();
    PolarRenderable.prototype.constructor = PolarRenderable;
    
    /**
     * @see Renderable#init
     */
    PolarRenderable.prototype.Renderable_init = Renderable.prototype.init;
    
    /**
     * Initializes the Renderable by setting up the spatial properties
     * Sets up the center offset, position, size, scale, rotation, and transform
     *
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} radius Radius in polar coordinates
     * @param {number} theta Angle in radians
     * @returns {PolarRenderable}
     * @since 1.0
     */
    PolarRenderable.prototype.init = function(x, y, radius, theta) {
        this.Renderable_init(x, y, radius, theta);
        
        /**
         * Radius of the polar renderable's position
         *
         * @default 0
         * @name PolarRenderable#radius
         * @type {number}
         * @since 1.0
         */
        this.radius = radius || 0;
        
        /**
         * Theta of the polar renderable's position
         *
         * @default 0
         * @name PolarRenderable#radius
         * @type {number}
         * @since 1.0
         */
        this.theta = theta || 0;
    };
    
    /**
     * Tests the hit to see if it exists within the bounding box of this renderable
     * Uses a rectangle test method
     *
     * @param {number} x X Position in World Coordinates
     * @param {number} y Y Position in Wolrd Coordinates
     * @returns {boolean}
     * @since 1.0
     */
    PolarRenderable.prototype.hitTest = function(x, y) {
        polarVector = this.convertWorldToPolar(x, y);
        return this.theta === polarVector[1] && polarVector[0] <= this.radius;
    };
    
    /**
     * Converts a local coordinate space into a polar coordinate space
     *
     * @param {number[]} vec 2 dimensional local coordinates
     * @returns {number[]}
     * @since 1.0
     */
    PolarRenderable.prototype.toPolarCoords = function(vec) {
        polarVector[0] = sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
        polarVector[1] = atan2(vec[1], vec[0]);
        
        if (polarVector[1] < 0) {
            polarVector[1] = polarVector[1] + Geometry.TWO_PI;
        }
        
        return polarVector;
    };
    
    /**
     * Converts a world coordinate space into a polar coordinate space
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {number[]}
     * @since 1.0
     */
    PolarRenderable.prototype.convertWorldToPolar = function(x, y) {
        vector[0] = x;
        vector[1] = y;
        vector = this.toLocalCoordinates(vector, true);
        polarVector = this.toPolarCoords(vector);
        
        return polarVector;
    };

    return PolarRenderable;
});