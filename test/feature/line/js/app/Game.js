define([
    'layer/RunLoop',
    'layer/Scene',
    'app/ColorLine'
], function(
    RunLoop,
    Scene,
    ColorLine
) {
    'use strict';

    var MAX_ELAPSED = 2000;
    
    var Game = function() {
        this.init();
    };
    
    Game.prototype.init = function() {
        this.loop = new RunLoop();
        
        var layerName = 'main';
        
        var viewport = document.getElementById('js-viewport');
        var scene = this.scene = new Scene(viewport, 800, 600);
        var stage = scene.getStage();

        this.shouldGrow = true;
        
        stage.createAndAppendLayer(layerName);
        stage.enableCSSAcceleration();
        
        var line = new ColorLine(0, 23, 45, 65);
        this.line = line;
        console.log(line);
        scene.addChildToLayerByName(line, layerName);
        this.elapsed = 0;
        
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
        this.scene.update();

        if (this.shouldGrow) {
            this.elapsed += elapsed;
        } else {
            this.elapsed -= elapsed;
        }

        if (this.elapsed >= MAX_ELAPSED) {
            this.elapsed = MAX_ELAPSED;
            this.shouldGrow = false;
        } else if (this.elapsed <= 0) {
            this.elapsed = 0;
            this.shouldGrow = true;
        }

        var t = this.elapsed / MAX_ELAPSED;

        this.line.subline(t);
    };
    
    Game.prototype.render = function() {
        scene.render();
    };
    
    return Game;
});