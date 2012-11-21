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
 * Scene Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.2
 */
define([
    'layer/Stage',
    'layer/Input',
    'layer/HitEvent',
    'layer/Events'
], function(
    Stage,
    Input,
    HitEvent,
    Events
) {
    'use strict';
    
    /**
     * Render Layer
     * Renders the layer called during an iteration on the Stage object
     *
     * @param {Layer} layer Layer to render with
     * @since 1.1
     */
    var _renderLayer = function(layer) {
        layer.render();
    };
    
    /**
     * Scene Constructor
     *
     * Effectively acts as Facade of the interactive engine
     * Scene to coordinate all components of a display
     * Facade pattern to encapsulate the stage, layers, and hit detection
     *
     * @name Scene
     * @class Scene container object for layered canvas
     * @constructor
     *
     * @param {HTMLElement} container Container object where the canvases are contained
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @since 1.0
     */
    var Scene = function(container, width, height) {
        if (container && width && height) {
            this.init(container, width, height);
        }
    };
    
    /**
     * Initializes the Scene with the container
     * Sets up a stage and all necessary layers
     *
     * @param {HTMLElement} container Container object where the canvases are contained
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @returns {Scene}
     * @since 1.0
     */
    Scene.prototype.init = function(container, width, height) {

        this.setupStage(container, width, height);
        
        /**
         * Scene Input controller to listen from the container
         *
         * @name Scene#input
         * @type {Input}
         * @since 1.0
         */
        this.input = new Input(container);
        
        /**
         * Currently active input target
         * Used to determine which element is currently active and hovered within the scene
         *
         * @name Scene#activeTarget
         * @type {Renderable}
         * @since 1.1
         */
        this.activeTarget = null;
        
        /**
         * Last used mouse object
         * Should be considered immutable and opaque
         *
         * @private
         * @name Scene#activeMouse
         * @type {Mouse}
         * @since 1.1
         */
        this.activeMouse = null;
        
        this.setupHandlers();
        
        Events
            .on(Input.MOUSE_MOVE, this.onMoveHandler)
            .on(Input.MOUSE_UP, this.onUpHandler)
            .on(Input.MOUSE_DOWN, this.onDownHandler)
            .on(Input.CLICK, this.onClickHandler);
    };

    /**
     * Create new stage for the scene to be contained within
     *
     * @param {HTMLElement} container Container object where the canvases are contained
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @returns {Scene}
     */
    Scene.prototype.setupStage = function(container, width, height) {
        /**
         * Stage for the scene to be contained within
         *
         * @name Scene#stage
         * @type {Stage}
         * @since 1.0
         */
        this.stage = new Stage(container, width, height);

        return this;
    };
    
    /**
     * Binds all handler functions to local bound handler functions
     *
     * @returns {Scene}
     * @since 1.0
     */
    Scene.prototype.setupHandlers = function() {
        this.onMoveHandler = this.onMove.bind(this);
        this.onUpHandler = this.onUp.bind(this);
        this.onDownHandler = this.onDown.bind(this);
        this.onClickHandler = this.onClick.bind(this);
        
        return this;
    };
    
    /**
     * Adds a child to the top layer
     *
     * @param {Renderable} child Child to add
     * @returns {Scene}
     * @since 1.1
     */
    Scene.prototype.addChild = function(child) {
        var layer = this.stage.getLayerByIndex(0);
        layer.root.addChild(child);
        
        return this;
    };
    
    /**
     * Removes a child from the top layer
     *
     * @param {Renderable} child Child to remove
     * @returns {Scene}
     * @since 1.1
     */
    Scene.prototype.removeChild = function(child) {
        var layer = this.stage.getLayerByIndex(0);
        layer.root.removeChild(child);
        
        return this;
    };
    
    /**
     * Adds a child to the layer at the index specified
     *
     * @param {Renderable} child Child to add
     * @param {number} layerIndex Index of the layer to add to
     * @returns {Scene}
     * @since 1.2
     */
    Scene.prototype.addChildToLayerByIndex = function(child, layerIndex) {
        var layer = this.stage.getLayerByIndex(layerIndex);
        layer.root.addChild(child);
        
        return this;
    };
    
    /**
     * Removes a child to the layer from the index specified
     *
     * @param {Renderable} child Child to remove
     * @param {number} layerIndex Index of the layer to add to
     * @returns {Scene}
     * @since 1.2
     */
    Scene.prototype.removeChildFromLayerByIndex = function(child, layerIndex) {
        var layer = this.stage.getLayerByIndex(layerIndex);
        layer.root.removeChild(child);
        
        return this;
    };
    
    /**
     * Adds a child to the layer at the name specified
     *
     * @param {Renderable} child Child to add
     * @param {number} layerName Name of the layer to add to
     * @returns {Scene}
     * @since 1.3
     */
    Scene.prototype.addChildToLayerByName = function(child, layerName) {
        var layer = this.stage.getLayerByName(layerName);
        layer.root.addChild(child);
        
        return this;
    };
    
    /**
     * Removes a child to the layer from the name specified
     *
     * @param {Renderable} child Child to remove
     * @param {string} layerName Name of the layer to add to
     * @returns {Scene}
     * @since 1.3
     */
    Scene.prototype.removeChildFromLayerByName = function(child, layerName) {
        var layer = this.stage.getLayerByName(layerName);
        layer.root.removeChild(child);
        
        return this;
    };

    /**
     * Generates a stack of renderables
     * If it no target exists, returns an empty stack
     *
     * Generates a hit stack array object from a renderable source and point
     * The stack is in ordered by the origin at 0 to the front-most hit area at the end
     * TODO: Resolve issues with stack order - currently adding items to the stack in a reverse order
     * TODO: Update hit stack to only gather methods that have the proper hit callback methods implemented
     * TODO: Support touch events
     * TODO: Support custom hit event callbacks
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Array}
     * @since 1.1
     */
    Scene.prototype.getHitStack = function(x, y) {
        var hitStack = [];
        var target = null;
        // var stackCache = [];
        this.stage.forEachLayer(function(layer) {
            target = layer.root.getChildHitTarget(x, y);
            
            // Collect the targets in the order they are encountered
            while (target !== null) {
                hitStack.push(target);
                target = target.getChildHitTarget(x, y);
            }
        });
        
        return hitStack;
    };
    
    /**
     * Gathers the bottommost hit target to use
     * If it no target exists, returns null
     *
     * Target is gathered from all the layers
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Array|null}
     * @since 1.1
     */
    Scene.prototype.getHitTarget = function(x, y) {
        var targetList = [];
        var target = null;
        
        this.stage.forEachLayer(function(layer) {
            target = layer.root.getHitTarget(x, y);
            
            if (target) {
                targetList.push(target);
            }
        });
        
        target = targetList.shift();
        return target || null;
    };
    
    /**
     * Updates the active target based on the passed positioning
     * Active target updates include out/over logic to update which element is currently hovered
     *
     * @param {Array} hitStack Stack of hit targets
     * @param {number} x X Hit position
     * @param {number} y Y Hit position
     * @returns {Scene}
     * @since 1.1
     */
    Scene.prototype.updateActiveTarget = function(hitStack, x, y) {
        var hitStack = this.getHitStack(x, y);
        
        var topHitTarget = null;
        if (hitStack.length) {
            topHitTarget = hitStack[hitStack.length - 1 || 0];
        }
        
        if (this.activeTarget !== topHitTarget) {
            
            if (this.activeTarget !== null) {
                this.onOut(this.activeTarget, x, y);
            }
            
            if (topHitTarget !== null) {
                this.onOver(topHitTarget, x, y);
            }
            
            this.activeTarget = topHitTarget;
        }
        
        return this;
    };
    
    /**
     * Gets the Stage
     *
     * @returns {Stage}
     * @since 1.1
     */
    Scene.prototype.getStage = function() {
        return this.stage;
    };
    
    /**
     * onMove Handler
     * Creates a HitEvent when a mousemove event is triggered
     *
     * @param {string} type Event name
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onMove = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        this.updateActiveTarget(hitStack, mouse.x, mouse.y);
        
        this.activeMouse = mouse;
        
        var event = new HitEvent(HitEvent.MOUSE_MOVE, mouse.x, mouse.y, hitStack, true);
    };
    
    /**
     * onUp Handler
     * Creates a HitEvent when a mouseup event is triggered
     *
     * @param {string} type Event name
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onUp = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        var event = new HitEvent(HitEvent.MOUSE_UP, mouse.x, mouse.y, hitStack, true);
    };
    
    /**
     * onDown Handler
     * Creates a HitEvent when a mousedown event is triggered
     *
     * @param {string} type Event name
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onDown = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        var event = new HitEvent(HitEvent.MOUSE_DOWN, mouse.x, mouse.y, hitStack, true);
    };
    
    /**
     * onClick Handler
     * Creates a HitEvent when a click event is triggered
     *
     * @param {string} type Event name
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onClick = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        var event = new HitEvent(HitEvent.CLICK, mouse.x, mouse.y, hitStack, true);
    };
    
    /**
     * onOver Handler
     * Creates a HitEvent when a mouseover event is triggered
     *
     * @param {*} target Target object currently over
     * @param {number} x X position of mouse
     * @param {number} y Y position of mouse
     * @since 1.1
     */
    Scene.prototype.onOver = function(target, x, y) {
        console.log(target);
        var event = new HitEvent(HitEvent.MOUSE_OVER, x, y, target, false);
    };
    
    /**
     * onOut Handler
     * Creates a HitEvent when a mouseout event is triggered
     *
     * @param {*} target Target object no longer over
     * @param {number} x X position of mouse
     * @param {number} y Y position of mouse
     * @since 1.1
     */
    Scene.prototype.onOut = function(target, x, y) {
        var event = new HitEvent(HitEvent.MOUSE_OUT, x, y, target, false);
    };
    
    /**
     * Updates the scene input elements
     * Tells the active target to update in case something has moved
     * TODO: Update the hit stack logic to remove so much computational complexity
     *
     * @since 1.1
     */
    Scene.prototype.update = function() {
        var activeMouse = this.activeMouse;
        if (activeMouse === null) {
            return;
        }
        
        var hitStack = this.getHitStack(activeMouse.x, activeMouse.y);
        this.updateActiveTarget(hitStack, activeMouse.x, activeMouse.y);
    };
    
    /**
     * Renders all the children in the stage's layer stack
     *
     * @since 1.0
     */
    Scene.prototype.render = function() {
        this.stage.forEachLayer(_renderLayer);
    };

    return Scene;
});