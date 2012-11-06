define([
    'layer/Set'
], function(
    Set
) {
    "use strict";
    
    describe('Set', function() {
        var set;
        var otherSet;
        
        beforeEach(function(done) {
            set = new Set();
            otherSet = new Set();
            done();
        });
        
        // Set
        it('can only have 1 copy of each element', function() {
            set = new Set(1, 2, 3, 4, 5, 6, 1, 23, 4);
            expect(set.length).to.be(7);
        });
        
        it('can insert a new element', function() {
            set.insertElement(23);
            expect(set.hasElement(23)).to.be(true)
        });
        
        it('can remove an element if added', function() {
            set.insertElement(23);
            expect(set.hasElement(23)).to.be(true);
            set.removeElement(23);
            expect(set.hasElement(23)).to.be(false);
        });
        
        it('can add several elements at once', function() {
            set.insertElements(1, 2, 3, 4, 'happy', 'happy', 2, 'fifty-five', {});
            expect(set.length).to.be(7);
        });
        
        it('can intersect another set', function() {
            set = new Set(1, 2, 3, 4, 5, 'other');
            otherSet = new Set(3, 4, 5, 6, 7, 8, 'other');
            set.intersection(otherSet);
            
            expect(set.length).to.be(4);
            expect(set.hasElement(3)).to.be(true);
            expect(set.hasElement(4)).to.be(true);
            expect(set.hasElement(5)).to.be(true);
            expect(set.hasElement('other')).to.be(true);
        });
        
        it('as an intersection, its parents are its superset', function() {
            set = new Set(1, 2, 3, 4, 5, 'other');
            otherSet = new Set(3, 4, 5, 6, 7, 8, 'other');
            var intersection = set.getIntersection(otherSet);
            
            expect(set.isSuperset(intersection)).to.be(true);
            expect(otherSet.isSuperset(intersection)).to.be(true);
        })
    });
});