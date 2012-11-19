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
 * PolarRenderableGroup Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.0
 */

define([
    'layer/RenderableGroup',
    'layer/Geometry'
], function(
    RenderableGroup,
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
     * @type {Array}
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
     * @type {Array}
     * @since 1.0
     */
    var polarVector = [0, 0];
    
    /**
     * <p>Polar Renderable Group Constructor</p>
     *
     * <p>Polar renderable group construct built to support scenegraph based children</p>
     * 
     * @name PolarRenderableGroup
     * @class Polar RenderableGroup Container structure used to store Renderable children which owns the origin
     * @constructor
     * @extends RenderableGroup
     * 
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} radius Radius of the renderable group
     * @since 1.0
     */
    var PolarRenderableGroup = function(x, y, radius) {
        if (x !== undefined && y !== undefined && radius !== undefined) {
            this.init(x, y, radius);
        }
    };
    
    PolarRenderableGroup.prototype = new RenderableGroup();
    PolarRenderableGroup.prototype.constructor = PolarRenderableGroup;
    
    PolarRenderableGroup.prototype.RenderableGroup_init = RenderableGroup.prototype.init;
    PolarRenderableGroup.prototype.RenderableGroup_toLocalCoordinates = RenderableGroup.prototype.toLocalCoordinates;
    PolarRenderableGroup.prototype.RenderableGroup_render = RenderableGroup.prototype.render;
    
    PolarRenderableGroup.prototype.init = function(x, y, radius) {
        this.RenderableGroup_init(x, y, radius, radius);
        
        this.radius = radius;
    };
    
    /**
     * Sets the radius of the polar position
     * Updates the <em>needsUpdate</em> and <em>needsRender</em> flags
     *
     * @param {number} radius Radius in polar coordinates
     * @returns {PolarRenderableGroup}
     * @since 1.0
     */
    PolarRenderableGroup.prototype.setRadius = function(radius) {
        this.radius = radius;
        this.needsUpdate = true;
        this.needsRender = true;
        
        return this;
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
    PolarRenderableGroup.prototype.hitTest = function(x, y) {
        vector[0] = x;
        vector[1] = y;
        
        vector = this.toLocalCoordinates(vector, true);
        
        return vector[0] * vector[0] + vector[1] * vector[1] <= this.radius * this.radius;
    };
    
    /**
     * Converts a local coordinate space into a polar coordinate space
     *
     * @param {Array} vec 2 dimensional local coordinates
     * @returns {Array}
     * @since 1.0
     */
    PolarRenderableGroup.prototype.toPolarCoords = function(vec) {
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
     * @returns {Array}
     * @since 1.0
     */
    PolarRenderableGroup.prototype.convertWorldToPolar = function(x, y) {
        vector[0] = x;
        vector[1] = y;
        vector = this.toLocalCoordinates(vector, true);
        polarVector = this.toPolarCoords(vector);
        
        return polarVector;
    };
    
    return PolarRenderableGroup;
})