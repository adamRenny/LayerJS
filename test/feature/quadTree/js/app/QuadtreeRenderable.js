define([
    'layer/Renderable'
], function(
    Renderable
) {
    'use strict';
    
    var QUADTREE_REGIONS = [
        'northWestNode',
        'northEastNode',
        'southWestNode',
        'southEastNode'
    ];
    
    var QuadtreeRenderable = function(quadtree) {
        if (quadtree !== undefined) {
            this.init(quadtree);
        }
    };
    
    QuadtreeRenderable.prototype = new Renderable();
    QuadtreeRenderable.prototype.constructor = QuadtreeRenderable;
    
    QuadtreeRenderable.prototype.Renderable_init = Renderable.prototype.init;
    QuadtreeRenderable.prototype.Renderable_render = Renderable.prototype.render;
    
    QuadtreeRenderable.prototype.init = function(quadtree) {
        this.quadtree = quadtree;
    };
    
    QuadtreeRenderable.prototype.render = function(context) {
        this.Renderable_render(context);
        
        var region;
        region = this.quadtree.region;
        context.strokeStyle = 'red';
        context.lineWidth = 4;
        
        context.strokeRect(region.x, region.y, region.width, region.height);
    };
    
    return QuadtreeRenderable;
});