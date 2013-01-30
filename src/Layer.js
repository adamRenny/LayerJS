/*global root:true */
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * trigger, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * LayerJS Module Definition
 * @author Adam Ranfelt
 * @author Aaron Gloege
 * @version 1.2
 */

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
}, undefined, true);