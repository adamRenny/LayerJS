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
 * RenderableGroup Module Definition
 * @author Adam Ranfelt
 * @version 1.7.1
 */
define([
    'layer/Renderable',
    'layer/Geometry'
], function(
    Renderable,
    Geometry
) {
    'use strict';
    
    var Math = window.Math;
    var mathMax = Math.max;
    var mathMin = Math.min;
    
    var vector = [0, 0];
    
    /**
     * <p>Renderable Group Constructor</p>
     *
     * <p>Base group construct built to support scenegraph based children</p>
     *
     * @name RenderableGroup
     * @class Base RenderableGroup Container structure used to store Renderable children
     * @constructor
     * @extends Renderable
     *
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @since 1.0
     */
    var RenderableGroup = function(x, y, width, height) {
        if (x !== undefined && y !== undefined && width !== undefined && height !== undefined) {
            this.init(x, y, width, height);
        }
    };
    
    RenderableGroup.prototype = new Renderable();
    RenderableGroup.prototype.constructor = RenderableGroup;
    
    /**
     * @see Renderable#init
     */
    RenderableGroup.prototype.Renderable_init = Renderable.prototype.init;
    
    /**
     * @see Renderable#updateTransform
     */
    RenderableGroup.prototype.Renderable_updateTransform = Renderable.prototype.updateTransform;

    /**
     * @see Renderable#setRenderMediator
     */
    RenderableGroup.prototype.Renderable_setRenderMediator = Renderable.prototype.setRenderMediator;

    /**
     * @see Renderable#setNeedsUpdate
     */
    RenderableGroup.prototype.Renderable_setNeedsUpdate = Renderable.prototype.setNeedsUpdate;

    /**
     * @see Renderable#destroy
     */
    RenderableGroup.prototype.Renderable_destroy = Renderable.prototype.destroy;
    
    /**
     * Initializes the RenderableGroup with the Renderable parameters
     * Sets up the initial children
     *
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @returns {RenderableGroup}
     * @since 1.0
     */
    RenderableGroup.prototype.init = function(x, y, width, height) {
        this.Renderable_init(x, y, width, height);
        
        /**
         * X Position of the content relative to the group
         *
         * @default 0
         * @name RenderableGroup#contentX
         * @type {number}
         * @since 1.2
         */
        this.contentX = 0;
        
        /**
         * Y Position of the content relative to the group
         *
         * @default 0
         * @name RenderableGroup#contentY
         * @type {number}
         * @since 1.2
         */
        this.contentY = 0;
        
        /**
         * Width of the children in box dimensions
         *
         * @default 0
         * @name RenderableGroup#contentWidth
         * @type {number}
         * @since 1.1
         */
        this.contentWidth = 0;
        
        /**
         * Height of the children in box dimensions
         *
         * @default 0
         * @name RenderableGroup#contentHeight
         * @type {number}
         * @since 1.1
         */
        this.contentHeight = 0;
        
        /**
         * SceneGraph children set
         *
         * @default []
         * @name RenderableGroup#children
         * @type {Renderable[]}
         * @since 1.0
         */
        this.children = [];
        
        /**
         * Flag for whether the renderable is a leaf node
         * When it is a leaf node, hit stacks will not perform a DFS
         *
         * @default false
         * @name RenderableGroup#isLeafNode
         * @type {boolean}
         * @since 1.3
         */
        this.isLeafNode = false;
    };

    /**
     * Destroy RenderableGroup and call destroy on children
     *
     * @return {RenderableGroup}
     * @since 1.6
     */
    RenderableGroup.prototype.destroy = function() {
        this.Renderable_destroy();

        var i = 0;
        var children = this.children;
        var length = children.length;

        for (; i < length; i++) {
            children[i].destroy();
        }

        return this;
    };

    /**
     * Sets the scene's render mediator reference
     * Pushes a render request to the renderMediator to inform the scene to render
     *
     * @param {RenderMediator} renderMediator Mediator used for render nodes to communicate to the Scene with render requests
     * @returns {Renderable}
     * @since 1.7
     */
    RenderableGroup.prototype.setRenderMediator = function(renderMediator) {
        this.Renderable_setRenderMediator(renderMediator);

        var i = 0;
        var children = this.children;
        var length = children.length;

        for (; i < length; i++) {
            children[i].setRenderMediator(renderMediator);
        }

        return this;
    };
    
    /**
     * Adds a child to the stack and pushes the parent transform
     *
     * @throws {ExistentialError} If the child is already a child of this object
     * @param {Renderable} child Child to add
     * @returns {RenderableGroup}
     * @since 1.0
     */
    RenderableGroup.prototype.addChild = function(child) {
        if (this.children.indexOf(child) !== -1) {
            throw new Error('ExistentialError: Child already exists in group');
        }

        this.children.push(child);
        if (this.needsUpdate) {
            this.updateTransform();
        }
        child.setRenderMediator(this.renderMediator);
        child.setParent(this);

        return this;
    };

    /**
     * Add child to the stack at index and pushes the parent transform
     *
     * @throws {ExistentialError} If the child is already a child of this object
     * @param {Number} index Index to insert child at
     * @param {Renderable} child Child to add
     * @return {RenderableGroup}
     * @since 1.5
     */
    RenderableGroup.prototype.insertChildAtIndex = function(index, child) {
        if (this.children.indexOf(child) !== -1) {
            throw new Error('ExistentialError: Child already exists in group');
        }

        if (index < 0) {
            this.children.unshift(child);
        } else if (index >= this.children.length) {
            this.children.push(child);
        } else {
            this.children.splice(index, 0, child);
        }

        if (this.needsUpdate) {
            this.updateTransform();
        }
        child.setRenderMediator(this.renderMediator);
        child.setParent(this);

        return this;
    };
    
    /**
     * Checks if the child exists within the children stack
     *
     * @param {Renderable} child Child to check
     * @returns {boolean}
     * @since 1.0
     */
    RenderableGroup.prototype.hasChild = function(child) {
        return this.children.indexOf(child) !== -1;
    };
    
    /**
     * Removes a child from the stack and pushes a null parent transform
     *
     * @throws {ExistentialError} If the child is not a child of this object
     * @param {Renderable} child Child to remove
     * @returns {RenderableGroup}
     * @since 1.0
     */
    RenderableGroup.prototype.removeChild = function(child) {
        var index = this.children.indexOf(child);
        if (index === -1) {
            throw new Error('ExistentialError: Child does not exist in group');
        }
        
        this.children.splice(index, 1);
        child.setRenderMediator(null);
        child.setParent(null);
        
        return this;
    };
    
    /**
     * Tests the hit to see if it exists within the bounding box of the renderable group content
     * Uses a rectangle test method
     *
     * @param {number} x X Position in World Coordinates
     * @param {number} y Y Position in Wolrd Coordinates
     * @returns {boolean}
     * @since 1.2
     */
    RenderableGroup.prototype.hitTest = function(x, y) {
        vector[0] = x;
        vector[1] = y;
        
        vector = this.toLocalCoordinates(vector, true);
        
        return Geometry.isPointInRect(vector[0], vector[1], this.contentX, this.contentY, this.contentWidth, this.contentHeight);
    };
    
    /**
     * Finds the first child hit target if it exists
     * If it doesn't exist, returns null
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable|null}
     * @since 1.0
     */
    RenderableGroup.prototype.getChildHitTarget = function(x, y) {
        var target = null;
        var children = this.children;
        var length = children.length;
        var i = length - 1;
        for (; i >= 0; i--) {
            if (children[i].isInteractive && children[i].hitTest(x, y)) {
                target = children[i];
                break;
            }
        }
        
        return target;
    };
    
    /**
     * Finds the next child hit target if it exists
     * If it doesn't exist, returns null
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @param {Renderable} sibling Previously found sibling
     * @returns {Renderable|null}
     * @since 1.3
     */
    RenderableGroup.prototype.getNextChildHitTarget = function(x, y, sibling) {
        var target = null;
        var children = this.children;
        var i = children.indexOf(sibling) - 1;
        for (; i >= 0; i--) {
            if (children[i].isInteractive && children[i].hitTest(x, y)) {
                target = children[i];
                break;
            }
        }
        
        return target;
    };
    
    /**
     * Requests the hit target from the subsequent children
     * If the child doesn't exist, returns this
     * Should only be called if the hit target is hit
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable}
     * @since 1.0
     */
    RenderableGroup.prototype.getHitTarget = function(x, y) {
        var target = this;
        var children = this.children;
        var i = children.length - 1;
        for (; i >= 0; i--) {
            if (children[i].isInteractive && children[i].hitTest(x, y)) {
                target = children[i].getHitTarget();
                break;
            }
        }
        
        return target;
    };

    /**
     * Sets the renderable to be dirty and need to update its current spatial logic
     * Pushes a render request to the RenderMediator to inform the scene to render
     * Pushes the setNeedsUpdate call to all children before calling its own
     *
     * @returns {Renderable}
     * @since 1.7.1
     */
    RenderableGroup.prototype.setNeedsUpdate = function() {
        var children = this.children;
        var i = children.length - 1;
        for (; i >= 0; i--) {
            children[i].setNeedsUpdate();
        }

        return this.Renderable_setNeedsUpdate();
    };

    /**
     * If the renderable needs an update
     * It pushes the update request up the branches
     * Then updates its own transform
     *
     * @returns {Renderable}
     * @since 1.7.1
     */
    RenderableGroup.prototype.onPushNeedsUpdate = function() {
        if (this.needsUpdate) {
            this.pushNeedsUpdate();
            this.updateTransform();
        }

        return this;
    };
    
    /**
     * Updates the transform normally and pushes the transform to the child
     * Calculates the width and height of the content based on the rectangular boundaries determined by the children
     *
     * @since 1.0
     */
    RenderableGroup.prototype.updateTransform = function() {
        this.Renderable_updateTransform();
        
        var i = 0;
        var children = this.children;
        var length = children.length;
        var bottom = 0;
        var top = this.unscaledHeight;
        var left = this.unscaledWidth;
        var right = 0;
        var child;
        
        for (; i < length; i++) {
            child = children[i];

            child.parentAlpha = this.calculatedAlpha;

            left = mathMin(child.x, left);
            top = mathMin(child.y, top);
            right = mathMax(child.unscaledWidth + child.x, right);
            bottom = mathMax(child.unscaledHeight + child.y, bottom);
        }
        
        this.contentX = mathMin(0, left);
        this.contentY = mathMin(0, top);
        this.contentWidth = right - this.contentX;
        this.contentHeight = bottom - this.contentY;
    };
    
    /**
     * Renders all the children in the group's render stack
     *
     * @param {CanvasRenderingContext2D} context Context to render to
     * @since 1.0
     */
    RenderableGroup.prototype.render = function(context) {
        if (this.needsUpdate) {
            this.updateTransform();
        }
        
        this.needsRender = false;
        
        var i = 0;
        var children = this.children;
        var length = children.length;
        
        for (; i < length; i++) {
            children[i].render(context);
        }

        this.applyTransform(context);
    };
    
    return RenderableGroup;
});