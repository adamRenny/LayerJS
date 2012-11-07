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
            expect(set.containsElement(23)).to.be(true)
        });
        
        it('can remove an element if added', function() {
            set.insertElement(23);
            expect(set.containsElement(23)).to.be(true);
            set.removeElement(23);
            expect(set.containsElement(23)).to.be(false);
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
            expect(set.containsElement(3)).to.be(true);
            expect(set.containsElement(4)).to.be(true);
            expect(set.containsElement(5)).to.be(true);
            expect(set.containsElement('other')).to.be(true);
        });
        
        it('can union with another set', function() {
            set = new Set(1, 2, 3, 4, 5, 'other');
            otherSet = new Set(3, 4, 5, 6, 7, 8, 'other');
            set.union(otherSet);
            
            expect(set.length).to.be(9);
        });
        
        it('as a union, its parents are subsets of it', function() {
            set = new Set(1, 2, 3, 4, 5, 'other');
            otherSet = new Set(3, 4, 5, 6, 7, 8, 'other');
            var union = set.getUnion(otherSet);
            
            expect(set.isSubset(union)).to.be(true);
            expect(otherSet.isSubset(union)).to.be(true);
        });
        
        it('as a union, it is not a subset of its parents', function() {
            set = new Set(1, 2, 3, 4, 5, 'other');
            otherSet = new Set(3, 4, 5, 6, 7, 8, 'other');
            var union = set.getUnion(otherSet);
            
            expect(union.isSubset(set)).to.be(false);
            expect(union.isSubset(otherSet)).to.be(false);
        });
        
        it('can subtract another set', function() {
            set = new Set(1, 2, 3, 4, 5, 'other');
            otherSet = new Set(3, 4, 5, 6, 7, 8, 'other');
            set.minus(otherSet);

            expect(set.length).to.be(2);
            expect(set.containsElement(1)).to.be(true);
            expect(set.containsElement(2)).to.be(true);
            expect(set.containsElement('other')).to.be(false);
        });
        
        it('as a subtracted set, it should be a subset of the origin and not of the subtraction', function() {
            set = new Set(1, 2, 3, 4, 5, 'other');
            otherSet = new Set(3, 4, 5, 6, 7, 8, 'other');
            var subtraction = set.getSubtraction(otherSet);

            expect(subtraction.isSubset(set)).to.be(true);
            expect(subtraction.isSubset(otherSet)).to.be(false);
        });
    });
});