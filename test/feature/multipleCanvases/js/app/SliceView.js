define([
    'layer/polar/PolarRenderable',
    'layer/Geometry'
], function(
    PolarRenderable,
    Geometry
) {
    'use strict';
    
    var SliceView = function(x, y, theta, radialWidth, maxRadius) {
        if (x !== undefined && y !== undefined && theta !== undefined
            && radialWidth !== undefined && maxRadius !== undefined
        ) {
            this.init(x, y, theta, radialWidth, maxRadius);
        }
    };
    
    SliceView.prototype = new PolarRenderable();
    SliceView.prototype.constructor = SliceView;
    
    SliceView.prototype.PolarRenderable_init = PolarRenderable.prototype.init;
    SliceView.prototype.PolarRenderable_render = PolarRenderable.prototype.render;
    
    SliceView.prototype.init = function(x, y, theta, radialWidth, maxRadius) {
        this.PolarRenderable_init(x, y, maxRadius, maxRadius);
        
        this.startTheta = theta;
        this.radialWidth = radialWidth;
        this.endTheta = theta + radialWidth;
        this.maxRadius = maxRadius;
        this.currentRadius = 0;
        
        var color = Math.round(Math.random() * 255);
        this.color = 'hsl(' + color + ', 100%, 45%)';
        this.bgColor = 'hsl(' + color + ', 100%, 90%)';
    };
    
    SliceView.prototype.hitTest = function(x, y) {
        var polarVector = this.convertWorldToPolar(x, y);
        
        return Geometry.isPolarPointInPolarArea(polarVector[0], polarVector[1], this.maxRadius, this.startTheta, this.endTheta);
    };
    
    SliceView.prototype.onMouseMove = function(mouse) {
        var polarVector = this.convertWorldToPolar(mouse.x, mouse.y);
        
        this.currentRadius = polarVector[0];
    };
    
    SliceView.prototype.render = function(context) {
        this.PolarRenderable_render(context);
        
        context.fillStyle = this.bgColor;
        context.beginPath();
        context.arc(0, 0, this.maxRadius, this.startTheta, this.endTheta);
        context.lineTo(0, 0);
        context.closePath();
        context.fill();
        
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(0, 0, this.currentRadius, this.startTheta, this.endTheta);
        context.lineTo(0, 0);
        context.closePath();
        context.fill();
    };
    
    return SliceView;
})