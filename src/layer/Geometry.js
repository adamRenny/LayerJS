/**
 * @fileOverview
 * Copyright (c) 2012-2013 Adam Ranfelt
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
 * Geometry Module Definition
 * @author Adam Ranfelt
 * @version 1.1
 */
define(function() {
    'use strict';
    
    /**
     * Geometry Utility Structure
     *
     * @name Geometry
     * @namespace Geometry functional utility set
     * @since 1.0
     */
    var Geometry = {
        /**
         * Cached PI constant
         *
         * @private
         * @type {number}
         * @constant
         * @since 1.1
         */
        PI: Math.PI,
        
        /**
         * Cached 2 * PI constant
         *
         * @private
         * @type {number}
         * @constant
         * @since 1.1
         */
        TWO_PI: Math.PI * 2,
        
        /**
         * Cached half PI constant
         *
         * @private
         * @type {number}
         * @constant
         * @since 1.1
         */
        HALF_PI: Math.PI * 0.5,
        
        /**
         * Checks whether a point is within a rectangle
         * Does consider edge collisions
         *
         * @function
         * @name Geometry.isPointInRect
         * @param {number} x X Position
         * @param {number} y Y Position
         * @param {number} rectX Rectangle's X Position
         * @param {number} rectY Rectangle's Y Position
         * @param {number} rectWidth Rectangle's Width
         * @param {number} rectHeight Rectangle's Height
         * @returns {boolean}
         * @since 1.0
         */
        isPointInRect: function(x, y, rectX, rectY, rectWidth, rectHeight) {
            return !(x < rectX || x > rectX + rectWidth || y < rectY || y > rectY + rectHeight);
            // return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
        },
        
        /**
         * Checks whether a rectangle is within a rectangle
         *
         * @function
         * @name Geometry.isPointInRect
         * @param {number} l1 Left 1
         * @param {number} r1 Right 1
         * @param {number} t1 Top 1
         * @param {number} b1 Bottom 1
         * @param {number} l2 Left 2
         * @param {number} r2 Left 2
         * @param {number} t2 Left 2
         * @param {number} b2 Left 2
         * @returns {boolean}
         * @since 1.0
         */
        isRectInRect: function(l1, r1, t1, b1, l2, r2, t2, b2) {
            return l2 <= r1
                && r2 >= l1
                && t2 <= b1
                && b2 >= t1;
        },

        /**
         * Get distance between two points
         *
         * @function
         * @name Geometry.getDistanceBetweenPoints
         * @param {number} x1 Point 1's X Position
         * @param {number} y1 Point 1's Y Position
         * @param {number} x2 Point 2's X Position
         * @param {number} y2 Point 2's Y Position
         * @returns {number}
         */
        getDistanceBetweenPoints: function(x1, y1, x2, y2) {
            return Math.sqrt(this.getSquaredDistanceBetweenPoints(x1, y1, x2, y2));
        },
        
        /**
         * Get squared distance between two points
         *
         * @function
         * @name Geometry.getDistanceBetweenPoints
         * @param {number} x1 Point 1's X Position
         * @param {number} y1 Point 1's Y Position
         * @param {number} x2 Point 2's X Position
         * @param {number} y2 Point 2's Y Position
         * @returns {number}
         */
        getSquaredDistanceBetweenPoints: function(x1, y1, x2, y2) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            return (dx * dx) + (dy * dy);
        },

        /**
         * Check whether a point is within a circle
         *
         * @function
         * @name Geometry.isPointInCirc
         * @param {number} x X Position
         * @param {number} y Y Position
         * @param {number} circCenterX Circle's center X Position
         * @param {number} circCenterY Circle's center Y Position
         * @param {number} radius Circle's radius
         * @returns {boolean}
         */
        isPointInCircle: function(x, y, circCenterX, circCenterY, radius) {
            return this.getSquaredDistanceBetweenPoints(x, y, circCenterX, circCenterY) < (radius * radius);
        },
        
        /**
         * Checks whether a point in polar coordinates is within a defined radial width
         *
         * @function
         * @name Geometry.isPolarPointInPolarArea
         * @param {number} r1 Radius of the point to test
         * @param {number} t1 Theta of the point to test
         * @param {number} r2 Radius of the polar area
         * @param {number} st2 Starting theta of the polar area
         * @param {number} et2 Ending theta of the polar area
         * @returns {boolean}
         * @since 1.1
         */
        isPolarPointInPolarArea: function(r1, t1, r2, st2, et2) {
            return r1 <= r2 && t1 >= st2 && t1 <= et2;
        }
    };
    
    return Geometry;
});