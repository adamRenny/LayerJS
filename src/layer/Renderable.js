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
 * Renderable Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.2
 */
define([
    'lib/gl-matrix',
    'layer/Geometry'
], function(
    glMatrix,
    Geometry
) {
    'use strict';
    
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
     * Locally cached glMatrix.mat3 object
     * Optimization step to decrease the access to mat3
     *
     * @private
     * @type {object}
     * @since 1.0
     */
    var mat3 = glMatrix.mat3;
    
    /**
     * Locally cached glMatrix.vec2 object
     * Optimization step to decrease the access to vec2
     *
     * @private
     * @type {object}
     * @since 1.0
     */
    var vec2 = glMatrix.vec2;
    
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
     * Reused cache version of a 3x3 matrix
     * Used to calculate matrix calculations without the need
     * for multiple instances of the matrix/array object within updateTransform calculations
     *
     * Should not be used within a loop that could call children of the same type or supertype
     *
     * @private
     * @type {number[]}
     * @since 1.0
     */
    var matrix = mat3.identity();
    
    /**
     * Reused cache version of the 3x3 matrix
     * Used to calculate matrix calculations without the need
     * for multiple instances of the matrix/array object within local and world coordinate calculations
     *
     * Should not be used within a loop that could call children of the same type or supertype
     *
     * @private
     * @type {number[]}
     * @since 1.0
     */
    var matrixBuffer = mat3.identity();
    
    /**
     * Renderable Constructor
     *
     * Base implementation built to be extended
     * Supports mouse events via onClick, onMouseMove, onMouseUp, onMouseDown
     * Handles point-based rotations, scale, and position on a run loop
     * Updates the transform content on demand
     * Supports demand flag for when the renderable has been modified
     * Spatial data is based on the origin being placed at top left corner
     * 
     * @name Renderable
     * @class Base Renderable structure used to render objects
     * @constructor
     * 
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @since 1.0
     */
    var Renderable = function(x, y, width, height) {
        this.init(x, y, width, height);
    };
    
    /**
     * Initializes the Renderable by setting up the spatial properties
     * Sets up the center offset, position, size, scale, rotation, and transform
     *
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @returns {Renderable}
     * @since 1.0
     */
    Renderable.prototype.init = function(x, y, width, height) {
        /**
         * Position in 2d space for the X position
         *
         * @default 0
         * @name Renderable#x
         * @type {number}
         * @since 1.0
         */
        this.x = x || 0;
        
        /**
         * Position in 2d space for the Y position
         *
         * @default 0
         * @name Renderable#y
         * @type {number}
         * @since 1.0
         */
        this.y = y || 0;
        
        /**
         * Size in 2d space of width without any scale
         *
         * @default 0
         * @name Renderable#unscaledWidth
         * @type {number}
         * @since 1.0
         */
        this.unscaledWidth = width || 0;
        
        /**
         * Size in 2d space of height without any scale
         *
         * @default 0
         * @name Renderable#unscaledHeight
         * @type {number}
         * @since 1.0
         */
        this.unscaledHeight = height || 0;
        
        /**
         * Fully scaled size in 2d space of width
         * Read-only Value
         *
         * @default 0
         * @name Renderable#width
         * @type {number}
         * @since 1.0
         */
        this.width = this.unscaledWidth;
        
        /**
         * Fully scaled size in 2d space of height
         * Read-only Value
         *
         * @default 0
         * @name Renderable#height
         * @type {number}
         * @since 1.0
         */
        this.height = this.unscaledHeight;
        
        /**
         * Scale of the renderable in the x axis
         *
         * @default 1
         * @name Renderable#scaleX
         * @type {number}
         * @since 1.0
         */
        this.scaleX = 1;
        
        /**
         * Scale of the renderable in the y axis
         *
         * @default 1
         * @name Renderable#scaleY
         * @type {number}
         * @since 1.0
         */
        this.scaleY = 1;
        
        /**
         * Rotation of the renderable in radians
         *
         * @default 0
         * @name Renderable#rotation
         * @type {number}
         * @since 1.0
         */
        this.rotation = 0;
        
        /**
         * Spatial 3x3 matrix transform of the renderable
         * Intended to be an affine transform
         *
         * @default [1, 0, 0, 0, 1, 0, 0, 0, 1]
         * @name Renderable#transform
         * @type {number[]}
         * @since 1.0
         */
        this.transform = mat3.identity();
        
        /**
         * Normalized center position in x
         * Value should be within the range [0, 1]
         *
         * @default .5
         * @name Renderable#centerOffsetX
         * @type {number}
         * @since 1.0
         */
        this.centerOffsetX = .5;
        
        /**
         * Normalized center position in y
         * Value should be within the range [0, 1]
         *
         * @default .5
         * @name Renderable#centerOffsetY
         * @type {number}
         * @since 1.0
         */
        this.centerOffsetY = .5;
        
        /**
         * Actual unscaled offset of the X position
         * Read-only Value
         *
         * @default 0
         * @name Renderable#unscaledOffsetX
         * @type {number}
         * @since 1.0
         */
        this.unscaledOffsetX = this.unscaledWidth * this.centerOffsetX;
        
        /**
         * Actual unscaled offset of the Y position
         * Read-only Value
         *
         * @default 0
         * @name Renderable#unscaledOffsetY
         * @type {number}
         * @since 1.0
         */
        this.unscaledOffsetY = this.unscaledHeight * this.centerOffsetY;
        
        /**
         * Renderable's parent's transform
         * Reference only
         * Immutable property
         *
         * @default null
         * @name Renderable#parentTransform
         * @type {number[]}
         * @since 1.0
         */
        this.parentTransform = null;
        
        /**
         * Needs Render validation flag
         * Dirty flag for whether the renderable requires to be rendered
         *
         * @default false
         * @name Renderable#needsRender
         * @type {boolean}
         * @since 1.0
         */
        this.needsRender = false;
        
        /**
         * Needs Update validation flag
         * Dirty flag for whether the renderable requires an update to the transform
         *
         * @default true
         * @name Renderable#needsUpdate
         * @type {boolean}
         * @since 1.0
         */
        this.needsUpdate = true;
        
        /**
         * Is interactive flag
         * When it is inactive, the hit detection will disregard the renderable
         *
         * @default true
         * @name Renderable#isInteractive
         * @type {boolean}
         * @since 1.2
         */
        this.isInteractive = true;
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
            vector[0] = this.scaleX;
            vector[1] = this.scaleY;
            this.width = this.unscaledWidth * this.scaleX;
            this.height = this.unscaledHeight * this.scaleY;
            mat3.scale(matrix, vector);
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