define([
    'layer/Scene',
    'mock/renderable/CacheRectangle'
], function(
    Scene,
    CacheRectangle
) {
    'use strict';

    var TEST_VIEWPORT_ID = 'js-viewport';

    describe('Renderable RenderCache', function() {

        var scene;
        var viewport = document.getElementById(TEST_VIEWPORT_ID);
        var rectangle;
        var width = 500;
        var height = 500;
        var layerName = 'test';

        beforeEach(function() {
            scene = new Scene(viewport, width, height);
            scene.getStage().createAndAppendLayer(layerName).enableCSSAcceleration();
        });

        afterEach(function() {
            scene.destroy();
            scene = null;
        });

        it('will produce a DOM-level rendering exception without a supplied valid width', function() {
            try {
                rectangle = new CacheRectangle(0, 0, 0, 10);
                scene.addChild(rectangle);

                var hasFailed = false;
                scene.render();

                scene.removeChild(rectangle);
                rectangle = null;
            } catch (exception) {
                if (typeof exception !== 'string') {
                    expect(exception.name).to.be('INVALID_STATE_ERR');
                    expect(exception.code).to.be(11);
                } else {
                    expect(exception).to.be('RenderCache::init - Error: width and height must be greater than 0');
                }
                
                hasFailed = true;
            }

            expect(hasFailed).to.be(true);
        });

        it('will produce a DOM-level rendering exception without a supplied valid height', function() {
            try {
                rectangle = new CacheRectangle(0, 0, 10, 0);
                scene.addChild(rectangle);

                var hasFailed = false;
                scene.render();

                scene.removeChild(rectangle);
                rectangle = null;
            } catch (exception) {
                if (typeof exception !== 'string') {
                    expect(exception.name).to.be('INVALID_STATE_ERR');
                    expect(exception.code).to.be(11);
                } else {
                    expect(exception).to.be('RenderCache::init - Error: width and height must be greater than 0');
                }
                
                hasFailed = true;
            }

            expect(hasFailed).to.be(true);
        });
    });
});