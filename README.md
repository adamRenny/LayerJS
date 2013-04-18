# LayerJS

## Canvas Rendering Library
LayerJS is a graphics rendering library.
LayerJS focuses on using multiple ```<canvas>``` elements to optimize its render cycle.
    
[LayerJS Testbeds](http://adamrenny.github.com/LayerJS/)
    
## Licensing
LayerJS is licensed under the [MIT license](http://opensource.org/licenses/mit-license.html).

LayerJS includes functional polyfills for ```Array#indexOf``` and ```Function#bind``` within ```dependency.js```. These are licensed under the [MPL license](http://www.mozilla.org/MPL/2.0/).

The ```dependency.js``` is intended to be included separate from the project distribution file to avoid infringing on any sort of licensing breaches that would occur with compilation of the EventBus and the project it is used in.

The other dependencies:
 - [gl-matrix](https://github.com/toji/gl-matrix)
 - [almond](https://github.com/jrburke/almond)
 
Are all licensed and owned by their respectful owners and contributors.

The [gl-matrix](https://github.com/toji/gl-matrix) used in this has a modified 2D matrix suite that is intended to be pushed to the repository at a later date.

## Features

### Scene Graph
The system uses a Scene Graph to organize its contents. 
Drawable, Graphics, Scene Nodes, or Display objects are referred to as a ```Renderable```. 
Each layer is comprised of its own graph, with every layer representing a single root node. 
Standard group nodes are known as ```RenderableGroup```, and can store any number of child ```Renderable``` objects.
Leaf nodes, or end-of-the-graph graphics are called simply ```Renderable``` objects.

### Hit Detection
Hit detection uses a bubbling event system for standard mouse events such as click, mouse move, and mouse up/down. 
Hit detection follows a world matrix and local matrix construct to translate mouse clicks into the local coordinates of the object that was hit. 
When a layer is hit test, the detection will collect a stack of elements triggering such that it starts with the front-most layer.
Hit detection is currently limited to a rectangular hit box.

### Layers
Each layer on the scene is a canvas element. 
Layers include their own single root node as the beginning of their scene graph. 
Layers include a ```Stage``` object that stores the metadata such as size, and include an API to push CSS acceleration via matrix3d. 
Note that a scene that has some layers with CSS acceleration and others without CSS acceleration may have rendering issues that happen on the browser-level.

### Loop Controller
To manage the run loop, LayerJS may use a Loop Controller to manage it. 
The loop controller's sole responsibility is to run the application under the run loop. 
LayerJS employs the use of an external ```RunLoop``` as the core engine component. This is available at the [RunLoop Repo](https://github.com/adamRenny/RunLoop).
This looping structure is meant to have calls added to it but can have its render and update loops overwritten after extension if desired. This may be replaced by any other animation engine, such as [greensock](http://www.greensock.com/gsap-js/).

### Render Cache
Idea courtesy of [Ash Blue](http://blueashes.com/), this library includes a ```RenderCache``` object used to cache renderings for re-use. 
This feature has not yet been expanded upon and is built to be used for backbuffering or pre-rendering.

### Event Bus
As do many other constructs, LayerJS totes a small ```EventBus``` component following the publish-subscribe pattern to communicate internally. The EventBus can be found at [this repo](https://github.com/adamRenny/Events).

## Markup
Markup requirements only require a single div or block. 
Canvas layers may either be created and attached on the fly by the developer using the Stage API, or may have elements already in the div, ready to go. 
Keep in mind that canvas elements within the div will be sized to the Stage's width/height. 
While included in the test examples for the LayerJS library, it is a good idea to absolutely position the canvas elements within the wrapping div. 
Doing so allows the elements to overlay and overlap.

Without elements
-----
```html
<div id="js-canvas-wrapper">
    <!-- Canvas Elements -->
</div>
```

With elements
-----
```html
<div id="js-canvas-wrapper">
    <canvas id="background">Please download a browser that supports HTML5 Canvas</canvas>
    <canvas id="actors">Please download a browser that supports HTML5 Canvas</canvas>
    <canvas id="foreground">Please download a browser that supports HTML5 Canvas</canvas>
</div>
```

## Dependencies
 - [gl-matrix](https://github.com/toji/gl-matrix)
 - [almond](https://github.com/jrburke/almond)
 
### Notes
The [glMatrix](https://github.com/toji/gl-matrix) package is a forked glMatrix package that extrapolates a 2d set of matrix operations.
