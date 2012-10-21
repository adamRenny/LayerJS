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
 * Geometry Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.0
 */
define(function() {
    "use strict";
    
    /**
     * Geometry Utility Structure
     *
     * @name Geometry
     * @namespace Geometry functional utility set
     * @since 1.0
     */
    var Geometry = {
        /**
         * Checks whether a point is within a rectangle
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
        }
    };
    return Geometry;
})