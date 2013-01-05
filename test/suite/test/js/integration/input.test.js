define([
    'layer/Scene',
    'mock/renderable/Renderable'
], function(
    Scene,
    Renderable
) {
    'use strict';

    var TEST_VIEWPORT_ID = 'js-viewport';

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

    var _beforeEach = function() {
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
    };

    var _afterEach = function() {
        input.deactivate();
        scene = null;
        viewport.innerHTML = '';
        $viewport.removeAttr('style');
    };

    describe('Input', function() {

        beforeEach(_beforeEach);
        afterEach(_afterEach);

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
                .simulate('mousedown', {
                    clientX: position.x + renderableX + 20 - document.body.scrollLeft,
                    clientY: position.y + renderableY + 20 - document.body.scrollTop
                });

            expect(input.isDragging).to.be(true);
        });

        it('will not be in drag mode on mouseup', function() {
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

            expect(input.isDragging).to.be(false);
        });
    });

    describe('Renderable + Input', function() {

        beforeEach(_beforeEach);
        afterEach(_afterEach);

        it('onMouseOver will trigger when moused over', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    clientX: position.x + renderableX + 20 - document.body.scrollLeft,
                    clientY: position.y + renderableY + 20 - document.body.scrollTop
                });

            expect(renderable.isOver).to.be(true);
        });

        it('onMouseOver will not trigger when not moused over', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    clientX: position.x - document.body.scrollLeft,
                    clientY: position.y - document.body.scrollTop
                });

            expect(renderable.isOver).to.be(false);
        });

        it('onMouseOut will trigger when moused out', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    clientX: position.x + renderableX + 20 - document.body.scrollLeft,
                    clientY: position.y + renderableY + 20 - document.body.scrollTop
                })
                .simulate('mousemove', {
                    clientX: position.x - document.body.scrollLeft,
                    clientY: position.y - document.body.scrollTop
                });

            expect(renderable.isOver).to.be(false);
        });

        it('onMouseDown will trigger when clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    clientX: position.x + renderableX + 20 - document.body.scrollLeft,
                    clientY: position.y + renderableY + 20 - document.body.scrollTop
                });

            expect(renderable.isDragging).to.be(true);
        });

        it('onMouseDown will not trigger when not clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    clientX: position.x - document.body.scrollLeft,
                    clientY: position.y - document.body.scrollTop
                });

            expect(renderable.isDragging).to.be(false);
        });

        it('onMouseMove will trigger when over', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    clientX: position.x + renderableX + 20 - document.body.scrollLeft,
                    clientY: position.y + renderableY + 20 - document.body.scrollTop
                });

            expect(renderable.isOver).to.be(true);
        });

        it('onMouseMove will not trigger when not over', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    clientX: position.x - document.body.scrollLeft,
                    clientY: position.y - document.body.scrollTop
                });

            expect(renderable.isOver).to.be(false);
        });

        it('onMouseUp will trigger when clicked', function() {
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

        it('onMouseUp will not trigger when not clicked', function() {
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

        it('onClick will trigger when clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('click', {
                    clientX: position.x + renderableX + 20 - document.body.scrollLeft,
                    clientY: position.y + renderableY + 20 - document.body.scrollTop
                });

            expect(renderable.clicked).to.be(true);
        });

        it('onClick will not trigger when not clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('click', {
                    clientX: position.x + document.body.scrollLeft,
                    clientY: position.y + document.body.scrollTop
                });

            expect(renderable.clicked).to.be(false);
        });
    });
});