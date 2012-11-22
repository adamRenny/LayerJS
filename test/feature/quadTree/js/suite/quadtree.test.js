define([
    'layer/quadtree/Quadtree',
    'layer/quadtree/RectRegion',
    'layer/quadtree/Node',
    'layer/Renderable'
], function(
    Quadtree,
    RectRegion,
    Node,
    Renderable
) {
    'use strict';
    
    describe('Quadtree', function() {
        var quadtree;
        var region;
        var subregion;
        var item;
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
            item = new Node(new Renderable(20, 20, 100, 100));
            quadtree.insert(item);
            
            item = new Node(new Renderable(40, 40, 20, 20));
            quadtree.insert(item);
            
            item = new Node(new Renderable(100, 100, 100, 100));
            quadtree.insert(item);
            
            item = new Node(new Renderable(200, 200, 100, 100));
            quadtree.insert(item);
            
            expect(quadtree.isLeaf).to.be(true);
        });
        
        it('should not be a leaf with greater than 4 regions', function() {
            item = new Node(new Renderable(20, 20, 100, 100));
            quadtree.insert(item);
            
            item = new Node(new Renderable(40, 40, 20, 20));
            quadtree.insert(item);
            
            item = new Node(new Renderable(100, 100, 100, 100));
            quadtree.insert(item);
            
            item = new Node(new Renderable(200, 200, 100, 100));
            quadtree.insert(item);
            
            item = new Node(new Renderable(150, 150, 500, 500));
            quadtree.insert(item);
            
            expect(quadtree.isLeaf).to.be(false);
        });
        
        it('should return all upper left quadrants if a that region is queried', function() {
            var items = [];
            item = new Node(new Renderable(20, 20, 100, 100));
            quadtree.insert(item);
            items.push(item);
            
            item = new Node(new Renderable(40, 40, 20, 20));
            quadtree.insert(item);
            items.push(item);
            
            item = new Node(new Renderable(100, 100, 100, 100));
            quadtree.insert(item);
            items.push(item);
            
            item = new Node(new Renderable(200, 200, 100, 100));
            quadtree.insert(item);
            items.push(item);
            
            item = new Node(new Renderable(150, 150, 500, 500));
            quadtree.insert(item);
            items.push(item);
            
            var testRegion = new RectRegion(0, 0, 400, 300);
            var results = quadtree.queryRegion(testRegion);
            
            for (var i = 0; i < items.length; i++) {
                expect(results.containsElement(items[i])).to.be(true);
            }
        });
        
        it('can support having more than 4 renderables in the same position', function() {
            var stackExceptionHasOccurred = false;
            
            try {
                for (var i = 0; i < 5; i++) {
                    item = new Node(new Renderable(0, 0, 10, 10));
                    quadtree.insert(item);
                }
            } catch (exception) {
                stackExceptionHasOccurred = true;
            }
            
            expect(stackExceptionHasOccurred).to.be(false);
        });
    });
});