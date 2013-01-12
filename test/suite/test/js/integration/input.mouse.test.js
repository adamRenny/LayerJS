define([
    'layer/Scene',
    'mock/renderable/Renderable',
    'integration/input.test.helper'
], function(
    Scene,
    Renderable,
    Helper
) {
    'use strict';

    describe('Input (Mouse)', function() {

        beforeEach(Helper.beforeEach);
        afterEach(Helper.afterEach);

        it('will be active on mouseover and will be inactive on mouseout', function() {
            Helper.$viewport.simulate('mouseover');

            expect(Helper.input.enabled).to.be(true);

            Helper.$viewport.simulate('mouseout');

            expect(Helper.input.enabled).to.be(false);
        });

        it('will be inactive on mouseout (without mouseover)', function() {
            Helper.$viewport.simulate('mouseout');

            expect(Helper.input.enabled).to.be(false);
        });

        it('will be in drag mode on mousedown, on mouseout, and not be in drag mode on mouseup', function() {
            Helper.$viewport
                .simulate('mouseover')
                .simulate('mousedown', {
                    pageX: Helper.x(20),
                    pageY: Helper.y(20)
                });

            expect(Helper.input.isDragging).to.be(true);

            Helper.$viewport
                .simulate('mousemove', {
                    pageX: Helper.x(-200),
                    pageY: Helper.y(-220)
                });

            expect(Helper.input.isDragging).to.be(true);

            Helper.$viewport
                .simulate('mouseup', {
                    pageX: Helper.x(20),
                    pageY: Helper.y(20)
                });

            expect(Helper.input.isDragging).to.be(false);
        });

        it('will be active when dragging outside bounds and still be considered as mouseover', function() {
            var start = 20;
            var end = Helper.width * 2;
            var delta = end - start;
            var step = 20;
            Helper.$viewport
                .simulate('mouseover')
                .simulate('drag', {
                    pageX: Helper.x(start),
                    pageY: Helper.y(start),
                    dx: delta,
                    dy: delta,
                    moves: end / step,
                    step: function() {
                        Helper.scene.render();
                    }
                });

            expect(Helper.input.enabled).to.be(true);
            expect(Helper.input.isMouseOver).to.be(true);
        });

        it('will not be mouse over when dragging outside bounds and releasing mouse', function() {
            var start = 20;
            var end = Helper.width * 2;
            var delta = end - start;
            var step = 20;
            Helper.$viewport
                .simulate('mouseover')
                .simulate('drag', {
                    pageX: Helper.x(start),
                    pageY: Helper.y(start),
                    dx: delta,
                    dy: delta,
                    moves: end / step,
                    step: function() {
                        Helper.scene.render();
                    }
                })
                .simulate('mouseout')
                .simulate('mouseup');

            expect(Helper.input.isMouseOver).to.be(false);
        });

        describe('Renderable', function() {

            it('onMouseOver will trigger when moused over', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('mousemove', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    });

                expect(Helper.renderable.isOver).to.be(true);
            });

            it('onMouseOver will not trigger when not moused over', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('mousemove', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    });

                expect(Helper.renderable.isOver).to.be(false);
            });

            it('onMouseOut will trigger when moused out', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('mousemove', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    })
                    .simulate('mousemove', {
                        pageX: Helper.x(-10),
                        pageY: Helper.y(-10)
                    });

                expect(Helper.renderable.isOver).to.be(false);
            });

            it('onMouseOut will trigger when moused out of layer', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('mousemove', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    })
                    .simulate('mousemove', {
                        pageX: Helper.x(-200),
                        pageY: Helper.y(-200)
                    });

                expect(Helper.renderable.isOver).to.be(false);
            });

            it('onMouseDown will trigger when clicked', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('mousedown', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    });

                expect(Helper.renderable.isDragging).to.be(true);
            });

            it('onMouseDown will not trigger when not clicked', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('mousedown', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    });

                expect(Helper.renderable.isDragging).to.be(false);
            });

            it('onMouseMove will trigger when over', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('mousemove', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    });

                expect(Helper.renderable.isOver).to.be(true);
            });

            it('onMouseMove will not trigger when not over', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('mousemove', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    });

                expect(Helper.renderable.isOver).to.be(false);
            });

            it('onMouseUp will trigger when clicked', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('mousedown', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    })
                    .simulate('mouseup', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    });

                expect(Helper.renderable.isDragging).to.be(false);
            });

            it('onMouseUp will not trigger when not clicked', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('mousedown', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    })
                    .simulate('mouseup', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    });

                expect(Helper.renderable.isDragging).to.be(true);
            });

            it('onClick will trigger when clicked', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('click', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    });

                expect(Helper.renderable.clicked).to.be(true);
            });

            it('onClick will not trigger when not clicked', function() {
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('click', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    });

                expect(Helper.renderable.clicked).to.be(false);
            });

            it('will be at x position 30 after being dragged', function() {
                var start = 20;
                var end = 50;
                var delta = end - start;
                var step = 1;
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('drag', {
                        pageX: Helper.x(start),
                        pageY: Helper.y(start),
                        dx: delta,
                        dy: delta,
                        moves: end / step,
                        step: function() {
                            Helper.scene.render();
                        }
                    });

                expect(Helper.renderable.x).to.be(Helper.renderableX + delta);
            });

            it('will be at x position ' + (Helper.width * 2) + ' after being dragged outside of layer', function() {
                var start = 20;
                var end = Helper.width * 2;
                var delta = end - start;
                var step = 20;
                Helper.$viewport
                    .simulate('mouseover')
                    .simulate('drag', {
                        pageX: Helper.x(start),
                        pageY: Helper.y(start),
                        dx: delta,
                        dy: delta,
                        moves: end / step,
                        step: function() {
                            Helper.scene.render();
                        }
                    });

                expect(Helper.renderable.x).to.be(Helper.renderableX + delta);
            });
        });
    });
});