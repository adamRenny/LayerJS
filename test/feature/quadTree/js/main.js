require([
    'jquery',
    'app/Visualization'
], function(
    $,
    Visualization
) {
    'use strict';
    
    $(document).ready(function() {
        new Visualization(document.getElementById('js-viewport'));
    });
    
});