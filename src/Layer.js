require([
	'layer/Geometry',
	'layer/HitEvent',
	'layer/RunLoop',
	'layer/Input',
	'layer/RenderMediator',
	'layer/Layer',
	'layer/Stage',
	'layer/Scene',
	'layer/RenderCache',
	'layer/Renderable',
	'layer/RenderableGroup',
	'layer/polar/PolarRenderable',
	'layer/polar/PolarRenderableGroup'
], function(
	Geometry,
	HitEvent,
	RunLoop,
	Input,
	RenderMediator,
	Layer,
	Stage,
	Scene,
	RenderCache,
	Renderable,
	RenderableGroup,
	PolarRenderable,
	PolarRenderableGroup
) {
	'use strict';

	var layer = {};
	
	layer.Geometry = Geometry;
	layer.HitEvent = HitEvent;
	layer.RunLoop = RunLoop;
	layer.Input = Input;
	layer.RenderMediator = RenderMediator;
	layer.Layer = Layer;
	layer.Stage = Stage;
	layer.Scene = Scene;
	layer.RenderCache = RenderCache;
	layer.Renderable = Renderable;
	layer.RenderableGroup = RenderableGroup;
	layer.PolarRenderable = PolarRenderable;
	layer.PolarRenderableGroup = PolarRenderableGroup;

	// UMD Pattern used in conjunction with build.js's wrapper
	if (root !== null) {
		root.layer = layer;
	}
});