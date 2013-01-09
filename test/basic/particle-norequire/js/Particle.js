(function() {
    'use strict';
    
    var Renderable = layer.Renderable;

    var MAX_SPEED = 200;
    
    var Particle = function(x, y, width, height) {
        if (x !== undefined && y !== undefined
            && width !== undefined && height !== undefined
        ) {
            this.init(x, y, width, height);
        }
    };
    
    Particle.prototype = new Renderable;
    Particle.prototype.constructor = Particle;
    
    Particle.prototype.Renderable_init = Renderable.prototype.init;
    Particle.prototype.Renderable_render = Renderable.prototype.render;
    
    Particle.prototype.init = function(x, y, width, height) {
        this.Renderable_init(x, y, width, height);
        
        this.color = 'rgba(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + (Math.random()) + ')';
        this.vx = ((Math.random() * MAX_SPEED) - (MAX_SPEED * .5)) * .001;
        this.vy = ((Math.random() * MAX_SPEED) - (MAX_SPEED * .5)) * .001;
    };
    
    Particle.prototype.update = function(elapsed) {
        this.x = this.x + this.vx * elapsed;
        this.y = this.y + this.vy * elapsed;
        this.setNeedsUpdate();
    };
    
    Particle.prototype.render = function(context) {
        this.Renderable_render(context);
        
        context.fillStyle = this.color;
        context.fillRect(0, 0, this.unscaledWidth, this.unscaledHeight);
    }
    
    window.Particle = Particle;
}());