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
    var layerName = 'input-test';
    var position = { x: 50, y: 50 };

    var OUTPUT = {};

    OUTPUT.$viewport = jQuery(viewport);
    OUTPUT.width = 500;
    OUTPUT.height = 500;

    OUTPUT.scene = null;
    OUTPUT.input = null;
    OUTPUT.layer = null;
    OUTPUT.renderable = null;

    OUTPUT.renderableX = 20;
    OUTPUT.renderableY = 20;
    OUTPUT.renderableWidth = 100;
    OUTPUT.renderableHeight = 100;

    var viewportCss = {
        position: 'fixed', // Needs to be fixed to resolve mocha auto scrolling when printing test results.
        left: position.x,
        top: position.y,
        pointerEvents: 'none' // Ignore real mouse events
    };

    var _x = function(delta) {
        return OUTPUT.renderableX + position.x + delta;
    };

    var _y = function(delta) {
        return OUTPUT.renderableY + position.y + delta;
    };

    var _beforeEach = function() {

        OUTPUT.scene = new Scene(viewport, OUTPUT.width, OUTPUT.height);
        OUTPUT.input = OUTPUT.scene.input;

        OUTPUT.layer = OUTPUT.scene
            .getStage()
            .createAndAppendLayer(layerName)
            .enableCSSAcceleration()
            .getLayerByName(layerName);

        OUTPUT.renderable = new Renderable(
            OUTPUT.renderableX,
            OUTPUT.renderableY,
            OUTPUT.renderableWidth,
            OUTPUT.renderableHeight
        );

        OUTPUT.layer
            .getRoot()
            .addChild(OUTPUT.renderable);

        OUTPUT.$viewport.css(viewportCss);
        OUTPUT.scene.render();
    };

    var _afterEach = function() {
        OUTPUT.$viewport.simulate('mouseout');
        OUTPUT.$viewport.simulate('touchend');
        OUTPUT.scene.destroy();

        OUTPUT.input = null;
        OUTPUT.renderable = null;
        OUTPUT.layer = null;
        OUTPUT.scene = null;

        OUTPUT.$viewport.removeAttr('style').empty();
    };

    OUTPUT.beforeEach = _beforeEach;
    OUTPUT.afterEach = _afterEach;
    OUTPUT.x = _x;
    OUTPUT.y = _y;

    return OUTPUT;
});