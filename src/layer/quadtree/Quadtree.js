define([
    'layer/quadtree/Region'
], function(
    Region
) {
    "use strict";
    
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
        
        region = new Region(
            parentRegion.x, 
            parentRegion.y, 
            Math.floor(parentRegion.width * .5), 
            Math.floor(parentRegion.height * .5)
        );
        this.northWestNode = new Quadtree(region);
        treeNodes.push(this.northWestNode);
        
        region = new Region(
            parentRegion.centerX, 
            parentRegion.y, 
            Math.ceil(parentRegion.width * .5), 
            Math.floor(parentRegion.height * .5)
        );
        this.northEastNode = new Quadtree(region);
        treeNodes.push(this.northEastNode);
        
        region = new Region(
            parentRegion.x, 
            parentRegion.centerY, 
            Math.floor(parentRegion.width * .5), 
            Math.ceil(parentRegion.height * .5)
        );
        this.southWestNode = new Quadtree(region);
        treeNodes.push(this.southWestNode);
        
        region = new Region(
            parentRegion.centerX, 
            parentRegion.centerY, 
            Math.ceil(parentRegion.width * .5), 
            Math.ceil(parentRegion.height * .5)
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
        if (!this.region.hitTestRegion(region)) {
            return false;
        }
        var leafNodes = this.leafNodes;
        var treeNodes = this.treeNodes;
        var i = 0;
        var length = treeNodes.length;
        
        if (leafNodes.length < MAX_LEAF_NODES) {
            leafNodes.push(region);
            return true;
        }
        
        if (length === 0) {
            this.subdivide();
        }
        
        var hasInserted = false;
        for (; i < length; i++) {
            if (treeNodes[i].insert(region)) {
                hasInserted = true;
            }
        }
        
        return hasInserted;
    };
    
    Quadtree.prototype.queryRegion = function(region) {
        var regionList = [];
        if (this.region.hitTestRegion(region)) {
            return regionList;
        }
        
        var i = 0;
        var length;
        var nodes;
        
        if (this.isLeaf) {
            nodes = this.leafNodes;
            length = nodes.length;
            
            for (; i < length; i++) {
                regionList.push(nodes[i]);
            }
        } else {
            nodes = this.treeNodes;
            length = nodes.length;
            
            for (; i < length; i++) {
                regionList.concat(nodes[i].queryRegion(region));
            }
        }
        
        return regionList;
    };
    
    return Quadtree;
});