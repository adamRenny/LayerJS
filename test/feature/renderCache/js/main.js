require.config({
    baseUrl: 'js/',
    paths: {
        layer: '../../../../src/layer',
        lib: '../../../../src/lib'
    },
    urlArgs: 'cb=' + new Date().getTime()
});

require([
    'jquery',
    'app/Game'
], function(
    $,
    Game
) {
    "use strict";
    
    $(document).ready(function() {
        var g = window.g = new Game($('#viewport').get(0), 800, 600);
        g.start();
    });
});