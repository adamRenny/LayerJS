require([
	'layer/Geometry',
	'layer/HitEvent',
	'layer/RunLoop',
	'layer/Input',
	'layer/RenderMediator',
	'layer/RenderRequest',
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
	RenderRequest,
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
	layer.RenderRequest = RenderRequest;
	layer.Layer = Layer;
	layer.Stage = Stage;
	layer.Scene = Scene;
	layer.RenderCache = RenderCache;
	layer.Renderable = Renderable;
	layer.RenderableGroup = RenderableGroup;
	layer.PolarRenderable = PolarRenderable;
	layer.PolarRenderableGroup = PolarRenderableGroup;

	window.layer = layer;
});