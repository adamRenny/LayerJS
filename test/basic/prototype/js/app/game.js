define([
    'layer/looper',
    'layer/scene',
    'layer/renderable-group',
    'app/rectangle'
], function(
    Looper,
    Scene,
    RenderableGroup,
    Rectangle
) {
    "use strict";
    
    var rect;
    var rotation = 0;
    var stepSize = Math.PI / 8000;
    
    var Game = function() {
        this.init();
    };
    
    Game.prototype = new Looper;
    Game.prototype.constructor = Game;
    Game.prototype.Looper_init = Looper.prototype.init;
    
    Game.prototype.init = function() {
        this.Looper_init();
        
        var layerNames = [
            'background',
            'player',
            'ui'
        ];
        
        var viewport = document.getElementById('js-viewport');
        var scene = this.scene = new Scene(viewport, 800, 600);
        var stage = scene.getStage();
        
        for (var i = 0; i < layerNames.length; i++) {
            stage.createAndAppendLayer(layerNames[i]);
        }
        
        stage.enableCSSAcceleration();
        
        var group = window.group = new RenderableGroup(20, 100);
        for (var i = 0; i < 3; i++) {
            rect = new Rectangle(Math.random() * 400, Math.random() * 400, Math.random() * 200, Math.random() * 200);
        // rect = new Rectangle(0, 0, 200, 100);
        //         rect.scaleX = 2;
        //         rect.scaleY = 2;
        //         rect.setCenterPoint(.25, .6);
        //         rect.setNeedsUpdate();
        
        // rect.setRotation(Math.PI / 2);
            group.addChild(rect);
        }
        
        scene.addChild(group);
        // scene.addChild(rect);
        window.scene = this.scene;
    };
    
    Game.prototype.update = function(elapsed) {
        rect.setRotation(rotation);
        rotation += stepSize * elapsed;
        
        this.scene.update();
    };
    
    Game.prototype.render = function() {
        scene.render();
    };
    
    return Game;
});