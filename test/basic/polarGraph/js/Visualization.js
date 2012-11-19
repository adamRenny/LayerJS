define([
    'layer/RunLoop',
    'layer/Scene',
    'app/PolarGraphComponent'
], function(
    RunLoop,
    Scene,
    PolarGraphComponent
) {
    'use strict';
    
    var WIDTH = 800;
    var HEIGHT = 600;
    var NUMBER_OF_LAYERS = 2;
    
    var Visualization = function(wrapper) {
        if (wrapper !== undefined) {
            this.init(wrapper);
        }
    };
    
    Visualization.prototype.init = function(wrapper) {
        this.loop = new RunLoop();
        
        this.scene = new Scene(wrapper, WIDTH, HEIGHT);
        
        this.polarGraphComponent = new PolarGraphComponent(WIDTH * .5, HEIGHT * .5, HEIGHT * .5);
        this.scene.addChild(this.polarGraphComponent);
        
        this.setupHandlers();
        
        this.loop.addCall(this.updateCycle, RunLoop.UPDATE_CYCLE);
        this.loop.addCall(this.renderCycle, RunLoop.RENDER_CYCLE);
        
        return this;
    };
    
    Visualization.prototype.start = function() {
        this.loop.start();
    };
    
    Visualization.prototype.stop = function() {
        this.loop.stop();
    };
    
    Visualization.prototype.setupHandlers = function() {
        this.updateCycle = this.update.bind(this);
        this.renderCycle = this.render.bind(this);
        
        return this;
    };
    
    Visualization.prototype.update = function(elapsed) {
        
    };
    
    Visualization.prototype.render = function() {
        this.scene.render();
    };
    
    return Visualization;
});