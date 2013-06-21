define([
    'layer/RenderableGroup',
    'layer/Geometry',
    'app/SliceView'
], function(
    RenderableGroup,
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
    
    PolarAreaGraph.prototype = new RenderableGroup();
    PolarAreaGraph.prototype.constructor = PolarAreaGraph;
    
    PolarAreaGraph.prototype.RenderableGroup_init = RenderableGroup.prototype.init;
    
    PolarAreaGraph.prototype.init = function(x, y, radius) {
        this.RenderableGroup_init(x, y, radius, radius);
        
        this.radius = radius;

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
            slice = new SliceView(theta, radialWidth, this.radius);
            this.addChild(slice);
            theta = theta + radialWidth;
        }
    };
    
    PolarAreaGraph.prototype.layout = function() {
        return this;
    };

    PolarAreaGraph.prototype.hitTest = function(x, y) {
        var vector = this.toLocalCoordinates([x, y]);
        var polarVector = Geometry.convertCartesianToPolar(vector[0], vector[1]);

        return polarVector[0] <= this.radius;
    }
    
    return PolarAreaGraph;
});