define([
    'layer/Renderable',
    'layer/RenderableGroup',
    'expectUtility',
], function(
    Renderable,
    RenderableGroup,
    expectUtility
) {
    'use strict';

    var expectToBeClose = expectUtility.expectToBeClose;

    describe('RenderableGroup', function() {

        var group;
        var x = 0;
        var y = 0;
        var width = 100;
        var height = 100;

        beforeEach(function() {
            group = new RenderableGroup(x, y, width, height);
        });

        it('should use 0, 0 as its content origin, even if a child is further in', function() {
            var renderable = new Renderable(20, 20, 10, 10);

            group.addChild(renderable);
            group.updateTransform();

            expect(group.contentX).to.be(0);
            expect(group.contentY).to.be(0);
            expect(group.contentWidth).to.be(renderable.x + renderable.width);
            expect(group.contentHeight).to.be(renderable.y + renderable.height);
        });

        it('will update its child-most transform even if it doesn\'t need an update', function() {
            var parentA = new RenderableGroup(20, 30, 100, 100);
            parentA.updateTransform();

            var parentACopy = mat3.identity();

            var transformA = parentA.transform;

            var parentB = new RenderableGroup(30, 20, 100, 100);
            parentA.addChild(parentB);

            var renderable = new Renderable(10, 10, 5, 5);
            parentB.addChild(renderable);

            renderable.updateTransform();
            var transform = renderable.transform;
            expectToBeClose(transform[0], 1);
            expectToBeClose(transform[1], 0);
            expectToBeClose(transform[2], 0);
            expectToBeClose(transform[3], 0);
            expectToBeClose(transform[4], 1);
            expectToBeClose(transform[5], 0);
            expectToBeClose(transform[6], 60);
            expectToBeClose(transform[7], 60);
            expectToBeClose(transform[8], 1);
        });

    });
});