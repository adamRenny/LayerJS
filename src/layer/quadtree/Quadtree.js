define([
    'layer/quadtree/RectRegion',
    'layer/set'
], function(
    RectRegion,
    Set
) {
    "use strict";
    
    var Math_floor = Math.floor;
    var Math_ceil = Math.ceil;
    
    var MAX_LEAF_NODES = 4;
    
    var Quadtree = function(region) {
        this.isLeaf = true;
        
        this.northWestNode = null;
        this.northEastNode = null;
        this.southWestNode = null;
        this.southEastNode = null;
        
        this.leafNodes = [];
        this.treeNodes = [];
        
        this.region = region;
    };
    
    Quadtree.prototype.subdivide = function() {
        var region;
        var parentRegion = this.region;
        var leafNodes = this.leafNodes;
        var treeNodes = this.treeNodes;
        var i = 0;
        var length = leafNodes.length;
        
        region = new RectRegion(
            parentRegion.x, 
            parentRegion.y, 
            Math_floor(parentRegion.width * .5), 
            Math_floor(parentRegion.height * .5)
        );
        this.northWestNode = new Quadtree(region);
        treeNodes.push(this.northWestNode);
        
        region = new RectRegion(
            parentRegion.centerX, 
            parentRegion.y, 
            Math_ceil(parentRegion.width * .5), 
            Math_floor(parentRegion.height * .5)
        );
        this.northEastNode = new Quadtree(region);
        treeNodes.push(this.northEastNode);
        
        region = new RectRegion(
            parentRegion.x, 
            parentRegion.centerY, 
            Math_floor(parentRegion.width * .5), 
            Math_ceil(parentRegion.height * .5)
        );
        this.southWestNode = new Quadtree(region);
        treeNodes.push(this.southWestNode);
        
        region = new RectRegion(
            parentRegion.centerX, 
            parentRegion.centerY, 
            Math_ceil(parentRegion.width * .5), 
            Math_ceil(parentRegion.height * .5)
        );
        this.southEastNode = new Quadtree(region);
        treeNodes.push(this.southEastNode);
        
        this.isLeaf = false;
        
        for (; i < length; i++) {
            this.insert(leafNodes[i]);
        }
        
        leafNodes.length = 0;
    };
    
    Quadtree.prototype.insert = function(region) {
        if (!this.region.hitTestRect(region)) {
            return false;
        }
        var leafNodes = this.leafNodes;
        
        var i = 0;
        
        if (leafNodes.length < MAX_LEAF_NODES) {
            leafNodes.push(region);
            return true;
        }
        
        var treeNodes = this.treeNodes;
        var length = treeNodes.length;
        
        if (length === 0) {
            this.subdivide();
            length = treeNodes.length;
        }
        
        var hasInserted = false;
        for (; i < length; i++) {
            var tree = treeNodes[i];
            
            if (treeNodes[i].insert(region)) {
                hasInserted = true;
            }
        }
        
        return hasInserted;
    };
    
    Quadtree.prototype.queryRegion = function(region) {
        var regions = new Set();
        if (!this.region.hitTestRect(region)) {
            return regions;
        }
        
        var i = 0;
        var length;
        var nodes;
        
        if (this.isLeaf) {
            nodes = this.leafNodes;
            length = nodes.length;
            
            for (; i < length; i++) {
                regions.addElement(nodes[i]);
            }
        } else {
            nodes = this.treeNodes;
            length = nodes.length;
            
            for (; i < length; i++) {
                regions.union(nodes[i].queryRegion(region));
            }
        }
        
        return regions;
    };
    
    return Quadtree;
});