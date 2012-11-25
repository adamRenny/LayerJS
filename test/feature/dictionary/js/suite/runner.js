require([
    'assets/mocha',
    'assets/expect'
], function(
) {
    'use strict';
    mocha.setup('bdd');
    
    require([
        'suite/dictionary.test'
    ], function() {
        mocha.run();
    });
});