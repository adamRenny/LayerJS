define([
    'layer/Scene',
    'mock/renderable/Renderable'
], function(
    Scene,
    Renderable
) {
    'use strict';

    var TEST_VIEWPORT_ID = 'js-viewport';

    var viewport = document.getElementById(TEST_VIEWPORT_ID);
    var $viewport = jQuery(viewport);
    var width = 500;
    var height = 500;
    var layerName = 'test';

    var scene;
    var input;
    var layer;
    var renderable;

    var renderableX = 20;
    var renderableY = 20;
    var renderableWidth = 100;
    var renderableHeight = 100;
    var position = { x: 50, y: 50 };

    var viewportCss = {
        position: 'fixed', // Needs to be fixed to resolve mocha auto scrolling when printing test results.
        left: position.x,
        top: position.y,
        pointerEvents: 'none' // Ignore real mouse events
    };

    var _x = function(delta) {
        return renderableX + position.x + delta;
    };

    var _y = function(delta) {
        return renderableY + position.y + delta;
    };

    var _beforeEach = function() {
        scene = new Scene(viewport, width, height);
        input = scene.input;

        layer = scene
            .getStage()
            .createAndAppendLayer(layerName)
            .enableCSSAcceleration()
            .getLayerByName(layerName);

        renderable = new Renderable(renderableX, renderableY, renderableWidth, renderableHeight);

        layer
            .getRoot()
            .addChild(renderable);

        $viewport.css(viewportCss);
        scene.render();
    };

    var _afterEach = function() {
        $viewport.simulate('mouseout');
        input.deactivate();

        input = null;
        renderable = null;
        layer = null;
        scene = null;

        $viewport.removeAttr('style').empty();
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
                    x: _x(20),
                    y: _y(20)
                });

            expect(input.isDragging).to.be(true);
        });

        it('will be in drag mode on mousedown and mouseout', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    x: _x(20),
                    y: _y(20)
                })
                .simulate('mousemove', {
                    x: _x(-200),
                    y: _y(-220)
                });

            expect(input.isDragging).to.be(true);
        });

        it('will not be in drag mode on mouseup', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    x: _x(20),
                    y: _y(20)
                })
                .simulate('mouseup', {
                    x: _x(20),
                    y: _y(20)
                });

            expect(input.isDragging).to.be(false);
        });
    });

    describe('Input Renderable', function() {

        beforeEach(_beforeEach);
        afterEach(_afterEach);

        it('onMouseOver will trigger when moused over', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    x: _x(20),
                    y: _y(20)
                });

            expect(renderable.isOver).to.be(true);
        });

        it('onMouseOver will not trigger when not moused over', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    x: _x(-20),
                    y: _y(-20)
                });

            expect(renderable.isOver).to.be(false);
        });

        it('onMouseOut will trigger when moused out', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    x: _x(20),
                    y: _y(20)
                })
                .simulate('mousemove', {
                    x: _x(-10),
                    y: _y(-10)
                });

            expect(renderable.isOver).to.be(false);
        });

        it('onMouseOut will trigger when moused out of layer', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    x: _x(20),
                    y: _y(20)
                })
                .simulate('mousemove', {
                    x: _x(-200),
                    y: _y(-200)
                });

            expect(renderable.isOver).to.be(false);
        });

        it('onMouseDown will trigger when clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    x: _x(20),
                    y: _y(20)
                });

            expect(renderable.isDragging).to.be(true);
        });

        it('onMouseDown will not trigger when not clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    x: _x(-20),
                    y: _y(-20)
                });

            expect(renderable.isDragging).to.be(false);
        });

        it('onMouseMove will trigger when over', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    x: _x(20),
                    y: _y(20)
                });

            expect(renderable.isOver).to.be(true);
        });

        it('onMouseMove will not trigger when not over', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousemove', {
                    x: _x(-20),
                    y: _y(-20)
                });

            expect(renderable.isOver).to.be(false);
        });

        it('onMouseUp will trigger when clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    x: _x(20),
                    y: _y(20)
                })
                .simulate('mouseup', {
                    x: _x(20),
                    y: _y(20)
                });

            expect(renderable.isDragging).to.be(false);
        });

        it('onMouseUp will not trigger when not clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    x: _x(20),
                    y: _y(20)
                })
                .simulate('mouseup', {
                    x: _x(-20),
                    y: _y(-20)
                });

            expect(renderable.isDragging).to.be(true);
        });

        it('onClick will trigger when clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('click', {
                    x: _x(20),
                    y: _y(20)
                });

            expect(renderable.clicked).to.be(true);
        });

        it('onClick will not trigger when not clicked', function() {
            $viewport
                .simulate('mouseover')
                .simulate('click', {
                    x: _x(-20),
                    y: _y(-20)
                });

            expect(renderable.clicked).to.be(false);
        });

        it('will be at x position 30 after being dragged', function() {
            var start = 20;
            var end = 50;
            var delta = end - start;
            var step = 1;
            $viewport
                .simulate('mouseover')
                .simulate('drag', {
                    x: _x(start),
                    y: _y(start),
                    dx: delta,
                    dy: delta,
                    moves: end / step,
                    step: function() {
                        scene.render();
                    }
                });

            expect(renderable.x).to.be(renderableX + delta);
        });

        it('will be at x position ' + (width * 2) + ' after being dragged outside of layer', function() {
            var start = 20;
            var end = width * 2;
            var delta = end - start;
            var step = 20;
            $viewport
                .simulate('mouseover')
                .simulate('drag', {
                    x: _x(start),
                    y: _y(start),
                    dx: delta,
                    dy: delta,
                    moves: end / step,
                    step: function() {
                        scene.render();
                    }
                });

            expect(renderable.x).to.be(renderableX + delta);
        });
    });
});