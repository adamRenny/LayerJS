define([
    'jquery',
    'layer/RunLoop',
    'Box',
    'layer/Scene'
], function(
    $,
    RunLoop,
    Box,
    Scene
    ) {
    'use strict';

    var WIDTH = 250;
    var HEIGHT = 250;
    var BOX_WIDTH = 100;
    var BOX_HEIGHT = 100;

    var Visualization = function(wrapper) {
        if (wrapper !== undefined) {
            this.init(wrapper);
        }
    };

    Visualization.prototype.init = function(wrapper) {

        this.loop = new RunLoop();

        this.scene = new Scene(wrapper, WIDTH, HEIGHT);

        this.box = new Box(
            (WIDTH - BOX_WIDTH) * 0.5,
            (HEIGHT - BOX_HEIGHT) * 0.5,
            BOX_WIDTH,
            BOX_HEIGHT
        );

        this.scene.addChild(this.box, 0);

        this.$x = $('#x');
        this.$y = $('#y');

        return this.setupHandlers().enable();
    };

    Visualization.prototype.setupHandlers = function() {
        this.updateCycle = this.update.bind(this);
        this.renderCycle = this.render.bind(this);
        this.onScaleUpHandler = this.onScaleUp.bind(this);
        this.onScaleDownHandler = this.onScaleDown.bind(this);
        this.onChangeHandler = this.onChange.bind(this);

        return this;
    };

    Visualization.prototype.enable = function() {
        this.loop
            .addCall(this.updateCycle, RunLoop.UPDATE_CYCLE)
            .addCall(this.renderCycle, RunLoop.RENDER_CYCLE);

        $('#scale-up').on('click', this.onScaleUpHandler);
        $('#scale-down').on('click', this.onScaleDownHandler);
        this.$x.on('change', this.onChangeHandler);
        this.$y.on('change', this.onChangeHandler);

        return this;
    };

    Visualization.prototype.disable = function() {
        this.loop
            .removeCall(this.updateCycle, RunLoop.UPDATE_CYCLE)
            .removeCall(this.renderCycle, RunLoop.RENDER_CYCLE);

        $('#scale-up').off('click', this.onScaleUpHandler);
        $('#scale-down').off('click', this.onScaleDownHandler);
        this.$x.off('change', this.onChangeHandler);
        this.$y.off('change', this.onChangeHandler);

        return this;
    };

    Visualization.prototype.start = function() {
        this.loop.start();

        return this;
    };

    Visualization.prototype.stop = function() {
        this.loop.stop();

        return this
    };

    Visualization.prototype.update = function(elaapsed) {

    };

    Visualization.prototype.render = function() {
        this.scene.render();
    };

    Visualization.prototype.onChange = function() {
        var x = parseFloat(this.$x.val());
        var y = parseFloat(this.$y.val());

        this.box.setCenterPoint(x, y);
    };

    Visualization.prototype.onScaleDown = function() {
        this.box.scaleX -= 0.25;
        this.box.scaleY -= 0.25;
        this.box.setNeedsUpdate();
    };

    Visualization.prototype.onScaleUp = function() {
        this.box.scaleX += 0.25;
        this.box.scaleY += 0.25;
        this.box.setNeedsUpdate();
    };

    return Visualization;
});