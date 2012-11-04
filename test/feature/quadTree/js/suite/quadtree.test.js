define([
    'layer/quadtree/Quadtree',
    'layer/quadtree/Region'
], function(
    Quadtree,
    Region
) {
    "use strict";
    
    describe('Quadtree', function() {
        var quadtree;
        var region;
        var subregion;
        var x = 0;
        var y = 0;
        var width = 800;
        var height = 600;
        
        beforeEach(function(done) {
            region = new Region(x, y, width, height);
            quadtree = new Quadtree(region);
            done();
        });
        
        it('should be a leaf on initial creation', function() {
            expect(quadtree.isLeaf).to.be(true);
        });
        
        it('should be a leaf with less than or equal to 4 regions', function() {
            subregion = new Region(20, 20, 100, 100);
            quadtree.insert(subregion);
            
            subregion = new Region(40, 40, 20, 20);
            quadtree.insert(subregion);
            
            subregion = new Region(100, 100, 100, 100);
            quadtree.insert(subregion);
            
            subregion = new Region(200, 200, 100, 100);
            quadtree.insert(subregion);
            
            expect(quadtree.isLeaf).to.be(true);
        });
        
        it('should not be a leaf with greater than 4 regions', function() {
            subregion = new Region(20, 20, 100, 100);
            quadtree.insert(subregion);
            
            subregion = new Region(40, 40, 20, 20);
            quadtree.insert(subregion);
            
            subregion = new Region(100, 100, 100, 100);
            quadtree.insert(subregion);
            
            subregion = new Region(200, 200, 100, 100);
            quadtree.insert(subregion);
            
            subregion = new Region(150, 150, 500, 500);
            quadtree.insert(subregion);
            
            console.log(quadtree);
            
            expect(quadtree.isLeaf).to.be(false);
        });
    });
});