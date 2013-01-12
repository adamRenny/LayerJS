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

    describe('Input (Touch)', function() {

        beforeEach(Helper.beforeEach);
        afterEach(Helper.afterEach);

        it('will be active on touchstart and will be inactive on touchend', function() {
            Helper.$viewport.simulate('touchstart', {
                pageX: Helper.x(20),
                pageY: Helper.y(20)
            });

            expect(Helper.input.enabled).to.be(true);

            Helper.$viewport.simulate('touchend', {
                pageX: Helper.x(20),
                pageY: Helper.y(20)
            });

            expect(Helper.input.enabled).to.be(false);
        });

        it('will be inactive on touched (without touchstart)', function() {
            Helper.$viewport.simulate('touchend', {
                pageX: Helper.x(20),
                pageY: Helper.y(20)
            });

            expect(Helper.input.enabled).to.be(false);
        });

        it('will be in drag mode on touchstart, on touchmove, and not be in drag mode on touchup', function() {
            Helper.$viewport
                .simulate('touchstart', {
                    pageX: Helper.x(20),
                    pageY: Helper.y(20)
                });

            expect(Helper.input.isDragging).to.be(true);

            Helper.$viewport
                .simulate('touchmove', {
                    pageX: Helper.x(-200),
                    pageY: Helper.y(-220)
                });

            expect(Helper.input.isDragging).to.be(true);

            Helper.$viewport
                .simulate('touchend', {
                    pageX: Helper.x(20),
                    pageY: Helper.y(20)
                });

            expect(Helper.input.isDragging).to.be(false);
        });

        it('will be active when dragging outside bounds and still be considered as over', function() {
            var start = 20;
            var end = Helper.width * 2;
            var delta = end - start;
            var step = 20;
            Helper.$viewport
                .simulate('touchstart', {
                    pageX: Helper.x(20),
                    pageY: Helper.y(20)
                })
                .simulate('touchdrag', {
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
                .simulate('touchstart', {
                    pageX: Helper.x(start),
                    pageY: Helper.y(start)
                })
                .simulate('touchdrag', {
                    pageX: Helper.x(start),
                    pageY: Helper.y(start),
                    dx: delta,
                    dy: delta,
                    moves: end / step,
                    step: function() {
                        Helper.scene.render();
                    }
                })
                .simulate('touchend', {
                    pageX: Helper.x(end),
                    pageY: Helper.y(end)
                });

            expect(Helper.input.enabled).to.be(false);
            expect(Helper.input.isMouseOver).to.be(false);
        });

        describe('Renderable', function() {

            it('onMouseOver will trigger when touched', function() {
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    })
                    .simulate('touchmove', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    });

                expect(Helper.renderable.isOver).to.be(true);
            });

            it('onMouseOver will not trigger when not touched', function() {
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    })
                    .simulate('touchmove', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    });

                expect(Helper.renderable.isOver).to.be(false);
            });

            it('onMouseOut will trigger when touched outside and dragged', function() {
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    })
                    .simulate('touchmove', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    });

                expect(Helper.renderable.isOver).to.be(false);
            });

            it('onMouseDown will trigger when touched', function() {
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    })
                    .simulate('touchmove', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    });

                expect(Helper.renderable.isDragging).to.be(true);
            });

            it('onMouseDown will not trigger when not touched', function() {
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    })
                    .simulate('touchmove', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    });

                expect(Helper.renderable.isDragging).to.be(false);
            });

            it('onMouseMove will trigger when over', function() {
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    })
                    .simulate('touchmove', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    });

                expect(Helper.renderable.isOver).to.be(true);
            });

            it('onMouseMove will not trigger when not over', function() {
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    });

                expect(Helper.renderable.isOver).to.be(false);
            });

            it('onMouseUp will trigger on touchend', function() {
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    })
                    .simulate('touchend', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    });

                expect(Helper.renderable.isDragging).to.be(false);
            });

            it('onMouseUp will not trigger when not clicked', function() {
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    })
                    .simulate('touchend', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    });

                expect(Helper.renderable.isDragging).to.be(true);
            });

            it('onClick will trigger when clicked', function() {
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(0),
                        pageY: Helper.y(0)
                    })
                    .simulate('click', {
                        pageX: Helper.x(20),
                        pageY: Helper.y(20)
                    });

                expect(Helper.renderable.clicked).to.be(true);
            });

            it('onClick will not trigger when not clicked', function() {
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(0),
                        pageY: Helper.y(0)
                    })
                    .simulate('click', {
                        pageX: Helper.x(-20),
                        pageY: Helper.y(-20)
                    });

                expect(Helper.renderable.clicked).to.be(false);
            });

            it('will be at x position 50 after being dragged', function() {
                var start = 20;
                var end = 50;
                var delta = end - start;
                var step = 1;
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(start),
                        pageY: Helper.y(start)
                    })
                    .simulate('touchdrag', {
                        pageX: Helper.x(start),
                        pageY: Helper.y(start),
                        dx: delta,
                        dy: delta,
                        moves: end / step,
                        step: function() {
                            Helper.scene.render();
                        }
                    })
                    .simulate('touchend', {
                        pageX: Helper.x(end),
                        pageY: Helper.y(end)
                    });

                expect(Helper.renderable.x).to.be(Helper.renderableX + delta);
            });

            it('will be at x position ' + (Helper.width * 2) + ' after being dragged outside of layer', function() {
                var start = 20;
                var end = Helper.width * 2;
                var delta = end - start;
                var step = 20;
                Helper.$viewport
                    .simulate('touchstart', {
                        pageX: Helper.x(start),
                        pageY: Helper.y(start)
                    })
                    .simulate('touchdrag', {
                        pageX: Helper.x(start),
                        pageY: Helper.y(start),
                        dx: delta,
                        dy: delta,
                        moves: end / step,
                        step: function() {
                            Helper.scene.render();
                        }
                    })
                    .simulate('touchend', {
                        pageX: Helper.x(end),
                        pageY: Helper.y(end)
                    });

                expect(Helper.renderable.x).to.be(Helper.renderableX + delta);
            });
        });
    });
});