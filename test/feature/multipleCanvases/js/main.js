require([
    'jquery',
    'Visualization'
], function(
    $,
    Visualization
) {
    $(document).ready(function() {
        var wrapperA = document.getElementById('js-viewport-a');
        var wrapperB = document.getElementById('js-viewport-b')
        
        var visualizationA = new Visualization(wrapperA);
        visualizationA.start();
        
        var visualizationB = new Visualization(wrapperB);
        visualizationB.start();
    });
});