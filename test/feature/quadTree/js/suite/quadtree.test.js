define([
    'layer/quadtree/Quadtree',
    'layer/quadtree/RectRegion'
], function(
    Quadtree,
    RectRegion
) {
    'use strict';
    
    describe('Quadtree', function() {
        var quadtree;
        var region;
        var subregion;
        var x = 0;
        var y = 0;
        var width = 800;
        var height = 600;
        
        beforeEach(function(done) {
            region = new RectRegion(x, y, width, height);
            quadtree = new Quadtree(region);
            done();
        });
        
        it('should be a leaf on initial creation', function() {
            expect(quadtree.isLeaf).to.be(true);
        });
        
        it('should be a leaf with less than or equal to 4 regions', function() {
            subregion = new RectRegion(20, 20, 100, 100);
            quadtree.insert(subregion);
            
            subregion = new RectRegion(40, 40, 20, 20);
            quadtree.insert(subregion);
            
            subregion = new RectRegion(100, 100, 100, 100);
            quadtree.insert(subregion);
            
            subregion = new RectRegion(200, 200, 100, 100);
            quadtree.insert(subregion);
            
            expect(quadtree.isLeaf).to.be(true);
        });
        
        it('should not be a leaf with greater than 4 regions', function() {
            subregion = new RectRegion(20, 20, 100, 100);
            quadtree.insert(subregion);
            
            subregion = new RectRegion(40, 40, 20, 20);
            quadtree.insert(subregion);
            
            subregion = new RectRegion(100, 100, 100, 100);
            quadtree.insert(subregion);
            
            subregion = new RectRegion(200, 200, 100, 100);
            quadtree.insert(subregion);
            
            subregion = new RectRegion(150, 150, 500, 500);
            quadtree.insert(subregion);
            
            expect(quadtree.isLeaf).to.be(false);
        });
        
        it('should return all upper left quadrants if a that region is queried', function() {
            var regions = [];
            subregion = new RectRegion(20, 20, 100, 100);
            quadtree.insert(subregion);
            regions.push(subregion);
            
            subregion = new RectRegion(40, 40, 20, 20);
            quadtree.insert(subregion);
            regions.push(subregion);
            
            subregion = new RectRegion(100, 100, 100, 100);
            quadtree.insert(subregion);
            regions.push(subregion);
            
            subregion = new RectRegion(200, 200, 100, 100);
            quadtree.insert(subregion);
            regions.push(subregion);
            
            subregion = new RectRegion(150, 150, 500, 500);
            quadtree.insert(subregion);
            regions.push(subregion);
            
            var testRegion = new RectRegion(0, 0, 400, 300);
            var results = quadtree.queryRegion(testRegion);
            
            for (var i = 0; i < regions.length; i++) {
                expect(results.containsElement(regions[i])).to.be(true);
            }
        });
    });
});