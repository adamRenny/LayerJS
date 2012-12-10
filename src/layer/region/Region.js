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
 * Quadtree Region Interface Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */
define(function() {
    'use strict';
    
    /**
     * Region Constructor
     *
     * Region contains a bounding box that can be tested against geometric regions
     *
     * @name QuadtreeRegion
     * @class Quadtree helper region structure
     * @constructor
     *
     * @since 1.0
     */
    var Region = function() {
        /**
         * X Position
         *
         * @name QuadtreeRegion#x
         * @type {number}
         * @since 1.0
         */
        this.x = 0;
        
        /**
         * Y Position
         *
         * @name QuadtreeRegion#y
         * @type {number}
         * @since 1.0
         */
        this.y = 0;
    };

    /**
     * Tests a region to determine if the region is in inside of the region
     * If a region has no width or height it will fail
     *
     * @param {QuadtreeRectRegion} rect Rectangle to test against
     * @returns {boolean}
     * @since 1.0
     */
    Region.prototype.hitTestRect = function(rect) {
        return false;
    };
    
    /**
     * Tests a point to determine if the point is in inside of the region
     *
     * @param {QuadtreePointRegion} point Point to test against
     * @returns {boolean}
     * @since 1.0
     */
    Region.prototype.hitTestPoint = function(point) {
        return false;
    };
    
    return Region;
});