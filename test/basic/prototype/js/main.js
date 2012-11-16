require([
    'jquery',
    'app/Game'
], function(
    $,
    Game
) {
    'use strict';
    
    $(document).ready(function() {
        var g = window.g = new Game($('#viewport').get(0), 800, 600);
        g.start();
    });
});