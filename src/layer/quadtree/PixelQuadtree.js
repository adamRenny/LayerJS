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
 * PixelQuadtree Module Definition
 * @author Adam Ranfelt <adamRenny@gmail.com>
 * @version 1.0
 */

define([
    'layer/quadtree/ITree',
    'layer/quadtree/RectRegion',
    'layer/set'
], function(
    ITree,
    RectRegion,
    Set
) {
    'use strict';
    
    var Math_floor = Math.floor;
    var Math_ceil = Math.ceil;
    
    var PixelQuadtree = function(region) {
        this.isLeaf = false;
        
        this.leafNodes = [];
        
        this.region = region;
    };
    
    PixelQuadtree.prototype = new ITree();
    PixelQuadtree.prototype.constructor = PixelQuadtree;
    
    PixelQuadtree.prototype.insert = function(node) {
        if (!this.region.hitTestRect(node.region)) {
            return false;
        }
        var leafNodes = this.leafNodes;
        
        leafNodes.push(node);
        return true;
    };
    
    PixelQuadtree.prototype.queryRegion = function(region) {
        var nodeSet = new Set();
        if (!this.region.hitTestRect(region)) {
            return nodeSet;
        }
        
        var i = 0;
        var nodes = this.leafNodes;
        var length = nodes.length;
            
        for (; i < length; i++) {
            nodeSet.addElement(nodes[i]);
        }
        return nodeSet;
    };
    
    return PixelQuadtree;
});