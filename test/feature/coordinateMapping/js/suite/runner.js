require([
    'assets/mocha',
    'assets/expect'
], function(
) {
    'use strict';
    mocha.setup('bdd');
    
    require([
        'suite/renderable-coordinate-mapping.test'
    ], function() {
        mocha.run();
    });
});