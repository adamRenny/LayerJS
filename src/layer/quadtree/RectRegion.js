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
 * Quadtree Rectangle Region Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.2
 */
define([
    'layer/quadtree/Region',
    'layer/Geometry'
], function(
    Region,
    Geometry
) {
    'use strict';
    
    var Math_floor = Math.floor;
    
    /**
     * Region Constructor
     *
     * Region contains a bounding box that can be tested against geometric regions
     *
     * @name QuadtreeRectRegion
     * @class Quadtree rectangle helper region structure
     * @constructor
     * @since 1.0
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @param {number} width Region Width
     * @param {number} height Region Height
     */
    var RectRegion = function(x, y, width, height) {
        /**
         * X Position
         *
         * @name QuadtreeRectRegion#x
         * @type {number}
         * @since 1.0
         */
        this.x = x;
        
        /**
         * Y Position
         *
         * @name QuadtreeRectRegion#y
         * @type {number}
         * @since 1.0
         */
        this.y = y;
        
        /**
         * Region Width
         *
         * @name QuadtreeRectRegion#width
         * @type {number}
         * @since 1.0
         */
        this.width = width;
        
        /**
         * Region Height
         *
         * @name QuadtreeRectRegion#height
         * @type {number}
         * @since 1.0
         */
        this.height = height;
        
        /**
         * Region Half Width
         *
         * @name QuadtreeRectRegion#halfWidth
         * @type {number}
         * @since 1.2
         */
        this.halfWidth = width * .5;
        
        /**
         * Region Half Height
         *
         * @name QuadtreeRectRegion#halfHeight
         * @type {number}
         * @since 1.2
         */
        this.halfHeight = height * .5;
        
        /**
         * Center X position 
         *
         * @name QuadtreeRectRegion#centerX
         * @type {number}
         * @since 1.0
         */
        this.centerX = Math_floor(x + this.halfWidth);
        
        /**
         * Center Y position 
         *
         * @name QuadtreeRectRegion#centerY
         * @type {number}
         * @since 1.0
         */
        this.centerY = Math_floor(y + this.halfHeight);
    };
    
    RectRegion.prototype = new Region;
    RectRegion.prototype.constructor = RectRegion;

    /**
     * Tests a region to determine if the region is in inside of the region
     * If a region has no width or height it will fail
     *
     * @param {QuadtreeRectRegion} region Quadtree region to test against
     * @returns {boolean}
     * @since 1.0
     */
    RectRegion.prototype.hitTestRect = function(rect) {
        if (this.width === 0 || this.height === 0
            || rect.width === 0 || rect.height === 0
        ) {
            return false;
        }
        
        return Geometry.isRectInRect(
            this.x,
            this.x + this.width,
            this.y,
            this.y + this.height,
            rect.x,
            rect.x + rect.width,
            rect.y,
            rect.y + rect.height
        );
    };
    
    /**
     * Tests a point to determine if the point is in inside of the region
     * If the region has no width or height it will fail
     *
     * @param {QuadtreePointRegion} point Point contined via gl-matrix vec2 array
     * @returns {boolean}
     * @since 1.0
     */
    RectRegion.prototype.hitTestPoint = function(point) {
        if (this.width === 0 || this.height === 0) {
            return false;
        }
        
        return Geometry.isPointInRect(
            point.x,
            point.y,
            this.x,
            this.y,
            this.width,
            this.height
        );
    };
    
    return RectRegion;
});