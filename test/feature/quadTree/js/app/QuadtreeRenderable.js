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
    
    var LINE_WIDTH = 2;
    var STROKE_COLOR = 'rgba(0, 0, 255, .2)';
    
    var _renderBranch = function(context, quadtree) {
        var region;
        var i = 0;
        var length = QUADTREE_REGIONS.length;
        region = quadtree.region;
        
        context.strokeRect(region.x, region.y, region.width, region.height);
        
        if (quadtree.isLeaf) {
            return;
        }
        
        for (; i < length; i++) {
            _renderBranch(context, quadtree[QUADTREE_REGIONS[i]]);
        }
    };
    
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
        
        context.strokeStyle = STROKE_COLOR;
        context.lineWidth = LINE_WIDTH;
        _renderBranch(context, this.quadtree);
    };
    
    return QuadtreeRenderable;
});