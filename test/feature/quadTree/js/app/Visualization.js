define([
    'layer/Scene',
    'layer/RunLoop',
    'layer/quadtree/Quadtree',
    'layer/quadtree/RectRegion',
    'layer/quadtree/Node',
    'app/QuadtreeRenderable',
    'app/Block'
], function(
    Scene,
    RunLoop,
    Quadtree,
    RectRegion,
    Node,
    QuadtreeRenderable,
    Block
) {
    'use strict';
    
    var WIDTH = 800;
    var HEIGHT = 600;
    
    var NUMBER_OF_BLOCKS = 5;
    var BLOCK_SIZE = 20;
    
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
        
        var block;
        var node;
        var i = 0;
        var x;
        var y;
        
        this.scene.addChild(quadtreeRenderable);
        
        for (; i < NUMBER_OF_BLOCKS; i++) {
            x = Math.random() * (WIDTH - BLOCK_SIZE);
            y = Math.random() * (HEIGHT - BLOCK_SIZE);
            
            x = 0;
            y = 0;
            
            block = new Block(x, y, BLOCK_SIZE, BLOCK_SIZE);
            node = new Node(block);
            quadtree.insert(node);
            this.scene.addChild(block);
        }
        
        return this;
    };
    
    Visualization.prototype.render = function() {
        this.scene.render();
    };
    
    return Visualization;
});