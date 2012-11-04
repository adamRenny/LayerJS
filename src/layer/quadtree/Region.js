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
 * Quadtree Region Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.0
 */
define([
    'layer/Geometry'
], function(
    Geometry
) {
    "use strict";
    
    /**
     * Region Constructor
     *
     * Region contains a bounding box that can be tested against geometric regions
     *
     * @name QuadtreeRegion
     * @class Quadtree helper region structure
     * @constructor
     * @since 1.0
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @param {number} width Region Width
     * @param {number} height Region Height
     */
    var Region = function(x, y, width, height) {
        /**
         * X Position
         *
         * @name QuadtreeRegion#x
         * @type {number}
         * @since 1.0
         */
        this.x = x;
        
        /**
         * Y Position
         *
         * @name QuadtreeRegion#y
         * @type {number}
         * @since 1.0
         */
        this.y = y;
        
        /**
         * Region Width
         *
         * @name QuadtreeRegion#width
         * @type {number}
         * @since 1.0
         */
        this.width = width;
        
        /**
         * Region Height
         *
         * @name QuadtreeRegion#height
         * @type {number}
         * @since 1.0
         */
        this.height = height;
        
        /**
         * Center X position 
         *
         * @name QuadtreeRegion#centerX
         * @type {number}
         * @since 1.0
         */
        this.centerX = x + (width * .5);
        
        /**
         * Center Y position 
         *
         * @name QuadtreeRegion#centerY
         * @type {number}
         * @since 1.0
         */
        this.centerY = y + (height * .5);
    };

    /**
     * Tests a region to determine if the region is in inside of the region
     * If a region has no width or height it will fail
     *
     * @param {QuadtreeRegion} region Quadtree region to test against
     * @returns {boolean}
     * @since 1.0
     */
    Region.prototype.hitTestRegion = function(region) {
        if (this.width === 0 || this.height === 0
            || region.width === 0 || region.height === 0
        ) {
            return false;
        }
        
        return Geometry.isRectInRect(
            this.x,
            this.x + this.width,
            this.y,
            this.y + this.height,
            region.x,
            region.x + region.width,
            region.y,
            region.y + region.height
        );
    };
    
    /**
     * Tests a point to determine if the point is in inside of the region
     * If the region has no width or height it will fail
     *
     * @param {Array} point Point contined via gl-matrix vec2 array
     * @returns {boolean}
     * @since 1.0
     */
    Region.prototype.hitTestPoint = function(point) {
        if (this.width === 0 || this.height === 0) {
            return false;
        }
        
        return Geometry.isPointInRect(
            point[0],
            point[1],
            this.x,
            this.y,
            this.width,
            this.height
        );
    };
    
    return Region;
});