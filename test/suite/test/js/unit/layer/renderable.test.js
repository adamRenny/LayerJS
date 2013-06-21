define([
    'layer/Renderable',
    'layer/RenderableGroup',
    'expectUtility'
], function(
    Renderable,
    RenderableGroup,
    expectUtility
) {
    'use strict';

    var expectToBeClose = expectUtility.expectToBeClose;

    describe('Renderable', function() {

        var renderable;
        var x = 0;
        var y = 0;
        var width = 100;
        var height = 100;

        beforeEach(function() {
            renderable = new Renderable(x, y, width, height);
        });

        it('does not require all parameters to initialize', function() {
            renderable = new Renderable(1, 2);

            expect(renderable.width).to.be(0);
        });

        it('is a leaf node', function() {
            expect(renderable.isLeafNode).to.be(true);
        });

        it('is interactive by default', function() {
            expect(renderable.isInteractive).to.be(true);
        });

        it('should begin with default transform data', function() {
            var defaultRotation = 0;
            var defaultCenterX = .5;
            var defaultCenterY = .5;
            var defaultScaleX = 1;
            var defaultScaleY = 1;

            expect(renderable.rotation).to.be(defaultRotation);
            expect(renderable.centerOffsetX).to.be(defaultCenterX);
            expect(renderable.centerOffsetY).to.be(defaultCenterY);
            expect(renderable.scaleX).to.be(defaultScaleX);
            expect(renderable.scaleY).to.be(defaultScaleY);
        });

        it('should not update its transform until being asked to', function() {
            var baseScale = 1.5;
            var rotation = Math.PI;
            var xPosition = 245;
            var yPosition = 23;
            var newCenterOffset = 0;
            var identity = [1, 0, 0, 0, 1, 0, 0, 0, 1];

            renderable.scale = baseScale;
            renderable.setCenterPoint(newCenterOffset, newCenterOffset);
            renderable.x = xPosition;
            renderable.y = yPosition;
            renderable.rotation = rotation;

            var i = 0;
            var l = identity.length;
            for (; i < l; i++) {
                expect(renderable.transform[i]).to.be(identity[i]);
            }

            renderable.updateTransform();

            i = 0;
            var isIdentity = true;
            for (; i < l; i++) {
                if (identity[i] !== renderable.transform[i]) {
                    isIdentity = false;
                }
            }

            expect(isIdentity).to.be(false);
        });

        it('should update its width after scaling its x', function() {
            var baseScale = 2;
            renderable.scaleX = baseScale;
            renderable.updateTransform();

            expect(renderable.width).to.be(width * baseScale);
            expect(renderable.unscaledWidth).to.be(width);
        });

        it('should update its height after scaling its y', function() {
            var baseScale = 2;
            renderable.scaleY = baseScale;
            renderable.updateTransform();

            expect(renderable.height).to.be(height * baseScale);
            expect(renderable.unscaledHeight).to.be(height);
        });

        it('should update its y scale after updating the height', function() {
            var baseHeight = 20;
            renderable.height = baseHeight;
            renderable.updateTransform();

            expect(renderable.scaleY).to.be(baseHeight / height);
            expect(renderable.unscaledHeight).to.be(height);
        });

        it('should update its x scale after updating the width', function() {
            var baseWidth = 20;
            renderable.width = baseWidth;
            renderable.updateTransform();

            expect(renderable.scaleX).to.be(baseWidth / width);
            expect(renderable.unscaledWidth).to.be(width);
        });

        it('should not have a parent transform', function() {
            expect(renderable.parentTransform).to.be(null);
        });

        it('can convert world coordinates to local coordinates', function() {
            var xPosition = 20;
            var yPosition = 100;

            renderable.x = xPosition;
            renderable.y = yPosition;

            var localCoords = renderable.toLocalCoordinates([xPosition, yPosition]);

            expect(localCoords[0]).to.be(0);
            expect(localCoords[1]).to.be(0);

            localCoords = renderable.toLocalCoordinates([0, 0]);

            expect(localCoords[0]).to.be(-xPosition);
            expect(localCoords[1]).to.be(-yPosition);
        });

        it('will pass a hit test if within its rectangular boundaries', function() {
            expect(renderable.hitTest(Math.random() * x + width, Math.random() * y + height)).to.be(true);
        });

        it('will fail a hit test if outside its rectangular boundaries', function() {
            var horizontalSide = Math.round(Math.random());
            var verticalSide = Math.round(Math.random());

            var xTest = 0;
            var yTest = 0;

            var space = 5000;
            if (horizontalSide) {
                xTest = x + width + 1 + (Math.random() * space);
            } else {
                xTest = x - 1 - (Math.random() * space)
            }

            if (horizontalSide) {
                yTest = y + height + 1 + (Math.random() * space);
            } else {
                yTest = y - 1 - (Math.random() * space)
            }

            expect(renderable.hitTest(xTest, yTest)).to.be(false);
        });

        it('will return itself as a hit target', function() {
            expect(renderable.getHitTarget(x, y)).to.be(renderable);
        });

        it('will return nothing as a child hit target', function() {
            expect(renderable.getChildHitTarget(x, y)).to.be(null);
        });

        it('will update its transform with scale and position after updateTransform', function() {
            renderable = new Renderable(20, 30, 100, 100);
            renderable.setCenterPoint(0, 0);
            renderable.scaleX = 0.9;
            renderable.scaleY = 0.5;
            renderable.updateTransform();

            var transform = renderable.transform;
            expectToBeClose(transform[0], 0.9);
            expectToBeClose(transform[1], 0);
            expectToBeClose(transform[2], 0);
            expectToBeClose(transform[3], 0);
            expectToBeClose(transform[4], 0.5);
            expectToBeClose(transform[5], 0);
            expectToBeClose(transform[6], 20);
            expectToBeClose(transform[7], 30);
            expectToBeClose(transform[8], 1);
        });
    });
});