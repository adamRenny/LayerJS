define([
    'assets/RunLoop',
    'layer/Scene',
    'layer/RenderableGroup',
    'app/Rectangle'
], function(
    RunLoop,
    Scene,
    RenderableGroup,
    Rectangle
) {
    'use strict';
    
    var rect;
    var rotation = 0;
    var stepSize = Math.PI / 8000;
    
    var Game = function() {
        this.init();
    };
    
    Game.prototype.init = function() {
        this.loop = new RunLoop();
        
        var layerName = 'main';
        
        var viewport = document.getElementById('js-viewport');
        var scene = this.scene = new Scene(viewport, 800, 600);
        var stage = scene.getStage();
        
        stage.createAndAppendLayer(layerName);
        stage.enableCSSAcceleration();
        
        var firstRect = null;
        var group = window.group = new RenderableGroup(20, 100, 600, 600);
        for (var i = 0; i < 3; i++) {
            rect = new Rectangle(Math.random() * 400, Math.random() * 400, 1 + Math.random() * 199, 1 + Math.random() * 199);
            if (firstRect === null) {
                firstRect = rect;
            }
            
            group.addChild(rect);
        }
        
        scene.addChild(group);
        
        var position = [0, 0];
        position = firstRect.toWorldCoordinates(position);
        
        var newRect = new Rectangle(position[0], position[1], firstRect.width * .5, firstRect.height * .5);
        scene.addChild(newRect);
        
        window.newRect = newRect;
        window.firstRect = firstRect;
        
        window.scene = scene;
        this.setupHandlers();
        
        this.loop.addCall(this.updateCycle, RunLoop.UPDATE_CYCLE);
        this.loop.addCall(this.renderCycle, RunLoop.RENDER_CYCLE);
    };
    
    Game.prototype.setupHandlers = function() {
        this.updateCycle = this.update.bind(this);
        this.renderCycle = this.render.bind(this);
    };
    
    Game.prototype.start = function() {
        this.loop.start();
    };
    
    Game.prototype.stop = function() {
        this.loop.stop();
    };
    
    Game.prototype.update = function(elapsed) {
        rect.rotation = rotation;
        rect.setNeedsUpdate();
        rotation += stepSize * elapsed;
        
        this.scene.update();
    };
    
    Game.prototype.render = function() {
        scene.render();
    };
    
    return Game;
});