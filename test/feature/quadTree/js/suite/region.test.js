define([
    'layer/quadtree/Region'
], function(
    Region
) {
    "use strict";
    
    describe('Quadtree::Region', function() {
        var region;
        var x = 0;
        var y = 0;
        var width = 800;
        var height = 600;
        var testDistance = 100;
        var testPoint = [0, 0];
        var testRegion = null;
        
        beforeEach(function(done) {
            region = new Region(x, y, width, height);
            testPoint[0] = 0;
            testPoint[1] = 0;
            testRegion = null;
            done();
        });
        
        // Calculation checks
        it('calculates its center x', function() {
            expect(region.centerX).to.be(x + (width / 2));
        });
        
        it('calculates its center y', function() {
            expect(region.centerY).to.be(y + (height / 2));
        });
        
        // Point within region
        it('should contain a point within its boundary', function() {
            testPoint[0] = region.centerX;
            testPoint[1] = region.centerY;
            expect(region.hitTestPoint(testPoint)).to.be(true);
        });
        
        // Point on edge
        it('should contain a point on its west edge', function() {
            testPoint[0] = region.x;
            testPoint[1] = region.centerY;
            expect(region.hitTestPoint(testPoint)).to.be(true);
        });
        it('should contain a point on its east edge', function() {
            testPoint[0] = region.x + region.width;
            testPoint[1] = region.centerY;
            expect(region.hitTestPoint(testPoint)).to.be(true);
        });
        it('should contain a point on its north edge', function() {
            testPoint[0] = region.centerX;
            testPoint[1] = region.y;
            expect(region.hitTestPoint(testPoint)).to.be(true);
        });
        
        it('should contain a point on its south edge', function() {
            testPoint[0] = region.centerX;
            testPoint[1] = region.y + region.height;
            expect(region.hitTestPoint(testPoint)).to.be(true);
        });
        
        it('should contain a point on its southeast edge', function() {
            testPoint[0] = region.x + region.width;
            testPoint[1] = region.y + region.height;
            expect(region.hitTestPoint(testPoint)).to.be(true);
        });
        
        it('should contain a point on its southwest edge', function() {
            testPoint[0] = region.x;
            testPoint[1] = region.y + region.height;
            expect(region.hitTestPoint(testPoint)).to.be(true);
        });
        
        it('should contain a point on its northeast edge', function() {
            testPoint[0] = region.x + region.width;
            testPoint[1] = region.y;
            expect(region.hitTestPoint(testPoint)).to.be(true);
        });
        
        it('should contain a point on its northwest edge', function() {
            testPoint[0] = region.x;
            testPoint[1] = region.y;
            expect(region.hitTestPoint(testPoint)).to.be(true);
        });
        
        // Outside point intersections
        it('should not contain a point to the north west of its boundary', function() {
            testPoint[0] = x - testDistance;
            testPoint[1] = y - testDistance;
            expect(region.hitTestPoint(testPoint)).to.be(false);
        });
        
        it('should not contain a point to the north east of its boundary', function() {
            testPoint[0] = (x + width) + testDistance;
            testPoint[1] = y - testDistance;
            expect(region.hitTestPoint(testPoint)).to.be(false);
        });
        
        it('should not contain a point to the south west of its boundary', function() {
            testPoint[0] = x - testDistance;
            testPoint[1] = (y + height) + testDistance;
            expect(region.hitTestPoint(testPoint)).to.be(false);
        });
        
        it('should not contain a point to the south east of its boundary', function() {
            testPoint[0] = (x + width) + testDistance;
            testPoint[1] = (y + height) + testDistance;
            expect(region.hitTestPoint(testPoint)).to.be(false);
        });
        
        // Contained Region
        it('should intersect with a region inside of it', function() {
            testRegion = new Region(x + testDistance, y + testDistance, testDistance, testDistance)
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        // Overlapping Regions
        it('should intersect with a region overlapping the west', function() {
            testRegion = new Region(x - testDistance, y + height * .5, testDistance * 2, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the east', function() {
            testRegion = new Region(width - testDistance, y + height * .5, testDistance * 2, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the north', function() {
            testRegion = new Region(x + width * .5, y - testDistance, testDistance, testDistance * 2);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the south', function() {
            testRegion = new Region(x + width * .5, (y + height) - testDistance, testDistance, testDistance * 2);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the northeast', function() {
            testRegion = new Region((x + width) - testDistance, y - testDistance, testDistance * 2, testDistance * 2);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the northwest', function() {
            testRegion = new Region(x - testDistance, y - testDistance, testDistance * 2, testDistance * 2);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the southwest', function() {
            testRegion = new Region(x - testDistance, (y + height) - testDistance, testDistance * 2, testDistance * 2);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the southeast', function() {
            testRegion = new Region((x + width) - testDistance, (y + height) - testDistance, testDistance * 2, testDistance * 2);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        // Regions on Edges
        it('should intersect with a region overlapping the west edge', function() {
            testRegion = new Region(x - testDistance, y + height * .5, testDistance, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the east edge', function() {
            testRegion = new Region(width, y + height * .5, testDistance, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the north edge', function() {
            testRegion = new Region(x + width * .5, y - testDistance, testDistance, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the south edge', function() {
            testRegion = new Region(x + width * .5, y + height, testDistance, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the northeast edge', function() {
            testRegion = new Region(x + width, y - testDistance, testDistance, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the northwest edge', function() {
            testRegion = new Region(x - testDistance, y - testDistance, testDistance, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the southwest edge', function() {
            testRegion = new Region(x - testDistance, y + height, testDistance, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        it('should intersect with a region overlapping the southeast edge', function() {
            testRegion = new Region(x + width, y + height, testDistance, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(true);
        });
        
        // Regions Outside
        it('should not intersect with a region to the west', function() {
            testRegion = new Region(x - testDistance, y + height * .5, testDistance * .5, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(false);
        });
        
        it('should not intersect with a region to the east', function() {
            testRegion = new Region(width + testDistance, y + height * .5, testDistance * .5, testDistance);
            expect(region.hitTestRegion(testRegion)).to.be(false);
        });
        
        it('should not intersect with a region to the north', function() {
            testRegion = new Region(x + width * .5, y - testDistance, testDistance, testDistance * .5);
            expect(region.hitTestRegion(testRegion)).to.be(false);
        });
        
        it('should not intersect with a region to the south', function() {
            testRegion = new Region(x + width * .5, (y + height) + testDistance, testDistance, testDistance * .5);
            expect(region.hitTestRegion(testRegion)).to.be(false);
        });
        
        it('should not intersect with a region to the northeast', function() {
            testRegion = new Region((x + width) + testDistance, y - testDistance, testDistance * .5, testDistance * .5);
            expect(region.hitTestRegion(testRegion)).to.be(false);
        });
        
        it('should not intersect with a region to the northwest', function() {
            testRegion = new Region(x - testDistance, y - testDistance, testDistance * .5, testDistance * .5);
            expect(region.hitTestRegion(testRegion)).to.be(false);
        });
        
        it('should not intersect with a region to the southwest', function() {
            testRegion = new Region(x - testDistance, (y + height) + testDistance, testDistance * .5, testDistance * .5);
            expect(region.hitTestRegion(testRegion)).to.be(false);
        });
        
        it('should not intersect with a region to the southeast', function() {
            testRegion = new Region((x + width) + testDistance, (y + height) + testDistance, testDistance * .5, testDistance * .5);
            expect(region.hitTestRegion(testRegion)).to.be(false);
        });
        
        // Corner Cases
        it('should not intersect with any overlapping regions if it has no width/height', function() {
            region = new Region(0, 0, 0, 0);
            testRegion = new Region(-1, -1, 2, 2);
            expect(region.hitTestRegion(testRegion)).to.be(false);
        });
        
        it('should not intersect with any overlapping points if it has no width/height', function() {
            region = new Region(0, 0, 0, 0);
            testPoint[0] = 0;
            testPoint[1] = 0;
            expect(region.hitTestPoint(testPoint)).to.be(false);
        });
    });
});