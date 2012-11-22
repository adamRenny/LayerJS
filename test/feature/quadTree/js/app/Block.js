define([
    'layer/Renderable'
], function(
    Renderable
) {
    'use strict';
    
    var Block = function(x, y, width, height) {
        if (x !== undefined && y !== undefined && width !== undefined && height !== undefined) {
            this.init(x, y, width, height);
        }
    };
    
    Block.prototype = new Renderable();
    Block.prototype.constructor = Block;
    
    Block.prototype.Renderable_init = Renderable.prototype.init;
    Block.prototype.Renderable_render = Renderable.prototype.render;
    
    Block.prototype.init = function(x, y, width, height) {
        this.Renderable_init(x, y, width, height);
        
        this.color = 'rgba(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + (Math.random() * .5 + .5) + ')';
    };
    
    Block.prototype.render = function(context) {
        this.Renderable_render(context);
        
        context.fillStyle = this.color;
        context.fillRect(0, 0, this.width, this.height);
    };
    
    return Block;
})