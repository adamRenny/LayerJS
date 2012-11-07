require([
    'assets/mocha',
    'assets/expect'
], function(
) {
    "use strict";
    mocha.setup('bdd');
    
    require([
        'suite/set.test'
    ], function() {
        mocha.run();
    });
});