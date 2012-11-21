define([
    'layer/polar/PolarRenderableGroup',
    'layer/Geometry',
    'app/SliceView'
], function(
    PolarRenderableGroup,
    Geometry,
    SliceView
) {
    'use strict';
    
    var NUMBER_OF_SLICES = 18;
    var PI = Math.PI;
    var TWO_PI = PI * 2;
    var HALF_PI = PI * .5;
    
    var PolarAreaGraph = function(x, y, radius) {
        if (x !== undefined && y !== undefined && radius !== undefined) {
            this.init(x, y, radius);
        }
    };
    
    PolarAreaGraph.prototype = new PolarRenderableGroup();
    PolarAreaGraph.prototype.constructor = PolarAreaGraph;
    
    PolarAreaGraph.prototype.PolarRenderableGroup_init = PolarAreaGraph.prototype.init;
    PolarAreaGraph.prototype.PolarRenderableGroup_render = PolarAreaGraph.prototype.render;
    
    PolarAreaGraph.prototype.init = function(x, y, radius) {
        this.PolarRenderableGroup_init(x, y, radius);
        
        this.createChildren();
    };
    
    PolarAreaGraph.prototype.createChildren = function() {
        var i = 0;
        var length = NUMBER_OF_SLICES;
        var slice;
        
        var radialWidth = TWO_PI / length;
        var theta = 0;
        
        //x, y, theta, radialWidth, maxRadius, numberOfSections
        for (; i < length; i++) {
            slice = new SliceView(0, 0, theta, radialWidth, this.radius);
            this.addChild(slice);
            theta = theta + radialWidth;
        }
    };
    
    PolarAreaGraph.prototype.layout = function() {
        return this;
    };
    
    return PolarAreaGraph;
});