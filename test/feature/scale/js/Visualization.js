define([
    'jquery',
    'assets/RunLoop',
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
        
        return this.setupHandlers().enable();
    };

    Visualization.prototype.setupHandlers = function() {
        this.updateCycle = this.update.bind(this);
        this.renderCycle = this.render.bind(this);
        this.onScaleUpHandler = this.onScaleUp.bind(this);
        this.onScaleDownHandler = this.onScaleDown.bind(this);

        return this;
    };

    Visualization.prototype.enable = function() {
        this.loop
            .addCall(this.updateCycle, RunLoop.UPDATE_CYCLE)
            .addCall(this.renderCycle, RunLoop.RENDER_CYCLE);

        $('#scale-up').on('click', this.onScaleUpHandler);
        $('#scale-down').on('click', this.onScaleDownHandler);

        return this;
    };

    Visualization.prototype.disable = function() {
        this.loop
            .removeCall(this.updateCycle, RunLoop.UPDATE_CYCLE)
            .removeCall(this.renderCycle, RunLoop.RENDER_CYCLE);

        $('#scale-up').off('click', this.onScaleUpHandler);
        $('#scale-down').off('click', this.onScaleDownHandler);

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

    Visualization.prototype.update = function(elapsed) {

    };
    
    Visualization.prototype.render = function() {
        this.scene.render();
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