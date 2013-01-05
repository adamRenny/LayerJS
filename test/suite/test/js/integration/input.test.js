define([
    'layer/Scene',
    'mock/renderable/Renderable'
], function(
    Scene,
    Renderable
) {
    'use strict';

    var TEST_VIEWPORT_ID = 'js-viewport';

    describe('Input / Renderable', function() {

        var scene;
        var viewport = document.getElementById(TEST_VIEWPORT_ID);
        var $viewport = jQuery(viewport);
        var width = 500;
        var height = 500;
        var layerName = 'test';
        var input;
        var layer;
        var renderable;

        var renderableX = 20;
        var renderableY = 20;
        var renderableWidth = 50;
        var renderableHeight = 50;
        var position = {
            x: 50,
            y: 50
        };

        beforeEach(function() {
            scene = new Scene(viewport, width, height);
            input = scene.input;

            scene.getStage().createAndAppendLayer(layerName).enableCSSAcceleration();
            layer = scene.getStage().getLayerByName(layerName);
            renderable = new Renderable(renderableX, renderableY, renderableWidth, renderableHeight);

            layer.getRoot().addChild(renderable);
            $viewport.css({
                position: 'absolute',
                left: position.x,
                top: position.y
            });
            scene.render();
        });

        afterEach(function() {
            input.deactivate();
            scene = null;
            viewport.innerHTML = '';
            $viewport.removeAttr('style');
        });

        it('will be active on mouseover', function() {
            $viewport.simulate('mouseover');

            expect(input.enabled).to.be(true);
        });

        it('will be inactive on mouseout', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mouseout');

            expect(input.enabled).to.be(false);
        });

        it('will be in drag mode on mousedown', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', { clientX: renderableX + 20, clientY: renderableY + 20 });

            expect(input.isDragging).to.be(true);
        });

        it('Renderable will trigger onMouseMove when over', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    clientX: position.x + renderableX + 20 - document.body.scrollLeft,
                    clientY: position.y + renderableY + 20 - document.body.scrollTop
                });

            expect(renderable.isOver).to.be(true);
        });

        it('Renderable will not trigger onMouseMove when not over', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    clientX: position.x - document.body.scrollLeft,
                    clientY: position.y - document.body.scrollTop
                });

            expect(renderable.isOver).to.be(false);
        });

        it('Renderable will trigger onMouseDown when clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    clientX: position.x + renderableX + 20 - document.body.scrollLeft,
                    clientY: position.y + renderableY + 20 - document.body.scrollTop
                });

            expect(renderable.isDragging).to.be(true);
        });

        it('Renderable will not trigger onMouseDown when not clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    clientX: position.x - document.body.scrollLeft,
                    clientY: position.y - document.body.scrollTop
                });

            expect(renderable.isDragging).to.be(false);
        });

        it('Renderable will trigger onMouseUp when clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    clientX: position.x + renderableX + 20 - document.body.scrollLeft,
                    clientY: position.y + renderableY + 20 - document.body.scrollTop
                })
                .simulate('mouseup', {
                    clientX: position.x + renderableX + 20 - document.body.scrollLeft,
                    clientY: position.y + renderableY + 20 - document.body.scrollTop
                });

            expect(renderable.isDragging).to.be(false);
        });

        it('Renderable will not trigger onMouseUp when not clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    clientX: position.x + renderableX + 20 - document.body.scrollLeft,
                    clientY: position.y + renderableY + 20 - document.body.scrollTop
                })
                .simulate('mouseup', {
                    clientX: position.x - document.body.scrollLeft,
                    clientY: position.y - document.body.scrollTop
                });

            expect(renderable.isDragging).to.be(true);
        });

        it('will not be in drag mode on mouseup', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', { clientX: renderableX + 20, clientY: renderableY + 20 })
                .simulate('mouseup', { clientX: renderableX + 20, clientY: renderableY + 20 });

            expect(input.isDragging).to.be(false);
        });
    });
});