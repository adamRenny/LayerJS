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
 * Quadtree Point Region Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.0
 */
define([
    'layer/quadtree/Region',
    'layer/Geometry'
], function(
    Region,
    Geometry
) {
    "use strict";
    
    var Math_floor = Math.floor;
    
    /**
     * Region Constructor
     *
     * Region contains a point that can be tested against geometric regions
     *
     * @name QuadtreePointRegion
     * @class Quadtree point helper region structure
     * @constructor
     * @since 1.0
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @param {number} width Region Width
     * @param {number} height Region Height
     */
    var PointRegion = function(x, y) {
        /**
         * X Position
         *
         * @name QuadtreePointRegion#x
         * @type {number}
         * @since 1.0
         */
        this.x = x;
        
        /**
         * Y Position
         *
         * @name QuadtreePointRegion#y
         * @type {number}
         * @since 1.0
         */
        this.y = y;
    };
    
    PointRegion.prototype = new Region;
    PointRegion.prototype.constructor = PointRegion;

    /**
     * Tests a region to determine if the region is in inside of the region
     * If a region has no width or height it will fail
     *
     * @param {QuadtreePointRegion} region Quadtree region to test against
     * @returns {boolean}
     * @since 1.0
     */
    PointRegion.prototype.hitTestRect = function(rect) {
        if (rect.width === 0 || rect.height === 0) {
            return false;
        }
        
        return Geometry.isPointInRect(
            this.x,
            this.y,
            rect.x,
            rect.y,
            rect.width,
            rect.height
        );
    };
    
    /**
     * Tests a point to determine if the point equivalent
     *
     * @param {QuadtreePointRegion} point Point region
     * @returns {boolean}
     * @since 1.0
     */
    PointRegion.prototype.hitTestPoint = function(point) {
        return this.x === point.x && this.y === point.y;
    };
    
    return PointRegion;
});