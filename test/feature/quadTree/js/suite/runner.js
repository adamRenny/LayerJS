require([
    'assets/mocha',
    'assets/expect'
], function(
) {
    'use strict';
    mocha.setup('bdd');
    
    require([
        'suite/region.test',
        'suite/quadtree.test'
    ], function() {
        mocha.run();
    });
});