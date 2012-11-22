define([
    'layer/Scene',
    'layer/RunLoop',
    'layer/quadtree/Quadtree',
    'layer/quadtree/RectRegion',
    'app/QuadtreeRenderable'
], function(
    Scene,
    RunLoop,
    Quadtree,
    RectRegion,
    QuadtreeRenderable
) {
    'use strict';
    
    var WIDTH = 800;
    var HEIGHT = 600;
    
    var Visualization = function(container) {
        if (container !== undefined) {
            this.init(container);
        }
    };
    
    Visualization.prototype.init = function(container) {
        this.scene = new Scene(container, WIDTH, HEIGHT);
        this.loop = new RunLoop();
        
        this.scene.getStage().createAndAppendLayer('quadtree');
        
        this.setupHandlers().createChildren();
        
        this.loop.addCall(this.renderStep, RunLoop.RENDER_CYCLE);
        this.loop.start();
        
        return this;
    };
    
    Visualization.prototype.setupHandlers = function() {
        this.renderStep = this.render.bind(this);
        
        return this;
    };
    
    Visualization.prototype.createChildren = function() {
        var quadtree = new Quadtree(new RectRegion(0, 0, WIDTH, HEIGHT));
        var quadtreeRenderable = new QuadtreeRenderable(quadtree);
        this.scene.addChild(quadtreeRenderable);
        
        return this;
    };
    
    Visualization.prototype.render = function() {
        this.scene.render();
    };
    
    return Visualization;
});