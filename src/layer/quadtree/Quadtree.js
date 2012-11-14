/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Quadtree Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.0
 */

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
            Math_floor(parentRegion.halfWidth), 
            Math_floor(parentRegion.halfHeight)
        );
        this.northWestNode = new Quadtree(region);
        treeNodes.push(this.northWestNode);
        
        region = new RectRegion(
            parentRegion.centerX, 
            parentRegion.y, 
            Math_ceil(parentRegion.halfWidth), 
            Math_floor(parentRegion.halfHeight)
        );
        this.northEastNode = new Quadtree(region);
        treeNodes.push(this.northEastNode);
        
        region = new RectRegion(
            parentRegion.x, 
            parentRegion.centerY, 
            Math_floor(parentRegion.halfWidth), 
            Math_ceil(parentRegion.halfHeight)
        );
        this.southWestNode = new Quadtree(region);
        treeNodes.push(this.southWestNode);
        
        region = new RectRegion(
            parentRegion.centerX, 
            parentRegion.centerY, 
            Math_ceil(parentRegion.halfWidth), 
            Math_ceil(parentRegion.halfHeight)
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