define([
    'layer/Set'
], function(
    Set
) {
    "use strict";
    
    describe('Set', function() {
        var set;
        
        beforeEach(function(done) {
            set = new Set();
            done();
        });
        
        // Set
        it('can only have 1 copy of each element', function() {
            set = new Set(1, 2, 3, 4, 5, 6, 1, 23, 4);
            console.log(set);
            expect(set.length).to.be(7);
        });
        
    });
});