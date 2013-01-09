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
 * @author Adam Ranfelt
 * @version 1.7
 */
define([
    'layer/Stage',
    'layer/Input',
    'layer/HitEvent',
    'layer/RenderMediator',
    'layer/EventBus'
], function(
    Stage,
    Input,
    HitEvent,
    RenderMediator,
    EventBus
) {
    'use strict';

    /**
     * Scene.container css position attribute
     *
     * @type {String}
     * @static
     */
    var CONTAINER_POSITION = 'relative';
    
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
        if (container !== undefined && width !== undefined && height !== undefined) {
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
        /**
         * Stage for the scene to be contained within
         *
         * @default null
         * @name Scene#stage
         * @type {Stage}
         * @since 1.0
         */
        this.stage = null;
        
        /**
         * Container object for the scene to be contained within
         * Container may have canvas elements within it
         * Container will be used as the viewport for the stage
         *
         * @name Scene#container
         * @type {HTMLElement}
         * @since 1.3.1
         */
        this.container = container;
        
        /**
         * Scene Input controller to listen from the container
         *
         * @name Scene#input
         * @type {Input}
         * @since 1.0
         */
        this.input = new Input(container);

        /**
         * Scene Input controller namespace to associate directly with the scene
         *
         * @name Scene#sceneNamespace
         * @type {string}
         * @since 1.5
         */
        this.sceneNamespace = this.input.getNamespace();

        this.setupStage(container, width, height);
        
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
        
        /**
         * Flag to determine whether the layer system should find all elements
         * If this is disabled, it only finds the path to the top-most element
         *
         * @name Scene#shouldFindAllRenderables
         * @type {boolean}
         * @since 1.4
         */
        this.shouldFindAllRenderables = false;
        
        /**
         * Flag for whether the scene is enabled or not
         * If the scene is enabled, it will listen to the input
         *
         * @name Scene#isEnabled
         * @type {boolean}
         * @since 1.4
         */
        this.isEnabled = false;

        RenderMediator.setNeedsRender(this.sceneNamespace);
        
        return this.setupHandlers().layout().enable();
    };

    /**
     * Apply css properties to container
     *
     * @return {Scene}
     * @since 1.7
     */
    Scene.prototype.layout = function() {
        this.container.style.position = CONTAINER_POSITION;

        return this;
    };

    /**
     * Create new stage for the scene to be contained within
     *
     * @param {HTMLElement} container Container object where the canvases are contained
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @returns {Scene}
     * @since 1.3
     */
    Scene.prototype.setupStage = function(container, width, height) {
        this.stage = new Stage(container, width, height, this.sceneNamespace);

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
        this.onInputDisableHandler = this.onInputDisable.bind(this);

        return this;
    };
    
    /**
     * Enables interactivity
     *
     * @returns {Scene}
     * @since 1.4
     */
    Scene.prototype.enable = function() {
        if (this.isEnabled) {
            return this;
        }
        
        this.isEnabled = true;
        
        var sceneNamespace = this.sceneNamespace;
        
        EventBus.on(Input.MOUSE_MOVE + sceneNamespace, this.onMoveHandler);
        EventBus.on(Input.MOUSE_UP + sceneNamespace, this.onUpHandler);
        EventBus.on(Input.MOUSE_DOWN + sceneNamespace, this.onDownHandler);
        EventBus.on(Input.CLICK + sceneNamespace, this.onClickHandler);
        EventBus.on(Input.DISABLE + sceneNamespace, this.onInputDisableHandler);

        return this;
    };
    
    /**
     * Disables interactivity
     *
     * @returns {Scene}
     * @since 1.4
     */
    Scene.prototype.disable = function() {
        if (!this.isEnabled) {
            return this;
        }
        
        this.isEnabled = false;
        
        var sceneNamespace = this.sceneNamespace;
        
        EventBus.off(Input.MOUSE_MOVE + sceneNamespace, this.onMoveHandler);
        EventBus.off(Input.MOUSE_UP + sceneNamespace, this.onUpHandler);
        EventBus.off(Input.MOUSE_DOWN + sceneNamespace, this.onDownHandler);
        EventBus.off(Input.CLICK + sceneNamespace, this.onClickHandler);
        EventBus.off(Input.DISABLE + sceneNamespace, this.onInputDisableHandler);

        return this;
    };
    
    /**
     * Adds a child to the layer at index 0 if no target is defined
     * Otherwise the target will be parsed by number or string to pipe to the proper method
     *
     * @param {Renderable} child Child to add
     * @param {string|number|null} target Optional target element key to add the child to
     * @returns {Scene}
     * @since 1.1
     */
    Scene.prototype.addChild = function(child, target) {
        if (target === undefined) {
            return this.addChildToLayerByIndex(child, 0);
        } else if (typeof target === 'number') {
            return this.addChildToLayerByIndex(child, target);
        } else if (typeof target === 'string') {
            return this.addChildToLayerByName(child, name);
        }
        
        return this;
    };
    
    /**
     * Removes a child from the layer at index 0 if no target is defined
     * Otherwise, the target will be parsed by number or string to pipe to the proper method
     *
     * @param {Renderable} child Child to remove
     * @param {string|number|null} target Optional target element key to add the child to
     * @returns {Scene}
     * @since 1.1
     */
    Scene.prototype.removeChild = function(child, target) {
        if (target === undefined) {
            return this.removeChildFromLayerByIndex(child, 0);
        } else if (typeof target === 'number') {
            return this.removeChildFromLayerByIndex(child, target);
        } else if (typeof target === 'string') {
            return this.removeChildFromLayerByName(child, name);
        }
        
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
     * Performs a depth first search to find the scene graph elements in order
     * If the scene has shouldFindAllRenderables enabled, it performs a full-graph DFS
     * Prunes naturally if a branch is not interactive or fails a hit test
     *
     * Generates a hit stack array object from a renderable source and point
     * The stack is in ordered by the origin at 0 to the front-most hit area at the end
     * TODO: Update hit stack to only gather methods that have the proper hit callback methods implemented
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable[]}
     * @since 1.1
     */
    Scene.prototype.getHitStack = function(x, y) {
        var hitStack = [];
        var target = null;
        var self = this;
        
        // Follows the layer order - untested against a large layer set
        this.stage.forEachLayer(function(layer) {
            target = layer.getRoot();
            
            self.getDepthFirstHitStack(x, y, hitStack, target, 0);
        });
        
        return hitStack;
    };
    
    /**
     * Generates a stack of renderables through a depth first search
     * If it no target exists, returns an empty stack
     *
     * Generates a hit stack array object from a renderable source and point
     * The stack is in ordered by the origin at 0 to the front-most hit area at the end
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @param {Renderable[]} stack Hit stack
     * @param {Renderable} parent Parent renderable to perform search from
     * @param {number} insertIndex Index in the stack to insert discovered elements
     * @returns {Renderable[]}
     * @since 1.4
     */
    Scene.prototype.getDepthFirstHitStack = function(x, y, stack, parent, insertIndex) {
        var child = parent.getChildHitTarget(x, y);
        while (child !== null) {
            stack.splice(insertIndex, 0, child);
            // If the child is a leaf node and the scene has the full stack enabled
            if (!child.isLeafNode) {
                this.getDepthFirstHitStack(x, y, stack, child, insertIndex + 1);
            }
            
            if (this.shouldFindAllRenderables) {
                child = parent.getNextChildHitTarget(x, y, child);
            } else {
                child = null;
            }
        }
    };
    
    /**
     * Gathers the bottommost hit target to use
     * If it no target exists, returns null
     *
     * Target is gathered from all the layers
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable[]|null}
     * @since 1.1
     */
    Scene.prototype.getHitTarget = function(x, y) {
        var targetList = [];
        var target = null;
        
        this.stage.forEachLayer(function(layer) {
            target = layer.getRoot().getHitTarget(x, y);
            
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
     * @param {Renderable[]} hitStack Stack of hit targets
     * @param {number} x X Hit position
     * @param {number} y Y Hit position
     * @returns {Scene}
     * @since 1.1
     */
    Scene.prototype.updateActiveTarget = function(hitStack, x, y) {
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
     * Trigger onOut with active target when input is disabled
     *
     * @param {String} type
     * @param {Mouse} mouse
     * @since 1.5
     */
    Scene.prototype.onInputDisable = function(type, mouse) {
        if (this.activeTarget !== null) {
            this.onOut(this.activeTarget, mouse.x, mouse.y);
        }

        this.activeTarget = null;
    };
    
    /**
     * onMove Handler
     * Creates a HitEvent when a mousemove event is triggered
     *
     * @param {string} type Event type
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onMove = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        this.updateActiveTarget(hitStack, mouse.x, mouse.y);

        this.activeMouse = mouse;

        if (hitStack.length > 0) {
            var event = new HitEvent(HitEvent.MOUSE_MOVE, mouse.x, mouse.y, hitStack, true);
        }
    };
    
    /**
     * onUp Handler
     * Creates a HitEvent when a mouseup event is triggered
     *
     * @param {string} type Event type
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onUp = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        if (hitStack.length > 0) {
            var event = new HitEvent(HitEvent.MOUSE_UP, mouse.x, mouse.y, hitStack, true);
        }
    };
    
    /**
     * onDown Handler
     * Creates a HitEvent when a mousedown event is triggered
     *
     * @param {string} type Event type
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onDown = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        if (hitStack.length > 0) {
            var event = new HitEvent(HitEvent.MOUSE_DOWN, mouse.x, mouse.y, hitStack, true);
        }
    };
    
    /**
     * onClick Handler
     * Creates a HitEvent when a click event is triggered
     *
     * @param {string} type Event type
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onClick = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        if (hitStack.length > 0) {
            var event = new HitEvent(HitEvent.CLICK, mouse.x, mouse.y, hitStack, true);
        }
    };
    
    /**
     * onOver Handler
     * Creates a HitEvent when a mouseover event is triggered
     *
     * @param {Renderable} target Mouse state
     * @param {number} x X mouse position
     * @param {number} y Y mouse position
     * @since 1.1
     */
    Scene.prototype.onOver = function(target, x, y) {
        var event = new HitEvent(HitEvent.MOUSE_OVER, x, y, target, false);
    };
    
    /**
     * onOut Handler
     * Creates a HitEvent when a mouseout event is triggered
     *
     * @param {Renderable} target Mouse state
     * @param {number} x X mouse position
     * @param {number} y Y mouse position
     * @since 1.1
     */
    Scene.prototype.onOut = function(target, x, y) {
        var event = new HitEvent(HitEvent.MOUSE_OUT, x, y, target, false);
    };
    
    /**
     * Updates the scene input elements
     * Tells the active target to update in case something has moved
     * If disabled, the loop does not fully process
     *
     * @since 1.1
     */
    Scene.prototype.update = function() {
        if (!this.isEnabled) {
            return;
        }
        
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
        if (RenderMediator.getNeedsRender(this.sceneNamespace)) {
            this.stage.forEachLayer(_renderLayer);
        }
    };

    return Scene;
});