define([
    'layer/Renderable',
    'layer/Geometry'
], function(
    Renderable,
    Geometry
) {
    'use strict';
    
    var PolarGraphComponent = function(x, y, radius, content) {
        if (x !== undefined && y !== undefined && radius !== undefined) {
            this.init(x, y, radius, content);
        }
    };
    
    PolarGraphComponent.prototype = new Renderable();
    PolarGraphComponent.prototype.constructor = PolarGraphComponent;
    
    PolarGraphComponent.prototype.init = function(x, y, radius, content) {
        this.x = 0;
        this.y = 0;
        this.radius = radius;
        this.centerX = x + radius;
        this.centerY = y + radius;
    };
    
    PolarGraphComponent.prototype.hitTest = function(x, y) {
        return Geometry.isPointInCircle(x, y, this.centerX, this.centerY, this.radius);
    };
    
    PolarGraphComponent.prototype.getPolarRadius = function(x, y) {
        return Math.abs(Geometry.getDistanceBetweenPoints(this.centerX, this.centerY, x, y));
    };
    
    PolarGraphComponent.prototype.getPolarAngle = function(x, y) {
        
        var angle = Math.atan2(y, x);
        
        console.log(x, y, angle);
        
        if (angle < 0) {
            angle = angle + (Math.PI * 2);
        }
        
        return angle;
    };
    
    PolarGraphComponent.prototype.onMouseMove = function(mouse) {
        var position = [
            mouse.x - this.centerX, 
            mouse.y - this.centerY
        ];
        // position = this.toLocalCoordinates(position);
        
        console.log('C: (' + position[0] + ', ' + position[1] + ')');
        var r = this.getPolarRadius(position[0], position[1]);
        var angle = this.getPolarAngle(position[0], position[1]);
        console.log('P: (' + r + ', ' + angle + ')');
    }
    
    PolarGraphComponent.prototype.render = function(context) {
        context.fillStyle = '#22cc99';
        context.beginPath();
        context.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    };
    
    return PolarGraphComponent;
})