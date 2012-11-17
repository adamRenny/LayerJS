require([
    'jquery',
    'Visualization'
], function(
    $,
    Visualization
) {
    $(document).ready(function() {
        var wrapper = document.getElementById('js-viewport');
        
        var visualization = new Visualization(wrapper);
        visualization.start();
    });
});