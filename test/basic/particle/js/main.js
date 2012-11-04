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