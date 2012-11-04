define(function() {
    "use strict";
    
    var Quadtree = function(region) {
        this.northWestNode = null;
        this.northEastNode = null;
        this.southWestNode = null;
        this.southEastNode = null;
        
        this.leafNodes = [];
        
        this.region = region;
    };
    
    Quadtree.prototype.subdivide = function() {
        
    };
    
    Quadtree.prototype.insert = function() {
        
    };
    
    Quadtree.prototype.queryRegion = function() {
        
    };
    
    return Quadtree;
});