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
    'System'
], function(
    $,
    System
) {
    $(document).ready(function() {
        var wrapper = document.getElementById('js-viewport');
        
        var system = new System(wrapper);
        system.start();
    });
});