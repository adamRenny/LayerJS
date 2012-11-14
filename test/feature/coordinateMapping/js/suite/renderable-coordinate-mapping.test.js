define([
    'layer/Renderable',
    'layer/RenderableGroup'
], function(
    Renderable,
    RenderableGroup
) {
    "use strict";
    
    describe('Renderable::Coordinate Mapping', function() {
        var renderable;
        var group;
        var startX = 100;
        var startY = 200;
        var width = 200;
        var height = 400;
        var position = [0, 0];
        
        beforeEach(function(done) {
            renderable = new Renderable(startX, startY, width, height);
            group = new RenderableGroup(startX, startY);
            position[0] = 0;
            position[1] = 0;
            done();
        });
        
        // Set
        it('can map world coordinates at origin into local space', function() {
            position[0] = startX;
            position[1] = startY;
            position = renderable.toLocalCoordinates(position);
            
            expect(position[0]).to.be(0);
            expect(position[1]).to.be(0);
        });
        
        it('can map world coordinates at origin into local space and back to world space', function() {
            position[0] = startX;
            position[1] = startY;
            position = renderable.toLocalCoordinates(position);
            position = renderable.toWorldCoordinates(position);
            
            expect(position[0]).to.be(startX);
            expect(position[1]).to.be(startY);
        });
        
        it('can map world coordinates within main quadrant into local space', function() {
            var offset = 25;
            position[0] = startX + offset;
            position[1] = startY - offset;
            position = renderable.toLocalCoordinates(position);
            
            expect(position[0]).to.be(offset);
            expect(position[1]).to.be(-offset);
        });
        
        it('can map world coordinates within main quadrant into local space and back to world space', function() {
            var offset = 25;
            position[0] = startX + offset;
            position[1] = startY - offset;
            position = renderable.toLocalCoordinates(position);
            position = renderable.toWorldCoordinates(position);
            
            expect(position[0]).to.be(startX + offset);
            expect(position[1]).to.be(startY - offset);
        });
    });
});