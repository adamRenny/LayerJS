require([
    'assets/mocha',
    'assets/expect'
], function(
) {
    'use strict';
    mocha.setup('bdd');
    
    require([
        'unit/geometry/geometry.test',
        'unit/layer/renderable.test',
        'unit/layer/renderablegroup.test',
        'integration/renderable.test'
    ], function() {
        mocha.run();
    });
});