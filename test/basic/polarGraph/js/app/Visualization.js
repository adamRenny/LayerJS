define([
    'layer/Looper',
    'layer/Scene'
], function(
    Looper,
    Scene
) {
    'use strict';
    
    var Visualization = function() {
        
    };
    
    Visualization.prototype = new Looper();
    Visualization.prototype.constructor = Visualization;
    
    // Visualization.prototype.
    
    return Visualization;
});