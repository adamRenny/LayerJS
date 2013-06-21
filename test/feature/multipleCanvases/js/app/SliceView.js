define([
    'layer/Renderable',
    'layer/Geometry'
], function(
    Renderable,
    Geometry
) {
    'use strict';
    
    var SliceView = function(theta, radialWidth, maxRadius) {
        if (theta !== undefined && radialWidth !== undefined && maxRadius !== undefined) {
            this.init(theta, radialWidth, maxRadius);
        }
    };
    
    SliceView.prototype = new Renderable();
    SliceView.prototype.constructor = SliceView;
    
    SliceView.prototype.Renderable_init = Renderable.prototype.init;
    SliceView.prototype.Renderable_render = Renderable.prototype.render;
    
    SliceView.prototype.init = function(theta, radialWidth, maxRadius) {
        this.Renderable_init(0, 0, maxRadius, maxRadius);
        
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
        var vector = this.toLocalCoordinates([x, y]);
        var polarVector = Geometry.convertCartesianToPolar(vector[0], vector[1]);
        
        return Geometry.isPolarPointInPolarArea(polarVector[0], polarVector[1], this.maxRadius, this.startTheta, this.endTheta);
    };
    
    SliceView.prototype.onMouseMove = function(mouse) {
        var vector = this.toLocalCoordinates([mouse.x, mouse.y]);
        var polarVector = Geometry.convertCartesianToPolar(vector[0], vector[1]);
        
        this.currentRadius = polarVector[0];
        this.setNeedsRender();
    };
    
    SliceView.prototype.render = function(context) {
        this.Renderable_render(context);
        
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