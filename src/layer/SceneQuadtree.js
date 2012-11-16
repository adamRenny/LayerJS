define([
    'layer/quadtree/Quadtree',
    'layer/quadtree/Node',
    'layer/quadtree/RectRegion',
    'layer/quadtree/PointRegion'
], function(
    Quadtree,
    Node,
    RectRegion,
    PointRegion
) {
    "use strict";
    
    var queryRegion;
    
    var SceneQuadtree = function(width, height) {
        this.rootTree = null;
        
        if (width !== undefined && height !== undefined) {
            this.init(width, height);
        }
    };
    
    SceneQuadtree.prototype.init = function(width, height) {
        var rectRegion = new RectRegion(0, 0, width, height);
        
        this.rootTree = new Quadtree(rectRegion);
        
        return this;
    };
    
    SceneQuadtree.prototype.insert = function(renderable) {
        var node = new Node(renderable);
        this.rootTree.insert(node);
        
        return this;
    };
    
    SceneQuadtree.prototype.update = function(renderable) {
        
    };
    
    SceneQuadtree.prototype.getHitStack = function(x, y) {
        queryRegion = new PointRegion(x, y);
        return this.rootTree.queryRegion(queryRegion);
    };
    
    return SceneQuadtree;
});