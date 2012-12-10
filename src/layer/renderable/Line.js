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
 * Line Module Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */
define([
    'layer/Renderable',
    'lib/gl-matrix',
    'layer/Geometry'
], function(
    Renderable,
    glMatrix,
    Geometry
) {
    'use strict';
    
    /**
     * Line Constructor
     *
     * 
     * 
     * @name Line
     * @class Linear point to point line
     * @constructor
     * 
     * @param {number} x1 Line start x
     * @param {number} y1 Line start y
     * @param {number} x2 Line end x
     * @param {number} y2 Line end y
     * @since 1.0
     */
    var Line = function (x1, y1, x2, y2) {
        if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
            this.init(x1, y1, x2, y2);
        }
    };
    
    Line.prototype = new Renderable();
    Line.prototype.constructor = Line;

    Line.prototype.Renderable_init = Renderable.prototype.init;
    Line.prototype.Renderable_render = Renderable.prototype.render;

    /**
     * Initializes the Renderable by setting up the spatial properties
     * Sets up the center offset, position, size, scale, rotation, and transform
     *
     * @param {number} x1 Line start x
     * @param {number} y1 Line start y
     * @param {number} x2 Line end x
     * @param {number} y2 Line end y
     * @returns {Line}
     * @since 1.0
     */
    Line.prototype.init = function(x1, y1, x2, y2) {
        this.Renderable_init(x1, x2, 1, 1);
        
        
        return this;
    };
    
    /**
     * Sets the parent transform reference
     * Updates the <em>needsUpdate</em> and <em>needsRender</em> flags
     *
     * @param {number[]} transform Parent transform
     * @returns {Renderable}
     * @since 1.0
     */
    Renderable.prototype.setParentTransform = function(transform) {
        this.parentTransform = transform;
        this.needsUpdate = true;
        this.needsRender = true;
        
        return this;
    };
    
    /**
     * Sets the center point to rotate from
     * Updates the <em>needsUpdate</em> and <em>needsRender</em> flags
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable}
     * @since 1.0
     */
    Renderable.prototype.setCenterPoint = function(x, y) {
        this.centerOffsetX = x;
        this.centerOffsetY = y;
        this.unscaledOffsetX = this.unscaledWidth * this.centerOffsetX;
        this.unscaledOffsetY = this.unscaledHeight * this.centerOffsetY;
        this.needsUpdate = true;
        this.needsRender = true;
        
        return this;
    };
    
    /**
     * Sets the renderable to be dirty and need to update its current spatial logic
     *
     * @returns {Renderable}
     * @since 1.0
     */
    Renderable.prototype.setNeedsUpdate = function() {
        this.needsUpdate = true;
        this.needsRender = true;
        
        return this;
    };
    
    /**
     * Updates the transform based on the position, scale, and rotation of the object
     * Calculates the transform from the parent if it exists, identify if otherwise
     * Handled internally, should only be called if necessary
     *
     * @since 1.0
     */
    Renderable.prototype.updateTransform = function() {
        // Sets up the base transform as the parentTransform if it exists
        if (this.parentTransform) {
            mat3.set(this.parentTransform, this.transform);
            matrix = this.transform;
        // Sets up the base transform with an identity
        } else {
            matrix = mat3.identity(this.transform);
        }
        
        // Only setup the translate if x or y is set
        if (this.x != 0 || this.y != 0) {
            vector[0] = this.x;
            vector[1] = this.y;
            mat3.translate(matrix, vector);
        }
        
        // Only setup the scale if the scaleX or scaleY is set
        if (this.scaleX != 1 || this.scaleY != 1) {
            vector[0] = this.unscaledOffsetX;
            vector[1] = this.unscaledOffsetY;
            mat3.translate(matrix, vector);
            vector[0] = this.scaleX;
            vector[1] = this.scaleY;
            this.width = this.unscaledWidth * this.scaleX;
            this.height = this.unscaledHeight * this.scaleY;
            mat3.scale(matrix, vector);
            vector[0] = -this.unscaledOffsetX;
            vector[1] = -this.unscaledOffsetY;
            mat3.translate(matrix, vector);
        }
        
        // Only setup the rotation if the rotation is non-zero
        if (this.rotation) {
            vector[0] = this.unscaledOffsetX;
            vector[1] = this.unscaledOffsetY;
            mat3.translate(matrix, vector);
            mat3.rotate(matrix, this.rotation);
            vector[0] = -vector[0];
            vector[1] = -vector[1];
            mat3.translate(matrix, vector);
        }
        
        this.needsUpdate = false;
    };
    
    /**
     * Converts the passed in vector to local coordinates
     *
     * @param {number[]} vec 2D Vector in world coordinates
     * @param {boolean} shouldRound If true, rounds the converted coordinates, optional
     * @returns {number[]}
     * @since 1.0
     */
    Renderable.prototype.toLocalCoordinates = function(vec, shouldRound) {
        if (this.needsUpdate) {
            this.updateTransform();
        }
        
        mat3.identity(matrixBuffer);
        mat3.multiplyVec2(mat3.inverse(this.transform, matrixBuffer), vec);
        
        if (shouldRound) {
            vec[0] = round(vec[0]);
            vec[1] = round(vec[1]);
        }
        
        return vec;
    };
    
    /**
     * Converts the passed in vector to world coordinates
     *
     * @param {number[]} vec 2D Vector in local coordinates
     * @param {boolean} shouldRound If true, rounds the converted coordinates, optional
     * @returns {number[]}
     * @since 1.0
     */
    Renderable.prototype.toWorldCoordinates = function(vec, shouldRound) {
        if (this.needsUpdate) {
            this.updateTransform();
        }
        
        mat3.multiplyVec2(this.transform, vec);
        if (shouldRound) {
            vec[0] = round(vec[0]);
            vec[1] = round(vec[1]);
        }
        
        return vec;
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
    Renderable.prototype.hitTest = function(x, y) {
        vector[0] = x;
        vector[1] = y;
        
        vector = this.toLocalCoordinates(vector, true);
        
        return Geometry.isPointInRect(vector[0], vector[1], 0, 0, this.unscaledWidth, this.unscaledHeight);
    };
    
    /**
     * Returns the first child hit target for the given position
     * If there is no child, returns null
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable|null}
     * @since 1.0
     */
    Renderable.prototype.getChildHitTarget = function(x, y) {
        return null;
    };
    
    /**
     * Finds the next child hit target if it exists
     * If it doesn't exist, returns null
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @param {Renderable} sibling Previously found sibling
     * @returns {Renderable|null}
     * @since 1.4
     */
    Renderable.prototype.getNextChildHitTarget = function(x, y, sibling) {
        return null;
    };
    
    /**
     * Returns the target for the given position
     * If there is no target, returns this
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable}
     * @since 1.0
     */
    Renderable.prototype.getHitTarget = function(x, y) {
        return this;
    };
    
    /**
     * Applies the transform to the context
     * Bypasses traditional save, restore methods and uses a setTransform instead
     *
     * @param {CanvasRenderingContext2D} context Context to apply the transform to
     * @since 1.0
     */
    Renderable.prototype.applyTransform = function(context) {
        matrix = this.transform;
        context.setTransform(matrix[0], matrix[1], matrix[3], matrix[4], matrix[6], matrix[7]);
    };
    
    /**
     * Sets up the update transform stack and applies the transform
     * Updates the transform if necessary
     *
     * @param {CanvasRenderingContext2D} context Context to render to
     * @since 1.0
     */
    Renderable.prototype.render = function(context) {
        if (this.needsUpdate) {
            this.updateTransform();
        }
        
        this.needsRender = false;
        
        this.applyTransform(context);
    };

    return Renderable;
});