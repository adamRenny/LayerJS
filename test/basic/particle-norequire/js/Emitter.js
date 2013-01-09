(function(Particle) {
    'use strict';
    
    var RenderableGroup = layer.RenderableGroup;

    var NUMBER_OF_PARTICLES = 1300;
    
    var Emitter = function(width, height) {
        if (width !== undefined && height !== undefined) {
            this.init(width, height);
        }
    };
    
    Emitter.prototype = new RenderableGroup;
    Emitter.prototype.constructor = Emitter;
    
    Emitter.prototype.RenderableGroup_init = RenderableGroup.prototype.init;
    
    Emitter.prototype.init = function(width, height) {
        this.RenderableGroup_init(0, 0, width, height);
        
        this.lastEmit = Date.now();
        this.maxNumberOfParticles = NUMBER_OF_PARTICLES;
        
        for (var i = 0; i < NUMBER_OF_PARTICLES; i++) {
            this.emit();
        }
    };
    
    Emitter.prototype.emit = function() {
        var particle = new Particle(Math.random() * this.unscaledWidth, Math.random() * this.unscaledHeight, 20, 20);
        this.appendChild(particle);
    };
    
    Emitter.prototype.update = function(elapsed) {
        var particle;
        var needsUpdate = false;
        for (var i = 0; i < NUMBER_OF_PARTICLES; i++) {
            particle = this.children[i];
            particle.update(elapsed);
            needsUpdate = false;
            if (particle.x > this.unscaledWidth) {
                particle.x = -particle.unscaledWidth;
                needsUpdate = true;
            }
            
            if (particle.y > this.unscaledHeight) {
                particle.y = -particle.unscaledHeight;
                needsUpdate = true;
            }
            
            if (particle.y < -particle.unscaledHeight) {
                particle.y = this.unscaledHeight;
                needsUpdate = true;
            }
            
            if (particle.x < -particle.unscaledWidth) {
                particle.x = this.unscaledWidth;
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                particle.setNeedsUpdate();
            }
        }
    };
    
    window.Emitter = Emitter;
}(window.Particle));