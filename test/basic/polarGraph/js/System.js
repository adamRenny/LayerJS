define([
    'layer/Looper',
    'Emitter',
    'layer/Scene'
], function(
    Looper,
    Emitter,
    Scene
) {
    'use strict';
    
    var WIDTH = 800;
    var HEIGHT = 600;
    var NUMBER_OF_LAYERS = 2;
    
    var System = function(wrapper) {
        if (wrapper !== undefined) {
            this.init(wrapper);
        }
    };
    
    System.prototype = new Looper;
    System.prototype.constructor = System;
    
    System.prototype.Looper_init = Looper.prototype.init;
    
    System.prototype.init = function(wrapper) {
        this.Looper_init();
        
        this.scene = new Scene(wrapper, WIDTH, HEIGHT);
        
        this.emitters = [];
        var emitter;
        
        for (var i = 0; i < NUMBER_OF_LAYERS; i++) {
            emitter = new Emitter(WIDTH, HEIGHT);
            this.emitters.push(emitter);
            this.scene.addChildToLayerByIndex(emitter, i);
        }
    };
    
    System.prototype.update = function(elapsed) {
        for (var i = 0; i < NUMBER_OF_LAYERS; i++) {
            this.emitters[i].update(elapsed);
        }
    };
    
    System.prototype.render = function() {
        this.scene.render();
    };
    
    return System;
});