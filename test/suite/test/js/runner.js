require([
    'assets/mocha',
    'assets/expect'
], function(
) {
    'use strict';
    mocha.setup('bdd');
    
    require([
        'unit/collection/set.test',
        'unit/collection/dictionary.test',
        'unit/region/region.test',
        'unit/geometry/geometry.test',
        'unit/layer/renderable.test'
    ], function() {
        mocha.run();
    });
});