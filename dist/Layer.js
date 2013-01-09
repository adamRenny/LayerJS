(function(root, factory) {if (typeof exports === 'object') {// Node. Does not work with strict CommonJS, but// only CommonJS-like enviroments that support module.exports,// like Node.module.exports = factory(global);} else if (typeof define === 'function' && define.amd) {// AMD. Register as an anonymous module.define([], function() {// Not using a global object to avoid setting globallyreturn factory(null);});} else {// Browser globalsfactory(root);}}(this, function(root) {
/**
 * almond 0.2.3 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());
define("../tool/compiler/almond", function(){});

/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * Geometry Module Definition
 * @author Adam Ranfelt 
 * @version 1.1
 */
define('layer/Geometry',[],function() {
    
    
    /**
     * Geometry Utility Structure
     *
     * @name Geometry
     * @namespace Geometry functional utility set
     * @since 1.0
     */
    var Geometry = {
        /**
         * Cached PI constant
         *
         * @private
         * @type {number}
         * @constant
         * @since 1.1
         */
        PI: Math.PI,
        
        /**
         * Cached 2 * PI constant
         *
         * @private
         * @type {number}
         * @constant
         * @since 1.1
         */
        TWO_PI: Math.PI * 2,
        
        /**
         * Cached half PI constant
         *
         * @private
         * @type {number}
         * @constant
         * @since 1.1
         */
        HALF_PI: Math.PI * .5,
        
        /**
         * Checks whether a point is within a rectangle
         * Does consider edge collisions
         *
         * @function
         * @name Geometry.isPointInRect
         * @param {number} x X Position
         * @param {number} y Y Position
         * @param {number} rectX Rectangle's X Position
         * @param {number} rectY Rectangle's Y Position
         * @param {number} rectWidth Rectangle's Width
         * @param {number} rectHeight Rectangle's Height
         * @returns {boolean}
         * @since 1.0
         */
        isPointInRect: function(x, y, rectX, rectY, rectWidth, rectHeight) {
            return !(x < rectX || x > rectX + rectWidth || y < rectY || y > rectY + rectHeight);
            // return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
        },
        
        /**
         * Checks whether a rectangle is within a rectangle
         *
         * @function
         * @name Geometry.isPointInRect
         * @param {number} l1 Left 1
         * @param {number} r1 Right 1
         * @param {number} t1 Top 1
         * @param {number} b1 Bottom 1
         * @param {number} l2 Left 2
         * @param {number} r2 Left 2
         * @param {number} t2 Left 2
         * @param {number} b2 Left 2
         * @returns {boolean}
         * @since 1.0
         */
        isRectInRect: function(l1, r1, t1, b1, l2, r2, t2, b2) {
            return l2 <= r1
                && r2 >= l1
                && t2 <= b1
                && b2 >= t1;
        },

        /**
         * Get distance between two points
         *
         * @function
         * @name Geometry.getDistanceBetweenPoints
         * @param {number} x1 Point 1's X Position
         * @param {number} y1 Point 1's Y Position
         * @param {number} x2 Point 2's X Position
         * @param {number} y2 Point 2's Y Position
         * @returns {number}
         */
        getDistanceBetweenPoints: function(x1, y1, x2, y2) {
            return Math.sqrt(this.getSquaredDistanceBetweenPoints(x1, y1, x2, y2));
        },
        
        /**
         * Get squared distance between two points
         *
         * @function
         * @name Geometry.getDistanceBetweenPoints
         * @param {number} x1 Point 1's X Position
         * @param {number} y1 Point 1's Y Position
         * @param {number} x2 Point 2's X Position
         * @param {number} y2 Point 2's Y Position
         * @returns {number}
         */
        getSquaredDistanceBetweenPoints: function(x1, y1, x2, y2) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            return (dx * dx) + (dy * dy);
        },

        /**
         * Check whether a point is within a circle
         *
         * @function
         * @name Geometry.isPointInCirc
         * @param {number} x X Position
         * @param {number} y Y Position
         * @param {number} circCenterX Circle's center X Position
         * @param {number} circCenterY Circle's center Y Position
         * @param {number} radius Circle's radius
         * @returns {boolean}
         */
        isPointInCircle: function(x, y, circCenterX, circCenterY, radius) {
            return this.getSquaredDistanceBetweenPoints(x, y, circCenterX, circCenterY) < (radius * radius);
        },
        
        /**
         * Checks whether a point in polar coordinates is within a defined radial width
         *
         * @function
         * @name Geometry.isPolarPointInPolarArea
         * @param {number} r1 Radius of the point to test
         * @param {number} t1 Theta of the point to test
         * @param {number} r2 Radius of the polar area
         * @param {number} st2 Starting theta of the polar area
         * @param {number} et2 Ending theta of the polar area
         * @returns {boolean}
         * @since 1.1
         */
        isPolarPointInPolarArea: function(r1, t1, r2, st2, et2) {
            return r1 <= r2 && t1 >= st2 && t1 <= et2;
        }
    };
    
    return Geometry;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * HitEvent Module Definition
 * @author Adam Ranfelt 
 * @version 1.1
 */
define('layer/HitEvent',[],function() {
    
    
    /**
     * Hit Event Callback Method Names
     * Maps the event name to the respective method name
     * 
     * @private
     * @type {object}
     * @since 1.0
     */
    var _hitCallbackMethods = {
        mousemove: 'onMouseMove',
        mouseup: 'onMouseUp',
        mousedown: 'onMouseDown',
        click: 'onClick',
        mouseover: 'onMouseOver',
        mouseout: 'onMouseOut'
    };
    
    /**
     * HitEvent Constructor
     *
     * Event that represents a hit position
     * Built for user interaction with hit positions
     * Handles mouse events
     * Transient and intended to be primarily immutable
     * Not intended to be extended
     * 
     * @name HitEvent
     * @class Event to represent a user interaction hit point
     * @constructor
     *
     * @throws {UndefinedError} If type is unsupported or undefined
     * @throws {ArgumentsError} If x or y is undefined or NaN
     *
     * @param {string} type Hit Event Type Name
     * @param {number} x X Hit position
     * @param {number} y Y Hit position
     * @param {Scene} source Hit source the hit originates from, could potentially be anything, but should be Scene at a minimum
     * @param {boolean} bubbles Whether the event should bubble, optional
     * @since 1.0
     */
    var HitEvent = function(type, x, y, hitTarget, bubbles) {
        // Only handle the hit if it supports the hit type
        if (!_hitCallbackMethods.hasOwnProperty(type)) {
            throw new Error('UndefinedError: HitEvent for ' + type + ' does not exist');
        }
        
        // Handle the x and y only if they are defined and a number
        if (x === undefined || typeof x !== 'number'
           || y === undefined || typeof y !== 'number'
        ) {
            throw new Error('ArgumentsError: Error with x or y coordinates');
        }
        
        /**
         * Event type of the hit event
         * Uses the event type constants
         *
         * @name HitEvent#type
         * @type {string}
         * @since 1.0
         */
        this.type = type;
        
        /**
         * Name of the callback relative to the hit type
         *
         * @name HitEvent#callback
         * @type {string}
         * @since 1.0
         */
        this.callback = _hitCallbackMethods[type];
        
        /**
         * X Position of the Hit
         *
         * @name HitEvent#x
         * @type {number}
         * @since 1.0
         */
        this.x = x;
        
        /**
         * Y Position of the Hit
         *
         * @name HitEvent#y
         * @type {number}
         * @since 1.0
         */
        this.y = y;
        
        /**
         * Hit target structure to access the renderable that were hit
         * Uses an array to represent a stack of targets in order of topmost to bottommost
         * Uses a single renderable when there is only one target
         *
         * @name HitEvent#hitTarget
         * @type {Renderable[]|Renderable}
         * @since 1.0
         */
        this.hitTarget = hitTarget;
        
        /**
         * Bubbles flag to decide whether the event should bubble
         * When overridden in the event handler, the event will discontinue execution
         *
         * @default false
         * @name HitEvent#bubbles
         * @type {boolean}
         * @since 1.0
         */
        this.bubbles = bubbles || false;
        
        // Execute the hit only if the hit stack has actionable targets
        if ((hitTarget instanceof Array && hitTarget.length)
            || (!(hitTarget instanceof Array) && hitTarget !== null)
        ) {
            this.executeHit();
        }
    };
    
    /**
     * Executes the actual hit by calling the callback for each hit Renderable object
     * Uses the hitTarget to execute on by iterating through
     * Uses the hitTarget as a single executable to iterate through
     *
     * @private
     * @since 1.0
     */
    HitEvent.prototype.executeHit = function() {
        var callbackName = this.callback;
        var hitTarget = this.hitTarget;
        
        if (hitTarget instanceof Array) {
            var i = hitTarget.length - 1 || 0;
            var hitRenderable;

            do {
                hitRenderable = hitTarget[i];
                if (hitRenderable[callbackName] !== undefined) {
                    hitRenderable[callbackName](this);
                }
                i--;
            } while (i >= 0 && this.bubbles === true);
        } else {
            if (hitTarget[callbackName] !== undefined) {
                hitTarget[callbackName](this);
            }
        }
    };
    
    /**
     * Mousemove event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    HitEvent.MOUSE_MOVE = 'mousemove';
    
    /**
     * Mouseup event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    HitEvent.MOUSE_UP = 'mouseup';
    
    /**
     * Mousedown event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    HitEvent.MOUSE_DOWN = 'mousedown';
    
    /**
     * Click event name
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    HitEvent.CLICK = 'click';
    
    /**
     * Mouseover event name
     *
     * @type {string}
     * @constant
     * @since 1.1
     */
    HitEvent.MOUSE_OVER = 'mouseover';
    
    /**
     * Mouseout event name
     *
     * @type {string}
     * @constant
     * @since 1.1
     */
    HitEvent.MOUSE_OUT = 'mouseout';
    
    return HitEvent;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * requestAnimFrame polyfill Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */

// Updated to use a modification of the "returnExportsGlobal" pattern from https://github.com/umdjs/umd

(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(global);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('lib/requestAnimFrame',[], function () {
            return factory(root);
        });
    } else {
        // Browser globals
        factory(root);
    }
}(this, function (root, undefined) {
	var FRAMERATE = 1000 / 60;

	var noop = function() {};

	var requestAnimFrame = null;
	var cancelAnimFrame = null;

	var requestAnimationFrameName = 'requestAnimationFrame';
	var cancelAnimationFrameName = 'cancelAnimationFrame';
	var vendorPrefixes = [
		'',
		'webkit',
		'moz',
		'o',
		'ms'
	];

	var activeVendorPrefix = null;

	var getVendorFunctionName = function(functionName, prefix) {
		var vendorFunctionName = prefix + (functionName.substr(0, 1).toUpperCase()) + functionName.substr(1);
		vendorFunctionName = vendorFunctionName.substr(0, 1).toLowerCase() + vendorFunctionName.substr(1);
		return vendorFunctionName;
	};

	var requestAnimFrame = (function() {
		var i = 0;
		var length = vendorPrefixes.length;
		var vendorPrefix;
		var requestMethodName;
		var requestMethod;
		for (; i < length; i++) {
			vendorPrefix = vendorPrefixes[i];
			requestMethodName = getVendorFunctionName(requestAnimationFrameName, vendorPrefix);
			if (root[requestMethodName] !== undefined) {
				requestMethod = root[requestAnimFrame];
				activeVendorPrefix = vendorPrefixes[i];
				break;
			}
		}

		if (requestMethod === undefined) {
			requestMethod = function(callback) {
				return root.setTimeout(callback, FRAMERATE);
			};
		}

		return requestMethod;
	}());

	var cancelAnimFrame = (function() {
		var cancelMethod;

		if (activeVendorPrefix === null) {
			return root.clearTimeout;
		}

		var cancelMethodName = getVendorFunctionName(cancelAnimationFrameName, activeVendorPrefix);
		if (root[cancelMethodName] !== undefined) {
			cancelMethod = root[cancelMethodName];
		} else {
			cancelMethod = noop;
		}

		return cancelMethod;
	}());

	if (root) {
		root.requestAnimFrame = requestAnimFrame;
		root.cancelAnimFrame = cancelAnimFrame;
	}

	return {
		requestAnimFrame: requestAnimFrame,
		cancelAnimFrame: cancelAnimFrame
	};
}));
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * RunLoop Module Definition
 * @author Adam Ranfelt 
 * @version 1.2
 */
define('layer/RunLoop',[
    'lib/requestAnimFrame'
], function(
    rAF
) {
    
    
    /**
     * requestAnimationFrame Polyfill
     * Request animation frame call structure to perform a callback after the next frame is ready
     * Requests another frame, which should function at roughly 60 frames per second
     *
     * @private
     * @function
     * @param {function} callback Callback function to callback after requestAnimFrame returns an animation frame
     * @returns {*} Opaque reference to the animation frame
     * @since 1.2
     */
    var requestAnimFrame = rAF.requestAnimFrame;
    
    /**
     * cancelAnimationFrame Polyfill
     * Cancel animation frame call structure to cancel a callback for the next frame
     * Cancels the next frame callback, which should function at roughly 60 frames per second
     *
     * @private
     * @function
     * @param {*} requestedAnimationFrame Opaque reference to the animation frame
     * @since 1.2
     */
    var cancelAnimFrame = rAF.cancelAnimFrame;
    
    /**
     * Max number of milliseconds allowed within a frame
     * Essentially 2.5 fps
     * Built to handle the fast-forward bug where when a tab is left, the animations will "fast-forward"
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.0
     */
    var FRAME_THRESHOLD = 400;
    
    /**
     * Index to indicate that an element was not found
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.1
     */
    var NOT_FOUND_INDEX = -1;
    
    /**
     * Inserts a call into a cycle object at the given index
     * If the index is out of bounds, the index will be clamped to the size
     *
     * @param {function[]} cycle Call cycle collection
     * @param {function} call Function to call
     * @param {number} index Index to insert the call into, if undefined will push to the end
     * @since 1.1
     */
    var _insertCallToCycle = function(cycle, call, index) {
        if (index === undefined || index >= cycle.length) {
            cycle.push(call);
        } else if (index < 0) {
            cycle.unshift(call);
        } else {
            cycle.splice(index, 0, call);
        }
    };
    
    /**
     * Removes a call from a cycle object
     *
     * @throws {UndefinedError} If the call does not exist
     *
     * @param {function[]} cycle Call cycle collection
     * @param {function} call Function to call
     * @since 1.1
     */
    var _removeCallFromCycle = function(cycle, call) {
        var callIndex = cycle.indexOf(call);
        
        if (callIndex === NOT_FOUND_INDEX) {
            throw new Error('UndefinedError: call has not been added');
        }
        
        cycle.splice(callIndex, 1);
    };
    
    /**
     * RunLoop Constructor
     *
     * RunLoop runs a run loop with an update and render cycle
     * Dynamically timed
     * Uses requestAnimFrame to manage the run loop
     *
     * @name RunLoop
     * @class Run Loop Controller
     * @constructor
     * @since 1.0
     */
    var RunLoop = function() {
        this.init();
    };
    
    /**
     * Initializes the run loop by setting up the state and binding the step function
     *
     * @returns {RunLoop}
     * @since 1.0
     */
    RunLoop.prototype.init = function() {
        /**
         * Last timestamp that was hit in milliseconds
         *
         * @name RunLoop#lastTimestamp
         * @type {number}
         * @since 1.0
         */
        this.lastTimestamp = Date.now();
        
        /**
         * Flag for whether or not the RunLoop is looping
         *
         * @default false
         * @name RunLoop#isLooping
         * @type {boolean}
         * @since 1.0
         */
        this.isLooping = false;
        
        /**
         * Scope-bound version of the _step function
         *
         * @function
         * @name RunLoop#step
         * @type {function}
         * @since 1.0
         */
        this.step = this._step.bind(this);
        
        this.updateCallCycle = [];
        this.renderCallCycle = [];
        
        return this;
    };
    
    /**
     * Begins the run loop
     *
     * @returns {RunLoop}
     * @since 1.0
     */
    RunLoop.prototype.start = function() {
        this.isLooping = true;
        this.lastTimestamp = Date.now();
        requestAnimFrame(this.step);
        
        return this;
    };
    
    /**
     * Stops the run loop
     *
     * @returns {RunLoop}
     * @since 1.0
     */
    RunLoop.prototype.stop = function() {
        this.isLooping = false;
        cancelAnimFrame(this.step);
        
        return this;
    };
    
    /**
     * Adds a call function to the loop
     *
     * @throws {ArgumentsError} If the type is not a cycle enumeration
     * @throws {ArgumentsError} If the call is not defined or a function
     *
     * @param {function} call Function to call during the cycle
     * @param {number} Cycle type to add it to, may be both
     * @returns {RunLoop}
     * @since 1.1
     */
    RunLoop.prototype.addCall = function(call, type) {
        if (type === undefined || type <= RunLoop.NO_CYCLE || type > RunLoop.ALL_CYCLES) {
            throw new Error('ArgumentsError: type must be of type CYCLE enumeration');
        }
        
        if (call === undefined || typeof call !== 'function') {
            throw new Error('ArgumentsError: call must be of type function');
        }
        
        if (type & RunLoop.UPDATE_CYCLE) {
            _insertCallToCycle(this.updateCallCycle, call);
        }
        
        if (type & RunLoop.RENDER_CYCLE) {
            _insertCallToCycle(this.renderCallCycle, call);
        }
        
        return this;
    };
    
    /**
     * Inserts a call function to the loop at a specified index
     *
     * @throws {ArgumentsError} If the type is not a cycle enumeration
     * @throws {ArgumentsError} If the call is not defined or a function
     * @throws {ArgumentsError} If the index is not a type of number
     *
     * @param {function} call Function to call during the cycle
     * @param {number} Cycle type to add it to, may be both
     * @returns {RunLoop}
     * @since 1.1
     */
    RunLoop.prototype.insertCall = function(call, index, type) {
        if (type === undefined || type <= RunLoop.NO_CYCLE || type > RunLoop.ALL_CYCLES) {
            throw new Error('ArgumentsError: type must be of type CYCLE enumeration');
        }
        
        if (call === undefined || typeof call !== 'function') {
            throw new Error('ArgumentsError: call must be of type function');
        }
        
        if (typeof index !== 'number') {
            throw new Error('ArgumentsError: call must be of type number');
        }
        
        if (type & RunLoop.UPDATE_CYCLE) {
            _insertCallToCycle(this.updateCallCycle, call, index);
        }
        
        if (type & RunLoop.RENDER_CYCLE) {
            _insertCallToCycle(this.renderCallCycle, call, index);
        }
        
        return this;
    };
    
    /**
     * Removes a call function from the loop
     *
     * @throws {ArgumentsError} If the type is not a cycle enumeration
     * @throws {ArgumentsError} If the call is not defined or a function
     *
     * @param {function} call Function that was called during the cycle
     * @param {number} Cycle type to remove from, may be both
     * @returns {RunLoop}
     * @since 1.1
     */
    RunLoop.prototype.removeCall = function(call, type) {
        if (type === undefined || type <= RunLoop.NO_CYCLE || type > RunLoop.ALL_CYCLES) {
            throw new Error('ArgumentsError: type must be of type CYCLE enumeration');
        }
        
        if (call === undefined || typeof call !== 'function') {
            throw new Error('ArgumentsError: call must be of type function');
        }
        
        if (type & RunLoop.UPDATE_CYCLE) {
            _removeCallFromCycle(this.updateCallCycle, call);
        }
        
        if (type & RunLoop.RENDER_CYCLE) {
            _removeCallFromCycle(this.renderCallCycle, call);
        }
        
        return this;
    };
    
    /**
     * Update Cycle Interface
     * Cycle in the step where all physical properties are modified
     * Runs each of the functions passing in the elapsed time since last step
     *
     * @param {number} elapsed Elapsed time since last step in milliseconds
     * @since 1.0
     */
    RunLoop.prototype.update = function(elapsed) {
        var i = 0;
        var cycle = this.updateCallCycle;
        var length = cycle.length;
        
        for (; i < length; i++) {
            cycle[i](elapsed);
        }
    };
    
    /**
     * Render Cycle Interface
     * Cycle in the step where all physical properties are converted into display
     * Runs each of the functions
     *
     * @since 1.0
     */
    RunLoop.prototype.render = function() {
        var i = 0;
        var cycle = this.renderCallCycle;
        var length = cycle.length;
        
        for (; i < length; i++) {
            cycle[i]();
        }
    };
    
    /**
     * Step function
     * Single run loop increment, calculated dynamically
     *
     * @since 1.0
     */
    RunLoop.prototype._step = function() {
        if (!this.isLooping) {
            return;
        }
        
        requestAnimFrame(this.step);
        
        var timestamp = Date.now();
        var elapsed = timestamp - this.lastTimestamp;
        
        if (elapsed >= FRAME_THRESHOLD) {
            this.lastTimestamp = timestamp;
            return;
        }
        
        this.update(elapsed);
        this.render();
        
        this.lastTimestamp = timestamp;
    };
    
    /**
     * Cycle Bitwise Enumeration
     * No Cycle
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.1
     */
    RunLoop.NO_CYCLE = 0;
    
    /**
     * Cycle Bitwise Enumeration
     * Update Cycle
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.1
     */
    RunLoop.UPDATE_CYCLE = 1;
    
    /**
     * Cycle Bitwise Enumeration
     * Render Cycle
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.1
     */
    RunLoop.RENDER_CYCLE = 2;
    
    /**
     * Cycle Bitwise Enumeration
     * All Cycles
     *
     * @private
     * @type {number}
     * @constant
     * @since 1.1
     */
    RunLoop.ALL_CYCLES = 3;
    
    return RunLoop;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * EventBus Module Definition
 * Needs Object.prototype.hasOwnProperty, Array.prototype.indexOf, and Function.prototype.bind
 * @author Adam Ranfelt 
 * @version 2.0
 */
define('lib/EventBus',[],function() {
    

    /**
     * Local definition of the window for faster access
     *
     * @private
     * @type {DOMWindow}
     * @constant
     * @since 2.0
     */
    var WINDOW = window;

    /**
     * Type definition that all callbacks must be
     * Used to compare all callback types against
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    var CALLBACK_TYPE = 'function';

    /**
     * Separator used to differentiate events and the namespace
     *
     * @type {string}
     * @constant
     * @since 2.0
     */
    var NAMESPACE_SEPARATOR = '.';

    /**
     * Index to indicate that an element was not found
     *
     * @type {number}
     * @constant
     * @since 2.0
     */
    var NOT_FOUND_INDEX = -1;

    /**
     * Event dispatching component used to dispatch events of its own type
     * Helper class to support event dispatching
     * Used to contain event callback relationships
     * Follows the observer pattern subject interface
     * Managed by Namespace structures and the EventBus
     *
     * @private
     * @name Event
     * @class Event observer dispatch structure
     * @constructor
     *
     * @param {string} name Event Type Name
     * @since 2.0
     */
    var Event = function(name) {
        /**
         * Event type
         *
         * @name Event#name
         * @type {string}
         * @since 2.0
         */
        this.name = name;

        /**
         * Set of callbacks used for observing
         * Collection of functions to call on Event call
         *
         * @name Event#observers
         * @type {Array}
         * @since 2.0
         */
        this.observers = [];
    };

    /**
     * Adds a function to callback with on successful trigger
     * Silently fails if the callback already exists
     *
     * @param {function} callback Callback method to call to
     * @since 2.0
     */
    Event.prototype.add = function(callback) {
        var observers = this.observers;
        if (observers.indexOf(callback) !== NOT_FOUND_INDEX) {
            return;
        }

        observers.push(callback);
    };

    /**
     * Removes a function that was originally registered to this event
     * Silently fails if the callback doesn't exist
     *
     * @param {function} callback Callback method to remove
     * @since 2.0
     */
    Event.prototype.remove = function(callback) {
        var observers = this.observers;
        var index = observers.indexOf(callback);
        if (index === NOT_FOUND_INDEX) {
            return;
        }

        observers.splice(index, 1);
    };

    /**
     * Check to verify whether the event is holding a callback
     *
     * @param {function} callback Callback method to check with
     * @returns {boolean}
     * @since 2.0
     */
    Event.prototype.has = function(callback) {
        return this.observers.indexOf(callback) !== NOT_FOUND_INDEX;
    };

    /**
     * Trigger call to fire off any observers
     * Calls the method with the arguments supplied
     * Passes the event type as the first parameter
     *
     * @param {Arguments} args Arguments from the managing EventBus
     * @since 2.0
     */
    Event.prototype.trigger = function(args) {
        var i = 0;
        var observers = this.observers;
        var length = observers.length;
        args[0] = this.name;
        for (; i < length; i++) {
            observers[i].apply(WINDOW, args);
        }
    };

    /**
     * Namespace container to associate namespace-specific events
     *
     * @private
     * @name Namespace
     * @class Namespace structure to associate a namespace with specific events
     * @constructor
     *
     * @param {string} name Namespace name
     * @since 2.0
     */
    var Namespace = function(name) {
        /**
         * Namespace name
         *
         * @name Namespace#name
         * @type {string}
         * @since 2.0
         */
        this.name = name;

        /**
         * Namespace event to allow observation on the namespace level
         *
         * @name Namespace#event
         * @type {Event}
         * @since 2.0
         */
        this.event = new Event(name);

        /**
         * Set of event objects to associate with the namespace
         *
         * @name Namespace#events
         * @type {object}
         * @since 2.0
         */
        this.events = {};
    };

    /**
     * Adds a function to callback with on successful trigger
     * Silently fails if the callback already exists
     * Adds to the namespace if the name is undefined
     * Adds to an event if the name is supplied
     *
     * @param {function} callback Callback method to observe with
     * @param {string} name Event name type
     * @since 2.0
     */
    Namespace.prototype.add = function(callback, name) {
        var events = this.events;
        var event;

        // Sets up the events if a name is supplied
        if (name !== undefined) {
            if (!events.hasOwnProperty(name)) {
                events[name] = new Event(name);
            }

            event = events[name];
        // Uses the local namespace event if no name is supplied
        } else {
            event = this.event;
        }

        event.add(callback);
    };

    /**
     * Removes a function that was originally registered to this event
     * Silently fails if the callback doesn't exist
     * Removes from the namespace if the name is undefined
     * Removes from an event if the name is supplied
     *
     * @param {function} callback Callback method to remove
     * @param {string} name Event name type
     * @since 2.0
     */
    Namespace.prototype.remove = function(callback, name) {
        var events = this.events;
        var event;

        // Sets up the events if a name is supplied
        if (name !== undefined) {
            if (!events.hasOwnProperty(name)) {
                events[name] = new Event(name);
            }

            event = events[name];
        // Uses the local namespace event if no name is supplied
        } else {
            event = this.event;
        }

        event.remove(callback);
    };

    /**
     * Trigger call to fire off any observers
     * Triggers the local events after triggering the specific event type
     *
     * @param {string} name Event type to trigger
     * @param {Arguments} args Arguments from the managing EventBus
     * @since 2.0
     */
    Namespace.prototype.trigger = function(name, args) {
        var events = this.events;
        var event;

        if (events.hasOwnProperty(name)) {
            event = events[name];
            event.trigger(args);
        }

        this.event.trigger(args);
    };

    /**
     * Finds the namespace object for the supplied namespace
     * Called from the context of the owning EventBus
     * Creates the necessary Namespace if one is not already defined
     *
     * @private
     * @param {string} namespace Namespace name to collect
     * @param {Arguments} args Arguments from the managing EventBus
     * @since 2.0
     */
    var _getNamespace = function(namespace) {
        if (namespace === undefined) {
            return this.events;
        }

        var namespaces = this.namespaces;
        if (!namespaces.hasOwnProperty(namespace)) {
            namespaces[namespace] = new Namespace(namespace);
        }

        return namespaces[namespace];
    };

    /**
     * EventBus Constructor
     *
     * EventBus structure, using the observer pattern
     * Publishes messages based on topics on a topic-to-callback basis
     * Allows namespacing to differentiate source and listen for all namespaced structures
     * Handles observation via function and retains no context about that function
     *
     * @name EventBus
     * @class Publish-subscribe observer model
     * @constructor
     * @since 1.0
     */
    var EventBus = function() {
        /**
         * Basic event calling structure
         * Retains no name or namespace
         * Used to call out each event trigger
         *
         * @name EventBus#events
         * @type {Namespace}
         * @since 2.0
         */
        this.events = new Namespace('');

        /**
         * Collection of namespaced organized by namespace name key
         *
         * @name EventBus#namespaces
         * @type {object}
         * @since 2.0
         */
        this.namespaces = {};

        /**
         * Convenience function to gather the namespace
         * Gets a new namespace if it doesn't exist
         *
         * @function
         * @name EventBus#getNamespace
         * @type {function}
         * @since 2.0
         */
        this.getNamespace = _getNamespace.bind(this);
    };

    /**
     * Sets up a callback for a topic
     * Topic is divided between event and namespace, using a period '.' to separate
     * Callback is given the context of the window to call from
     * Fails silently if it is observing
     *
     * @throws {UndefinedError} When the topic or callback is not supplied
     * @throws {TypeError} When the callback is not a function
     *
     * @param {string} topic Topic storing an event, a namespace, or a namespaced event
     * @param {function} callback Function to call upon successful trigger
     * @returns {EventBus}
     * @since 2.0
     */
    EventBus.prototype.on = function(topic, callback) {
        if (topic === undefined || callback === undefined) {
            throw 'UndefinedError: On usage: on(topic, callback)';
        }

        if (typeof callback !== CALLBACK_TYPE) {
            throw 'TypeError: Callback subscribing is of type ' + (typeof callback) + ' not of type ' + CALLBACK_TYPE;
        }

        var event;
        var namespace;
        var namespaceIndex = topic.lastIndexOf(NAMESPACE_SEPARATOR);

        // If there's only a namespace
        if (topic.charAt(0) === NAMESPACE_SEPARATOR && topic.length !== 1) {
            namespace = topic.substr(1);
        // If there's a namespace and an event
        } else if (namespaceIndex !== NOT_FOUND_INDEX && namespaceIndex !== topic.length - 1) {
            namespace = topic.substr(namespaceIndex + 1);
            event = topic.substr(0, namespaceIndex);
        // If there's only an event
        } else {
            event = topic;
        }

        var targetNamespace = this.getNamespace(namespace);
        targetNamespace.add(callback, event);

        return this;
    };

    /**
     * Tears down the callback for a topic
     * Topic is divided between event and namespace, using a period '.' to separate
     * Fails silently if it is not already observing
     *
     * @throws {UndefinedError} When the topic or callback is not supplied
     * @throws {TypeError} When the callback is not a function
     *
     * @param {string} topic Topic storing an event, a namespace, or a namespaced event
     * @param {function} callback Function to remove from observation
     * @returns {EventBus}
     * @since 2.0
     */
    EventBus.prototype.off = function(topic, callback) {
        if (topic === undefined || callback === undefined) {
            throw 'UndefinedError: Off usage: on(topic, callback)';
        }

        if (typeof callback !== CALLBACK_TYPE) {
            throw 'TypeError: Callback subscribing is of type ' + (typeof callback) + ' not of type ' + CALLBACK_TYPE;
        }

        var event;
        var namespace;
        var namespaceIndex = topic.lastIndexOf(NAMESPACE_SEPARATOR);

        // If there's only a namespace
        if (topic.charAt(0) === NAMESPACE_SEPARATOR && topic.length !== 1) {
            namespace = topic.substr(1);
        // If there's a namespace and an event
        } else if (namespaceIndex !== NOT_FOUND_INDEX && namespaceIndex !== topic.length - 1) {
            namespace = topic.substr(namespaceIndex + 1);
            event = topic.substr(0, namespaceIndex);
        // If there's only an event
        } else {
            event = topic;
        }

        var targetNamespace = _getNamespace.call(this, namespace);
        targetNamespace.remove(callback, event);

        return this;
    };

    /**
     * Triggers the event for a specific topic
     * Topic is divided between event and namespace, using a period '.' to separate
     *
     * @throws {Error} When the topic is only a namespace
     *
     * @param {string} topic Topic storing an event, a namespace, or a namespaced event
     * @returns {EventBus}
     * @since 2.0
     */
    EventBus.prototype.trigger = function(topic) {
        var event;
        var namespace;
        var namespaceIndex = topic.lastIndexOf(NAMESPACE_SEPARATOR);
        var namespaces = this.namespaces;

        if (topic.charAt(0) === NAMESPACE_SEPARATOR && topic.length !== 1) {
            throw 'Error: triggering topic is a namespace and should be an event';
        } else if (namespaceIndex !== NOT_FOUND_INDEX && namespaceIndex !== topic.length - 1) {
            namespace = topic.substr(namespaceIndex + 1);
            event = topic.substr(0, namespaceIndex);
        } else {
            event = topic;
        }

        if (namespace && namespaces.hasOwnProperty(namespace)) {
            namespaces[namespace].trigger(event, arguments);
        }

        this.events.trigger(event, arguments);

        return this;
    };

    return EventBus;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * Events Module Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */
define('layer/EventBus',[
    'lib/EventBus'
], function(
    EventBus
) {
    
    
    return new EventBus();
});
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
 * Input Module Definition
 * @author Adam Ranfelt 
 * @author Aaron Gloege
 * @version 1.9
 */
define('layer/Input',[
    'layer/EventBus',
    'layer/Geometry'
], function(
    EventBus,
    Geometry
) {
    

    /**
     * Namespace ID
     *
     * @type {number}
     * @private
     * @since 1.2
     */
    var namespaceId = 0;

    /**
     * Namespace string
     *
     * @type {string}
     * @constant
     * @since 1.2
     */
    var NAMESPACE = '.input';

    /**
     * Page document object
     *
     * @type {HTMLDocument}
     * @constant
     * @since 1.3
     */
    var DOCUMENT = document;

    /**
     * Page window object
     *
     * @type {window}
     * @constant
     * @since 1.3
     */
    var WINDOW = window;

    /**
     * Page body element
     *
     * @type {HTMLElement}
     * @constant
     * @since 1.3
     */
    var BODY = DOCUMENT.body;

    // Element.contains polyfill
    if (!Element.prototype.contains) {
        if (document.compareDocumentPosition) {
            Element.prototype.contains = function(b) {
                return b && !!(this.compareDocumentPosition(b) & 16);
            }
        } else {
            Element.prototype.contains = function(b) {
                while ((b = b.parentNode)) {
                    if (b === this) {
                        return true;
                    }
                }
                return false;
            }
        }
    }

    /**
     * Calculate position offset of container
     *
     * @param {HTMLElement} container
     * @param {object} containerOffset Object to set top and left offset values to
     * @return {object}
     * @private
     * @since 1.3
     */
    var getOffset = function(container, containerOffset) {
        var offset = container.getBoundingClientRect();

        var clientTop  = DOCUMENT.clientTop || BODY.clientTop || 0;
        var clientLeft = DOCUMENT.clientLeft || BODY.clientLeft || 0;

        var scrollTop  = WINDOW.pageYOffset || DOCUMENT.scrollTop || 0;
        var scrollLeft = WINDOW.pageXOffset || DOCUMENT.scrollLeft || 0;

        containerOffset.top = offset.top + scrollTop - clientTop;
        containerOffset.left = offset.left + scrollLeft - clientLeft;
    };

    /**
     * Mouse Event to represent the current mouse state
     *
     * @name Mouse
     * @class Mouse state that represents the current mouse state
     * @constructor
     * @since 1.0
     */
    var Mouse = function() {
        /**
         * X Position of the Mouse
         *
         * @default 0
         * @name Mouse#x
         * @type {number}
         * @since 1.0
         */
        this.x = 0;

        /**
         * Y Position of the Mouse
         *
         * @default 0
         * @name Mouse#y
         * @type {number}
         * @since 1.0
         */
        this.y = 0;
    };

    /**
     * Current Window X/Y mouse coordinates
     * Updated on mousemove within window
     * Used to track the mouse position for activation of
     * input controllers upon entry into their containers
     *
     * @type {Mouse}
     * @private
     * @since 1.8
     */
    var _windowMousePosition = (function() {
        var mouse = new Mouse();

        var onScroll = function(e) {
            mouse.x = e.pageX;
            mouse.y = e.pageY;
        };

        WINDOW.addEventListener('mousemove', onScroll, false);

        return mouse;
    }());

    /**
     * Mouse Enter/Leave handler to determine if use has moused over/out container
     *
     * @param {Event} e
     * @private
     * @since 1.9
     */
    var _mouseEnterMouseLeaveHandler = function(e) {
        var target = e.target;
        var related = e.relatedTarget;

        // For mousenter/leave call the handler if related is outside the target.
        // NB: No relatedTarget if the mouse left/entered the browser window
        if (!related || (related !== target && !target.contains(related))) {
            if (e.type === 'mouseover') {
                this.onEnter();
            } else {
                this.onExit();
            }
        }
    };

    /**
     * Input Controller Constructor
     *
     * Controller to manage all UI inputs from a specific container
     * All hit positions are normalized to the container's origin
     * Enabled after initialization
     *
     * @name Input
     * @class Input controller to listen to UI Events
     * @constructor
     *
     * @param {HTMLElement} container Container to listen from for the input controller
     * @since 1.0
     */
    var Input = function(container) {
        if (container !== undefined) {
            this.init(container);
        }
    };

    /**
     * Initializes the input by attaching to the container
     * Only propagates content from the input if the input is active
     *
     * @throws {ArgumentsError} If container is undefined or null
     *
     * @param {HTMLElement} container Container to listen from for the input controller
     * @returns {Input}
     * @since 1.0
     */
    Input.prototype.init = function(container) {
        if (container === undefined || container === null) {
            throw new Error('ArgumentsError: container not defined for Input');
        }

        /**
         * Unique namespace
         * @name Input#namespace
         * @type {string}
         */
        this.namespace = NAMESPACE + (namespaceId++);

        /**
         * HTML Container for the input
         *
         * @name Input#container
         * @type {HTMLElement}
         * @since 1.0
         */
        this.container = container;

        /**
         * Mouse state of the input
         *
         * @name Input#mouse
         * @type {Mouse}
         * @since 1.0
         */
        this.mouse = new Mouse();

        /**
         * Enabled state flag for the input
         *
         * @default false
         * @name Input#enabled
         * @type {boolean}
         * @since 1.0
         */
        this.enabled = false;

        /**
         * Active state flag for the input
         * Active state listens for when the mouse enters to begin listening for input
         *
         * @default false
         * @name Input#isActive
         * @type {boolean}
         * @since 1.1.1
         */
        this.isActive = false;

        /**
         * Active state flag for drag mode
         *
         * @default false
         * @name Input#isDragging
         * @type {boolean}
         * @since 1.5
         */
        this.isDragging = false;

        /**
         * Active state flag for mouse currently being over container
         *
         * @default false
         * @name Input#isMouseOver
         * @type {boolean}
         * @since 1.6
         */
        this.isMouseOver = false;

        /**
         * Container position offset on page
         *
         * @name Input#containerOffset
         * @type {object}
         * @since 1.3
         */
        this.containerOffset = { top: 0, left: 0 };

        return this.setupHandlers().activate();
    };

    /**
     * Binds all the handlers for all the events that are handled
     *
     * @returns {Input}
     * @since 1.1
     */
    Input.prototype.setupHandlers = function() {
        /**
         * Bound onMove Handler
         *
         * @private
         * @name Input#onMoveHandler
         * @type {function}
         * @since 1.0
         */
        this.onMoveHandler = this.onMove.bind(this);

        /**
         * Bound onDown Handler
         *
         * @private
         * @name Input#onDownHandler
         * @type {function}
         * @since 1.0
         */
        this.onDownHandler = this.onDown.bind(this);

        /**
         * Bound onUp Handler
         *
         * @private
         * @name Input#onUpHandler
         * @type {function}
         * @since 1.0
         */
        this.onUpHandler = this.onUp.bind(this);

        /**
         * Bound onTouchMove Handler
         *
         * @private
         * @name Input#onTouchMoveHandler
         * @type {function}
         * @since 1.4
         */
        this.onTouchMoveHandler = this.onTouchMove.bind(this);

        /**
         * Bound onTouchStart Handler
         *
         * @private
         * @name Input#onTouchStartHandler
         * @type {function}
         * @since 1.4
         */
        this.onTouchStartHandler = this.onTouchStart.bind(this);

        /**
         * Bound onTouchEnd Handler
         *
         * @private
         * @name Input#onTouchEndHandler
         * @type {function}
         * @since 1.4
         */
        this.onTouchEndHandler = this.onTouchEnd.bind(this);

        /**
         * Bound onClick Handler
         *
         * @private
         * @name Input#onClickHandler
         * @type {function}
         * @since 1.0
         */
        this.onClickHandler = this.onClick.bind(this);

        /**
         * Bound onEnter Handler
         *
         * @private
         * @name Input#onEnterHandler
         * @type {function}
         * @since 1.1.1
         */
        this.onEnterHandler = this.onEnter.bind(this);

        /**
         * Bound onExit Handler
         *
         * @private
         * @name Input#onExitHandler
         * @type {function}
         * @since 1.1.1
         */
        this.onExitHandler = this.onExit.bind(this);

        /**
         * Boudn updateOffset Handler
         *
         * @private
         * @name Input#onResizeHandler
         * @type {function}
         * @since 1.6
         */
        this.onResizeHandler = this.updateOffset.bind(this);

        /**
         * Bound onMouseEnterMouseLeaveHandler Handler
         *
         * @private
         * @name Input#onMouseEnterMouseLeaveHandler
         * @type {function}
         * @since 1.7
         */
        this.onMouseEnterMouseLeaveHandler = _mouseEnterMouseLeaveHandler.bind(this);

        return this;
    };

    /**
     * Attaches the input to the container to listen for entry and exiting
     * Enables the container only if entered
     *
     * @returns {Input}
     * @since 1.1.1
     */
    Input.prototype.activate = function() {
        if (this.isActive) {
            return this;
        }

        this.isActive = true;

        this.container.addEventListener('mouseover', this.onMouseEnterMouseLeaveHandler, false);
        this.container.addEventListener('mouseout', this.onMouseEnterMouseLeaveHandler, false);
        this.container.addEventListener('touchstart', this.onEnterHandler, false);
        this.container.addEventListener('touchstart', this.onTouchStartHandler, false);

        WINDOW.addEventListener('resize', this.onResizeHandler, false);

        this.updateOffset();

        if (Geometry.isPointInRect(
            _windowMousePosition.x,
            _windowMousePosition.y,
            this.containerOffset.left,
            this.containerOffset.top,
            this.container.clientWidth,
            this.container.clientHeight
        )) {
            this.onEnterHandler();
        }

        return this;
    };

    /**
     * Detaches the input to the container to stop listening for entry and exiting
     *
     * @returns {Input}
     * @since 1.1.1
     */
    Input.prototype.deactivate = function() {
        if (!this.isActive) {
            return this;
        }

        if (this.isDragging) {
            this.stopDragging();
        }

        if (this.enabled) {
            this.disable();
        }

        this.isActive = false;

        this.container.removeEventListener('mouseover', this.onMouseEnterMouseLeaveHandler, false);
        this.container.removeEventListener('mouseout', this.onMouseEnterMouseLeaveHandler, false);
        this.container.removeEventListener('touchstart', this.onEnterHandler, false);
        this.container.removeEventListener('touchstart', this.onTouchStartHandler, false);

        WINDOW.removeEventListener('resize', this.onResizeHandler, false);

        return this;
    };

    /**
     * Enables the Input controller by attaching to the container
     * Enables only if necessary
     *
     * @returns {Input}
     * @since 1.0
     */
    Input.prototype.enable = function() {
        if (this.enabled) {
            return this;
        }

        this.enabled = true;

        this.container.addEventListener('mousemove', this.onMoveHandler, false);
        this.container.addEventListener('mousedown', this.onDownHandler, false);
        this.container.addEventListener('click', this.onClickHandler, false);

        return this;
    };

    /**
     * Disables the Input controller by attaching to the container
     * Disables only if necessary
     *
     * @returns {Input}
     * @since 1.0
     */
    Input.prototype.disable = function() {
        if (!this.enabled || this.isDragging) {
            return this;
        }

        this.enabled = false;

        this.container.removeEventListener('mousemove', this.onMoveHandler, false);
        this.container.removeEventListener('mousedown', this.onDownHandler, false);
        this.container.removeEventListener('click', this.onClickHandler, false);

        EventBus.trigger(Input.DISABLE + this.namespace, this.mouse);

        return this;
    };

    /**
     * Unbind move and up event handlers from container and bind them to the window
     *
     * @return {Input}
     * @private
     * @since 1.5
     */
    Input.prototype.startDragging = function() {
        if (this.isDragging) {
            return this;
        }

        Input.CURRENTLY_DRAGGING = this.isDragging = true;

        this.container.removeEventListener('mousemove', this.onMoveHandler, false);

        // Mouse events must be bound to window because
        // body may not be the full window height
        WINDOW.addEventListener('mousemove', this.onMoveHandler, false);
        WINDOW.addEventListener('mouseup', this.onUpHandler, false);

        // Touch events must be bound to body
        // to prevent scrolling on touchmove events
        BODY.addEventListener('touchmove', this.onTouchMoveHandler, false);
        BODY.addEventListener('touchend', this.onTouchEndHandler, false);

        return this;
    };

    /**
     * Unbind move and up event handlers from window and bind them back to the container
     *
     * @return {Input}
     * @private
     * @since 1.5
     */
    Input.prototype.stopDragging = function() {
        if (!this.isDragging) {
            return this;
        }

        Input.CURRENTLY_DRAGGING = this.isDragging = false;

        WINDOW.removeEventListener('mousemove', this.onMoveHandler, false);
        WINDOW.removeEventListener('mouseup', this.onUpHandler, false);

        BODY.removeEventListener('touchmove', this.onTouchMoveHandler, false);
        BODY.removeEventListener('touchend', this.onTouchEndHandler, false);

        // If we are still over the container, rebind the mousemove event.
        // Otherwise, call the onExit handler
        if (this.isMouseOver) {
            this.container.addEventListener('mousemove', this.onMoveHandler, false);
        } else {
            this.onExit();
        }

        return this;
    };

    /**
     * Get unique namespace
     *
     * @return {string}
     * @since 1.2
     */
    Input.prototype.getNamespace = function() {
        return this.namespace;
    };

    /**
     * onMove Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Mouse Move Event
     * @since 1.0
     */
    Input.prototype.onMove = function(event) {
        this.mouse.x = event.pageX - this.containerOffset.left;
        this.mouse.y = event.pageY - this.containerOffset.top;

        EventBus.trigger(Input.MOUSE_MOVE + this.namespace, this.mouse);
    };

    /**
     * onUp Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Mouse Up Event
     * @since 1.0
     */
    Input.prototype.onUp = function(event) {
        this.mouse.x = event.pageX - this.containerOffset.left;
        this.mouse.y = event.pageY - this.containerOffset.top;

        EventBus.trigger(Input.MOUSE_UP + this.namespace, this.mouse);

        this.stopDragging();
    };

    /**
     * onDown Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Mouse Down Event
     * @since 1.0
     */
    Input.prototype.onDown = function(event) {
        if (event.which !== 1) {
            return;
        }

        this.updateOffset();

        this.mouse.x = event.pageX - this.containerOffset.left;
        this.mouse.y = event.pageY - this.containerOffset.top;

        EventBus.trigger(Input.MOUSE_DOWN + this.namespace, this.mouse);

        this.startDragging();
    };

    /**
     * onTouchMove Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Touch Move Event
     * @since 1.4
     */
    Input.prototype.onTouchMove = function(event) {
        this.mouse.x = event.touches[0].pageX - this.containerOffset.left;
        this.mouse.y = event.touches[0].pageY - this.containerOffset.top;

        // Prevent body from scrolling
        event.preventDefault();

        EventBus.trigger(Input.MOUSE_MOVE + this.namespace, this.mouse);
    };

    /**
     * onTouchEnd Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Touch Start Event
     * @since 1.4
     */
    Input.prototype.onTouchEnd = function(event) {
        // touchend does not return any x/y coordinates, so leave the
        // mouse object as the last coordinates from onTouchMove or onTouchStart
        EventBus.trigger(Input.MOUSE_UP + this.namespace, this.mouse);

        this.stopDragging();
    };

    /**
     * onTouchStart Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Touch Start Event
     * @since 1.4
     */
    Input.prototype.onTouchStart = function(event) {
        this.updateOffset();

        this.mouse.x = event.touches[0].pageX - this.containerOffset.left;
        this.mouse.y = event.touches[0].pageY - this.containerOffset.top;

        EventBus.trigger(Input.MOUSE_DOWN + this.namespace, this.mouse);

        this.startDragging();
    };

    /**
     * onClick Handler
     * Sets up the mouse state
     *
     * @param {jQuery.Event} event Mouse Click Event
     * @since 1.0
     */
    Input.prototype.onClick = function(event) {
        this.mouse.x = event.pageX - this.containerOffset.left;
        this.mouse.y = event.pageY - this.containerOffset.top;

        EventBus.trigger(Input.CLICK + this.namespace, this.mouse);
    };

    /**
     * onEnter Handler
     * Enables the input on enter
     *
     * @param {jQuery.Event} event Mouse Click Event
     * @since 1.1.1
     */
    Input.prototype.onEnter = function(event) {
        if (!Input.CURRENTLY_DRAGGING) {
            this.isMouseOver = true;
            this.updateOffset().enable();
        }
    };

    /**
     * onExit Handler
     * Disables the input on exit
     *
     * @param {jQuery.Event} event Mouse Click Event
     * @since 1.1.1
     */
    Input.prototype.onExit = function(event) {
        this.isMouseOver = false;
        this.disable();
    };

    /**
     * Update container offset
     *
     * @returns {Input}
     * @since 1.6
     */
    Input.prototype.updateOffset = function() {
        getOffset(this.container, this.containerOffset);

        return this;
    };

    /**
     * Input Mousemove Events event name
     * Includes a layer-js namespace
     * Supplies the mouse object and the containing element
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.MOUSE_MOVE = 'input/mousemove';

    /**
     * Input Mouseup Events event name
     * Includes a layer-js namespace
     * Supplies the mouse object and the containing element
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.MOUSE_UP = 'input/mouseup';

    /**
     * Input Mousedown Events event name
     * Includes a layer-js namespace
     * Supplies the mouse object and the containing element
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.MOUSE_DOWN = 'input/mousedown';

    /**
     * Input Click Events event name
     * Includes a layer-js namespace
     * Supplies the mouse object and the containing element
     *
     * @type {string}
     * @constant
     * @since 1.0
     */
    Input.CLICK = 'input/mouseclick';

    /**
     * Input disable event name
     * Includes a layer-js namespace
     * Supplies the mouse object and the containing element
     *
     * @type {string}
     * @constant
     * @since 1.7
     */
    Input.DISABLE = 'input/disable';

    /**
     * Flag to determine if any instance of Input is currently dragging
     *
     * @type {boolean}
     * @static
     * @since 1.6
     */
    Input.CURRENTLY_DRAGGING = false;

    return Input;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * Render Request Module Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */
define('layer/RenderRequest',[],function() {
    
    
    /**
     * RenderRequest Constructor
     *
     * Mediator pattern to communicate from the Renderable infrastructure up to the scene
     * Scenes and Renderables are related through a namespace string
     * Uses a reset type of getter, where any retrieval of needsRender will result in resetting the render flag
     * 
     * @name RenderRequest
     * @class Render Request mediator construct used to communicate between child and parent via string
     * @constructor
     * 
     * @since 1.0
     */
    var RenderRequest = function() {
        this.init();
    };

    /**
     * Initializes the request structure and builds the base render stack
     *
     * @returns {RenderRequest}
     * @since 1.0
     */
    RenderRequest.prototype.init = function() {
        /**
         * Scene Render Stack used to store the needsRender flag for each namespace
         *
         * @default {}
         * @name RenderRequest#sceneRenderStack
         * @type {object}
         * @since 1.0
         */
        this.sceneRenderStack = {};

        return this;
    };

    /**
     * Updates the flag for the given namespace to be true
     *
     * @param {string} sceneNamespace Namespace of the scene to mark as true
     * @returns {RenderRequest}
     * @since 1.0
     */
    RenderRequest.prototype.setNeedsRender = function(sceneNamespace) {
        this.sceneRenderStack[sceneNamespace] = true;

        return this;
    };

    /**
     * Gets the flag for the given namespace, resets the namespace afterwards
     *
     * @param {string} sceneNamespace Namespace of the scene to get the state of
     * @returns {boolean}
     * @since 1.0
     */
    RenderRequest.prototype.getNeedsRender = function(sceneNamespace) {
        var needsRender = this.sceneRenderStack[sceneNamespace];
        this.sceneRenderStack[sceneNamespace] = false;

        return needsRender;
    };

    return RenderRequest;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * Render Mediator, Render Request Singleton Module Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */
define('layer/RenderMediator',[
	'layer/RenderRequest'
], function(
	RenderRequest
) {
	

	return new RenderRequest();
});
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations for WebGL
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 1.3.7
 */

/*
 * Copyright (c) 2012 Brandon Jones, Colin MacKenzie IV
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

// Updated to use a modification of the "returnExportsGlobal" pattern from https://github.com/umdjs/umd

(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(global);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('lib/gl-matrix',[], function () {
            return factory(root);
        });
    } else {
        // Browser globals
        factory(root);
    }
}(this, function (root) {
    

    // Tweak to your liking
    var FLOAT_EPSILON = 0.000001;

    var glMath = {};
    (function() {
        if (typeof(Float32Array) != 'undefined') {
            var y = new Float32Array(1);
            var i = new Int32Array(y.buffer);

            /**
             * Fast way to calculate the inverse square root,
             * see http://jsperf.com/inverse-square-root/5
             *
             * If typed arrays are not available, a slower
             * implementation will be used.
             *
             * @param {Number} number the number
             * @returns {Number} Inverse square root
             */
            glMath.invsqrt = function(number) {
              var x2 = number * 0.5;
              y[0] = number;
              var threehalfs = 1.5;

              i[0] = 0x5f3759df - (i[0] >> 1);

              var number2 = y[0];

              return number2 * (threehalfs - (x2 * number2 * number2));
            };
        } else {
            glMath.invsqrt = function(number) { return 1.0 / Math.sqrt(number); };
        }
    })();

    /**
     * @class System-specific optimal array type
     * @name MatrixArray
     */
    var MatrixArray = null;
    
    // explicitly sets and returns the type of array to use within glMatrix
    function setMatrixArrayType(type) {
        MatrixArray = type;
        return MatrixArray;
    }

    // auto-detects and returns the best type of array to use within glMatrix, falling
    // back to Array if typed arrays are unsupported
    function determineMatrixArrayType() {
        MatrixArray = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
        return MatrixArray;
    }
    
    determineMatrixArrayType();

    /**
     * @class 3 Dimensional Vector
     * @name vec3
     */
    var vec3 = {};
     
    /**
     * Creates a new instance of a vec3 using the default array type
     * Any javascript array-like objects containing at least 3 numeric elements can serve as a vec3
     *
     * @param {vec3} [vec] vec3 containing values to initialize with
     *
     * @returns {vec3} New vec3
     */
    vec3.create = function (vec) {
        var dest = new MatrixArray(3);

        if (vec) {
            dest[0] = vec[0];
            dest[1] = vec[1];
            dest[2] = vec[2];
        } else {
            dest[0] = dest[1] = dest[2] = 0;
        }

        return dest;
    };

    /**
     * Creates a new instance of a vec3, initializing it with the given arguments
     *
     * @param {number} x X value
     * @param {number} y Y value
     * @param {number} z Z value

     * @returns {vec3} New vec3
     */
    vec3.createFrom = function (x, y, z) {
        var dest = new MatrixArray(3);

        dest[0] = x;
        dest[1] = y;
        dest[2] = z;

        return dest;
    };

    /**
     * Copies the values of one vec3 to another
     *
     * @param {vec3} vec vec3 containing values to copy
     * @param {vec3} dest vec3 receiving copied values
     *
     * @returns {vec3} dest
     */
    vec3.set = function (vec, dest) {
        dest[0] = vec[0];
        dest[1] = vec[1];
        dest[2] = vec[2];

        return dest;
    };

    /**
     * Compares two vectors for equality within a certain margin of error
     *
     * @param {vec3} a First vector
     * @param {vec3} b Second vector
     *
     * @returns {Boolean} True if a is equivalent to b
     */
    vec3.equal = function (a, b) {
        return a === b || (
            Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
            Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
            Math.abs(a[2] - b[2]) < FLOAT_EPSILON
        );
    };

    /**
     * Performs a vector addition
     *
     * @param {vec3} vec First operand
     * @param {vec3} vec2 Second operand
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.add = function (vec, vec2, dest) {
        if (!dest || vec === dest) {
            vec[0] += vec2[0];
            vec[1] += vec2[1];
            vec[2] += vec2[2];
            return vec;
        }

        dest[0] = vec[0] + vec2[0];
        dest[1] = vec[1] + vec2[1];
        dest[2] = vec[2] + vec2[2];
        return dest;
    };

    /**
     * Performs a vector subtraction
     *
     * @param {vec3} vec First operand
     * @param {vec3} vec2 Second operand
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.subtract = function (vec, vec2, dest) {
        if (!dest || vec === dest) {
            vec[0] -= vec2[0];
            vec[1] -= vec2[1];
            vec[2] -= vec2[2];
            return vec;
        }

        dest[0] = vec[0] - vec2[0];
        dest[1] = vec[1] - vec2[1];
        dest[2] = vec[2] - vec2[2];
        return dest;
    };

    /**
     * Performs a vector multiplication
     *
     * @param {vec3} vec First operand
     * @param {vec3} vec2 Second operand
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.multiply = function (vec, vec2, dest) {
        if (!dest || vec === dest) {
            vec[0] *= vec2[0];
            vec[1] *= vec2[1];
            vec[2] *= vec2[2];
            return vec;
        }

        dest[0] = vec[0] * vec2[0];
        dest[1] = vec[1] * vec2[1];
        dest[2] = vec[2] * vec2[2];
        return dest;
    };

    /**
     * Negates the components of a vec3
     *
     * @param {vec3} vec vec3 to negate
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.negate = function (vec, dest) {
        if (!dest) { dest = vec; }

        dest[0] = -vec[0];
        dest[1] = -vec[1];
        dest[2] = -vec[2];
        return dest;
    };

    /**
     * Multiplies the components of a vec3 by a scalar value
     *
     * @param {vec3} vec vec3 to scale
     * @param {number} val Value to scale by
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.scale = function (vec, val, dest) {
        if (!dest || vec === dest) {
            vec[0] *= val;
            vec[1] *= val;
            vec[2] *= val;
            return vec;
        }

        dest[0] = vec[0] * val;
        dest[1] = vec[1] * val;
        dest[2] = vec[2] * val;
        return dest;
    };

    /**
     * Generates a unit vector of the same direction as the provided vec3
     * If vector length is 0, returns [0, 0, 0]
     *
     * @param {vec3} vec vec3 to normalize
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.normalize = function (vec, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0], y = vec[1], z = vec[2],
            len = Math.sqrt(x * x + y * y + z * z);

        if (!len) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            return dest;
        } else if (len === 1) {
            dest[0] = x;
            dest[1] = y;
            dest[2] = z;
            return dest;
        }

        len = 1 / len;
        dest[0] = x * len;
        dest[1] = y * len;
        dest[2] = z * len;
        return dest;
    };

    /**
     * Generates the cross product of two vec3s
     *
     * @param {vec3} vec First operand
     * @param {vec3} vec2 Second operand
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.cross = function (vec, vec2, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0], y = vec[1], z = vec[2],
            x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];

        dest[0] = y * z2 - z * y2;
        dest[1] = z * x2 - x * z2;
        dest[2] = x * y2 - y * x2;
        return dest;
    };

    /**
     * Caclulates the length of a vec3
     *
     * @param {vec3} vec vec3 to calculate length of
     *
     * @returns {number} Length of vec
     */
    vec3.length = function (vec) {
        var x = vec[0], y = vec[1], z = vec[2];
        return Math.sqrt(x * x + y * y + z * z);
    };

    /**
     * Caclulates the squared length of a vec3
     *
     * @param {vec3} vec vec3 to calculate squared length of
     *
     * @returns {number} Squared Length of vec
     */
    vec3.squaredLength = function (vec) {
        var x = vec[0], y = vec[1], z = vec[2];
        return x * x + y * y + z * z;
    };

    /**
     * Caclulates the dot product of two vec3s
     *
     * @param {vec3} vec First operand
     * @param {vec3} vec2 Second operand
     *
     * @returns {number} Dot product of vec and vec2
     */
    vec3.dot = function (vec, vec2) {
        return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2];
    };

    /**
     * Generates a unit vector pointing from one vector to another
     *
     * @param {vec3} vec Origin vec3
     * @param {vec3} vec2 vec3 to point to
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.direction = function (vec, vec2, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0] - vec2[0],
            y = vec[1] - vec2[1],
            z = vec[2] - vec2[2],
            len = Math.sqrt(x * x + y * y + z * z);

        if (!len) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            return dest;
        }

        len = 1 / len;
        dest[0] = x * len;
        dest[1] = y * len;
        dest[2] = z * len;
        return dest;
    };

    /**
     * Performs a linear interpolation between two vec3
     *
     * @param {vec3} vec First vector
     * @param {vec3} vec2 Second vector
     * @param {number} lerp Interpolation amount between the two inputs
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.lerp = function (vec, vec2, lerp, dest) {
        if (!dest) { dest = vec; }

        dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
        dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
        dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);

        return dest;
    };

    /**
     * Calculates the euclidian distance between two vec3
     *
     * Params:
     * @param {vec3} vec First vector
     * @param {vec3} vec2 Second vector
     *
     * @returns {number} Distance between vec and vec2
     */
    vec3.dist = function (vec, vec2) {
        var x = vec2[0] - vec[0],
            y = vec2[1] - vec[1],
            z = vec2[2] - vec[2];
            
        return Math.sqrt(x*x + y*y + z*z);
    };

    // Pre-allocated to prevent unecessary garbage collection
    var unprojectMat = null;
    var unprojectVec = new MatrixArray(4);
    /**
     * Projects the specified vec3 from screen space into object space
     * Based on the <a href="http://webcvs.freedesktop.org/mesa/Mesa/src/glu/mesa/project.c?revision=1.4&view=markup">Mesa gluUnProject implementation</a>
     *
     * @param {vec3} vec Screen-space vector to project
     * @param {mat4} view View matrix
     * @param {mat4} proj Projection matrix
     * @param {vec4} viewport Viewport as given to gl.viewport [x, y, width, height]
     * @param {vec3} [dest] vec3 receiving unprojected result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.unproject = function (vec, view, proj, viewport, dest) {
        if (!dest) { dest = vec; }

        if(!unprojectMat) {
            unprojectMat = mat4.create();
        }

        var m = unprojectMat;
        var v = unprojectVec;
        
        v[0] = (vec[0] - viewport[0]) * 2.0 / viewport[2] - 1.0;
        v[1] = (vec[1] - viewport[1]) * 2.0 / viewport[3] - 1.0;
        v[2] = 2.0 * vec[2] - 1.0;
        v[3] = 1.0;
        
        mat4.multiply(proj, view, m);
        if(!mat4.inverse(m)) { return null; }
        
        mat4.multiplyVec4(m, v);
        if(v[3] === 0.0) { return null; }

        dest[0] = v[0] / v[3];
        dest[1] = v[1] / v[3];
        dest[2] = v[2] / v[3];
        
        return dest;
    };

    var xUnitVec3 = vec3.createFrom(1,0,0);
    var yUnitVec3 = vec3.createFrom(0,1,0);
    var zUnitVec3 = vec3.createFrom(0,0,1);

    var tmpvec3 = vec3.create();
    /**
     * Generates a quaternion of rotation between two given normalized vectors
     *
     * @param {vec3} a Normalized source vector
     * @param {vec3} b Normalized target vector
     * @param {quat4} [dest] quat4 receiving operation result.
     *
     * @returns {quat4} dest if specified, a new quat4 otherwise
     */
    vec3.rotationTo = function (a, b, dest) {
        if (!dest) { dest = quat4.create(); }
        
        var d = vec3.dot(a, b);
        var axis = tmpvec3;
        if (d >= 1.0) {
            quat4.set(identityQuat4, dest);
        } else if (d < (0.000001 - 1.0)) {
            vec3.cross(xUnitVec3, a, axis);
            if (vec3.length(axis) < 0.000001)
                vec3.cross(yUnitVec3, a, axis);
            if (vec3.length(axis) < 0.000001)
                vec3.cross(zUnitVec3, a, axis);
            vec3.normalize(axis);
            quat4.fromAngleAxis(Math.PI, axis, dest);
        } else {
            var s = Math.sqrt((1.0 + d) * 2.0);
            var sInv = 1.0 / s;
            vec3.cross(a, b, axis);
            dest[0] = axis[0] * sInv;
            dest[1] = axis[1] * sInv;
            dest[2] = axis[2] * sInv;
            dest[3] = s * 0.5;
            quat4.normalize(dest);
        }
        if (dest[3] > 1.0) dest[3] = 1.0;
        else if (dest[3] < -1.0) dest[3] = -1.0;
        return dest;
    };

    /**
     * Returns a string representation of a vector
     *
     * @param {vec3} vec Vector to represent as a string
     *
     * @returns {string} String representation of vec
     */
    vec3.str = function (vec) {
        return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ']';
    };

    /**
     * @class 3x3 Matrix
     * @name mat3
     */
    var mat3 = {};

    /**
     * Creates a new instance of a mat3 using the default array type
     * Any javascript array-like object containing at least 9 numeric elements can serve as a mat3
     *
     * @param {mat3} [mat] mat3 containing values to initialize with
     *
     * @returns {mat3} New mat3
     */
    mat3.create = function (mat) {
        var dest = new MatrixArray(9);

        if (mat) {
            dest[0] = mat[0];
            dest[1] = mat[1];
            dest[2] = mat[2];
            dest[3] = mat[3];
            dest[4] = mat[4];
            dest[5] = mat[5];
            dest[6] = mat[6];
            dest[7] = mat[7];
            dest[8] = mat[8];
        } else {
            dest[0] = dest[1] =
            dest[2] = dest[3] =
            dest[4] = dest[5] =
            dest[6] = dest[7] =
            dest[8] = 0;
        }

        return dest;
    };

    /**
     * Creates a new instance of a mat3, initializing it with the given arguments
     *
     * @param {number} m00
     * @param {number} m01
     * @param {number} m02
     * @param {number} m10
     * @param {number} m11
     * @param {number} m12
     * @param {number} m20
     * @param {number} m21
     * @param {number} m22

     * @returns {mat3} New mat3
     */
    mat3.createFrom = function (m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        var dest = new MatrixArray(9);

        dest[0] = m00;
        dest[1] = m01;
        dest[2] = m02;
        dest[3] = m10;
        dest[4] = m11;
        dest[5] = m12;
        dest[6] = m20;
        dest[7] = m21;
        dest[8] = m22;

        return dest;
    };

    /**
     * Calculates the determinant of a mat3
     *
     * @param {mat3} mat mat3 to calculate determinant of
     *
     * @returns {Number} determinant of mat
     */
    mat3.determinant = function (mat) {
        var a00 = mat[0], a01 = mat[1], a02 = mat[2],
            a10 = mat[3], a11 = mat[4], a12 = mat[5],
            a20 = mat[6], a21 = mat[7], a22 = mat[8];

        return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
    };

    /**
     * Calculates the inverse matrix of a mat3
     *
     * @param {mat3} mat mat3 to calculate inverse of
     * @param {mat3} [dest] mat3 receiving inverse matrix. If not specified result is written to mat
     *
     * @param {mat3} dest is specified, mat otherwise, null if matrix cannot be inverted
     */
    mat3.inverse = function (mat, dest) {
        var a00 = mat[0], a01 = mat[1], a02 = mat[2],
            a10 = mat[3], a11 = mat[4], a12 = mat[5],
            a20 = mat[6], a21 = mat[7], a22 = mat[8],

            b01 = a22 * a11 - a12 * a21,
            b11 = -a22 * a10 + a12 * a20,
            b21 = a21 * a10 - a11 * a20,

            d = a00 * b01 + a01 * b11 + a02 * b21,
            id;

        if (!d) { return null; }
        id = 1 / d;

        if (!dest) { dest = mat3.create(); }

        dest[0] = b01 * id;
        dest[1] = (-a22 * a01 + a02 * a21) * id;
        dest[2] = (a12 * a01 - a02 * a11) * id;
        dest[3] = b11 * id;
        dest[4] = (a22 * a00 - a02 * a20) * id;
        dest[5] = (-a12 * a00 + a02 * a10) * id;
        dest[6] = b21 * id;
        dest[7] = (-a21 * a00 + a01 * a20) * id;
        dest[8] = (a11 * a00 - a01 * a10) * id;
        return dest;
    };
    
    /**
     * Performs a matrix multiplication
     *
     * @param {mat3} mat First operand
     * @param {mat3} mat2 Second operand
     * @param {mat3} [dest] mat3 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat3} dest if specified, mat otherwise
     */
    mat3.multiply = function (mat, mat2, dest) {
        if (!dest) { dest = mat; }
        

        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2],
            a10 = mat[3], a11 = mat[4], a12 = mat[5],
            a20 = mat[6], a21 = mat[7], a22 = mat[8],

            b00 = mat2[0], b01 = mat2[1], b02 = mat2[2],
            b10 = mat2[3], b11 = mat2[4], b12 = mat2[5],
            b20 = mat2[6], b21 = mat2[7], b22 = mat2[8];

        dest[0] = b00 * a00 + b01 * a10 + b02 * a20;
        dest[1] = b00 * a01 + b01 * a11 + b02 * a21;
        dest[2] = b00 * a02 + b01 * a12 + b02 * a22;

        dest[3] = b10 * a00 + b11 * a10 + b12 * a20;
        dest[4] = b10 * a01 + b11 * a11 + b12 * a21;
        dest[5] = b10 * a02 + b11 * a12 + b12 * a22;

        dest[6] = b20 * a00 + b21 * a10 + b22 * a20;
        dest[7] = b20 * a01 + b21 * a11 + b22 * a21;
        dest[8] = b20 * a02 + b21 * a12 + b22 * a22;

        return dest;
    };

    /**
     * Transforms the vec2 according to the given mat3.
     *
     * @param {mat3} matrix mat3 to multiply against
     * @param {vec2} vec    the vector to multiply
     * @param {vec2} [dest] an optional receiving vector. If not given, vec is used.
     *
     * @returns {vec2} The multiplication result
     **/
    mat3.multiplyVec2 = function(matrix, vec, dest) {
      if (!dest) dest = vec;
      var x = vec[0], y = vec[1];
      dest[0] = x * matrix[0] + y * matrix[3] + matrix[6];
      dest[1] = x * matrix[1] + y * matrix[4] + matrix[7];
      return dest;
    };

    /**
     * Transforms the vec3 according to the given mat3
     *
     * @param {mat3} matrix mat3 to multiply against
     * @param {vec3} vec    the vector to multiply
     * @param {vec3} [dest] an optional receiving vector. If not given, vec is used.
     *
     * @returns {vec3} The multiplication result
     **/
    mat3.multiplyVec3 = function(matrix, vec, dest) {
      if (!dest) dest = vec;
      var x = vec[0], y = vec[1], z = vec[2];
      dest[0] = x * matrix[0] + y * matrix[3] + z * matrix[6];
      dest[1] = x * matrix[1] + y * matrix[4] + z * matrix[7];
      dest[2] = x * matrix[2] + y * matrix[5] + z * matrix[8];
      
      return dest;
    };
    
    /**
     * Translates a matrix by the given vector
     *
     * @param {mat3} mat mat3 to translate
     * @param {vec2} vec vec2 specifying the translation
     * @param {mat3} [dest] mat3 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat3} dest if specified, mat otherwise
     */
    mat3.translate = function(mat, vec, dest) {
        var x = vec[0], y = vec[1],
            a00, a01, a02,
            a10, a11, a12,
            a20, a21, a22;
        
        if (!dest || mat === dest) {
            mat[6] = mat[0] * x + mat[3] * y + mat[6];
            mat[7] = mat[1] * x + mat[4] * y + mat[7];
            mat[8] = mat[2] * x + mat[5] * y + mat[8];
            return mat;
        }
        
        a00 = mat[0]; a01 = mat[1]; a02 = mat[2];
        a10 = mat[3]; a11 = mat[4]; a12 = mat[5];
        a20 = mat[6]; a21 = mat[7]; a22 = mat[8];
        
        dest[0] = a00; dest[1] = a01; dest[2] = a02;
        dest[3] = a10; dest[4] = a11; dest[5] = a12;
        dest[6] = a20; dest[7] = a21; dest[8] = a22;
        
        dest[6] = mat[0] * x + mat[3] * y + mat[6];
        dest[7] = mat[1] * x + mat[4] * y + mat[7];
        dest[8] = mat[2] * x + mat[5] * y + mat[8];
        return dest;
    };
    
    /**
     * Scales a matrix by the given vector
     *
     * @param {mat3} mat mat3 to scale
     * @param {vec2} vec vec2 specifying the scale for each axis
     * @param {mat3} [dest] mat3 receiving operation result. If not specified result is written to mat
     *
     * @param {mat3} dest if specified, mat otherwise
     */
    mat3.scale = function(mat, vec, dest) {
        var x = vec[0], y = vec[1];

        if (!dest || mat === dest) {
            mat[0] *= x;
            mat[1] *= x;
            mat[2] *= x;
            mat[3] *= y;
            mat[4] *= y;
            mat[5] *= y;
            return mat;
        }

        dest[0] = mat[0] * x;
        dest[1] = mat[1] * x;
        dest[2] = mat[2] * x;
        dest[3] = mat[3] * y;
        dest[4] = mat[4] * y;
        dest[5] = mat[5] * y;
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        return dest;
    };
    
    /**
     * Rotates a matrix by the given angle around the Z axis
     *
     * @param {mat3} mat mat3 to rotate
     * @param {number} angle Angle (in radians) to rotate
     * @param {mat3} [dest] mat3 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat3} dest if specified, mat otherwise
     */
    mat3.rotate = function (mat, angle, dest) {
        var s = Math.sin(angle),
            c = Math.cos(angle),
            a00 = mat[0],
            a01 = mat[1],
            a02 = mat[2],
            a10 = mat[3],
            a11 = mat[4],
            a12 = mat[5];

        if (!dest) {
            dest = mat;
        } else if (mat !== dest) { // If the source and destination differ, copy the unchanged last row
            dest[6] = mat[6];
            dest[7] = mat[7];
            dest[8] = mat[8];
        }

        // Perform axis-specific matrix multiplication
        dest[0] = a00 * c + a10 * s;
        dest[1] = a01 * c + a11 * s;
        dest[2] = a02 * c + a12 * s;

        dest[3] = a00 * -s + a10 * c;
        dest[4] = a01 * -s + a11 * c;
        dest[5] = a02 * -s + a12 * c;

        return dest;
    };

    /**
     * Copies the values of one mat3 to another
     *
     * @param {mat3} mat mat3 containing values to copy
     * @param {mat3} dest mat3 receiving copied values
     *
     * @returns {mat3} dest
     */
    mat3.set = function (mat, dest) {
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        return dest;
    };

    /**
     * Compares two matrices for equality within a certain margin of error
     *
     * @param {mat3} a First matrix
     * @param {mat3} b Second matrix
     *
     * @returns {Boolean} True if a is equivalent to b
     */
    mat3.equal = function (a, b) {
        return a === b || (
            Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
            Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
            Math.abs(a[2] - b[2]) < FLOAT_EPSILON &&
            Math.abs(a[3] - b[3]) < FLOAT_EPSILON &&
            Math.abs(a[4] - b[4]) < FLOAT_EPSILON &&
            Math.abs(a[5] - b[5]) < FLOAT_EPSILON &&
            Math.abs(a[6] - b[6]) < FLOAT_EPSILON &&
            Math.abs(a[7] - b[7]) < FLOAT_EPSILON &&
            Math.abs(a[8] - b[8]) < FLOAT_EPSILON
        );
    };

    /**
     * Sets a mat3 to an identity matrix
     *
     * @param {mat3} dest mat3 to set
     *
     * @returns dest if specified, otherwise a new mat3
     */
    mat3.identity = function (dest) {
        if (!dest) { dest = mat3.create(); }
        dest[0] = 1;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 1;
        dest[5] = 0;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 1;
        return dest;
    };

    /**
     * Transposes a mat3 (flips the values over the diagonal)
     *
     * Params:
     * @param {mat3} mat mat3 to transpose
     * @param {mat3} [dest] mat3 receiving transposed values. If not specified result is written to mat
     *
     * @returns {mat3} dest is specified, mat otherwise
     */
    mat3.transpose = function (mat, dest) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (!dest || mat === dest) {
            var a01 = mat[1], a02 = mat[2],
                a12 = mat[5];

            mat[1] = mat[3];
            mat[2] = mat[6];
            mat[3] = a01;
            mat[5] = mat[7];
            mat[6] = a02;
            mat[7] = a12;
            return mat;
        }

        dest[0] = mat[0];
        dest[1] = mat[3];
        dest[2] = mat[6];
        dest[3] = mat[1];
        dest[4] = mat[4];
        dest[5] = mat[7];
        dest[6] = mat[2];
        dest[7] = mat[5];
        dest[8] = mat[8];
        return dest;
    };

    /**
     * Copies the elements of a mat3 into the upper 3x3 elements of a mat4
     *
     * @param {mat3} mat mat3 containing values to copy
     * @param {mat4} [dest] mat4 receiving copied values
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat3.toMat4 = function (mat, dest) {
        if (!dest) { dest = mat4.create(); }

        dest[15] = 1;
        dest[14] = 0;
        dest[13] = 0;
        dest[12] = 0;

        dest[11] = 0;
        dest[10] = mat[8];
        dest[9] = mat[7];
        dest[8] = mat[6];

        dest[7] = 0;
        dest[6] = mat[5];
        dest[5] = mat[4];
        dest[4] = mat[3];

        dest[3] = 0;
        dest[2] = mat[2];
        dest[1] = mat[1];
        dest[0] = mat[0];

        return dest;
    };

    /**
     * Returns a string representation of a mat3
     *
     * @param {mat3} mat mat3 to represent as a string
     *
     * @param {string} String representation of mat
     */
    mat3.str = function (mat) {
        return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] +
            ', ' + mat[3] + ', ' + mat[4] + ', ' + mat[5] +
            ', ' + mat[6] + ', ' + mat[7] + ', ' + mat[8] + ']';
    };

    /**
     * @class 4x4 Matrix
     * @name mat4
     */
    var mat4 = {};

    /**
     * Creates a new instance of a mat4 using the default array type
     * Any javascript array-like object containing at least 16 numeric elements can serve as a mat4
     *
     * @param {mat4} [mat] mat4 containing values to initialize with
     *
     * @returns {mat4} New mat4
     */
    mat4.create = function (mat) {
        var dest = new MatrixArray(16);

        if (mat) {
            dest[0] = mat[0];
            dest[1] = mat[1];
            dest[2] = mat[2];
            dest[3] = mat[3];
            dest[4] = mat[4];
            dest[5] = mat[5];
            dest[6] = mat[6];
            dest[7] = mat[7];
            dest[8] = mat[8];
            dest[9] = mat[9];
            dest[10] = mat[10];
            dest[11] = mat[11];
            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15];
        }

        return dest;
    };

    /**
     * Creates a new instance of a mat4, initializing it with the given arguments
     *
     * @param {number} m00
     * @param {number} m01
     * @param {number} m02
     * @param {number} m03
     * @param {number} m10
     * @param {number} m11
     * @param {number} m12
     * @param {number} m13
     * @param {number} m20
     * @param {number} m21
     * @param {number} m22
     * @param {number} m23
     * @param {number} m30
     * @param {number} m31
     * @param {number} m32
     * @param {number} m33

     * @returns {mat4} New mat4
     */
    mat4.createFrom = function (m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
        var dest = new MatrixArray(16);

        dest[0] = m00;
        dest[1] = m01;
        dest[2] = m02;
        dest[3] = m03;
        dest[4] = m10;
        dest[5] = m11;
        dest[6] = m12;
        dest[7] = m13;
        dest[8] = m20;
        dest[9] = m21;
        dest[10] = m22;
        dest[11] = m23;
        dest[12] = m30;
        dest[13] = m31;
        dest[14] = m32;
        dest[15] = m33;

        return dest;
    };

    /**
     * Copies the values of one mat4 to another
     *
     * @param {mat4} mat mat4 containing values to copy
     * @param {mat4} dest mat4 receiving copied values
     *
     * @returns {mat4} dest
     */
    mat4.set = function (mat, dest) {
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        dest[9] = mat[9];
        dest[10] = mat[10];
        dest[11] = mat[11];
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
        return dest;
    };

    /**
     * Compares two matrices for equality within a certain margin of error
     *
     * @param {mat4} a First matrix
     * @param {mat4} b Second matrix
     *
     * @returns {Boolean} True if a is equivalent to b
     */
    mat4.equal = function (a, b) {
        return a === b || (
            Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
            Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
            Math.abs(a[2] - b[2]) < FLOAT_EPSILON &&
            Math.abs(a[3] - b[3]) < FLOAT_EPSILON &&
            Math.abs(a[4] - b[4]) < FLOAT_EPSILON &&
            Math.abs(a[5] - b[5]) < FLOAT_EPSILON &&
            Math.abs(a[6] - b[6]) < FLOAT_EPSILON &&
            Math.abs(a[7] - b[7]) < FLOAT_EPSILON &&
            Math.abs(a[8] - b[8]) < FLOAT_EPSILON &&
            Math.abs(a[9] - b[9]) < FLOAT_EPSILON &&
            Math.abs(a[10] - b[10]) < FLOAT_EPSILON &&
            Math.abs(a[11] - b[11]) < FLOAT_EPSILON &&
            Math.abs(a[12] - b[12]) < FLOAT_EPSILON &&
            Math.abs(a[13] - b[13]) < FLOAT_EPSILON &&
            Math.abs(a[14] - b[14]) < FLOAT_EPSILON &&
            Math.abs(a[15] - b[15]) < FLOAT_EPSILON
        );
    };

    /**
     * Sets a mat4 to an identity matrix
     *
     * @param {mat4} dest mat4 to set
     *
     * @returns {mat4} dest
     */
    mat4.identity = function (dest) {
        if (!dest) { dest = mat4.create(); }
        dest[0] = 1;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = 1;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 0;
        dest[9] = 0;
        dest[10] = 1;
        dest[11] = 0;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;
        return dest;
    };

    /**
     * Transposes a mat4 (flips the values over the diagonal)
     *
     * @param {mat4} mat mat4 to transpose
     * @param {mat4} [dest] mat4 receiving transposed values. If not specified result is written to mat
     *
     * @param {mat4} dest is specified, mat otherwise
     */
    mat4.transpose = function (mat, dest) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (!dest || mat === dest) {
            var a01 = mat[1], a02 = mat[2], a03 = mat[3],
                a12 = mat[6], a13 = mat[7],
                a23 = mat[11];

            mat[1] = mat[4];
            mat[2] = mat[8];
            mat[3] = mat[12];
            mat[4] = a01;
            mat[6] = mat[9];
            mat[7] = mat[13];
            mat[8] = a02;
            mat[9] = a12;
            mat[11] = mat[14];
            mat[12] = a03;
            mat[13] = a13;
            mat[14] = a23;
            return mat;
        }

        dest[0] = mat[0];
        dest[1] = mat[4];
        dest[2] = mat[8];
        dest[3] = mat[12];
        dest[4] = mat[1];
        dest[5] = mat[5];
        dest[6] = mat[9];
        dest[7] = mat[13];
        dest[8] = mat[2];
        dest[9] = mat[6];
        dest[10] = mat[10];
        dest[11] = mat[14];
        dest[12] = mat[3];
        dest[13] = mat[7];
        dest[14] = mat[11];
        dest[15] = mat[15];
        return dest;
    };

    /**
     * Calculates the determinant of a mat4
     *
     * @param {mat4} mat mat4 to calculate determinant of
     *
     * @returns {number} determinant of mat
     */
    mat4.determinant = function (mat) {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
            a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
            a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
            a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

        return (a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
                a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
                a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
                a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
                a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
                a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33);
    };

    /**
     * Calculates the inverse matrix of a mat4
     *
     * @param {mat4} mat mat4 to calculate inverse of
     * @param {mat4} [dest] mat4 receiving inverse matrix. If not specified result is written to mat
     *
     * @param {mat4} dest is specified, mat otherwise, null if matrix cannot be inverted
     */
    mat4.inverse = function (mat, dest) {
        if (!dest) { dest = mat; }

        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
            a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
            a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
            a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

            b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32,

            d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06),
            invDet;

            // Calculate the determinant
            if (!d) { return null; }
            invDet = 1 / d;

        dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
        dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
        dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
        dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
        dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
        dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
        dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
        dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
        dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
        dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
        dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
        dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
        dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
        dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
        dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
        dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

        return dest;
    };

    /**
     * Copies the upper 3x3 elements of a mat4 into another mat4
     *
     * @param {mat4} mat mat4 containing values to copy
     * @param {mat4} [dest] mat4 receiving copied values
     *
     * @returns {mat4} dest is specified, a new mat4 otherwise
     */
    mat4.toRotationMat = function (mat, dest) {
        if (!dest) { dest = mat4.create(); }

        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        dest[9] = mat[9];
        dest[10] = mat[10];
        dest[11] = mat[11];
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;

        return dest;
    };

    /**
     * Copies the upper 3x3 elements of a mat4 into a mat3
     *
     * @param {mat4} mat mat4 containing values to copy
     * @param {mat3} [dest] mat3 receiving copied values
     *
     * @returns {mat3} dest is specified, a new mat3 otherwise
     */
    mat4.toMat3 = function (mat, dest) {
        if (!dest) { dest = mat3.create(); }

        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[4];
        dest[4] = mat[5];
        dest[5] = mat[6];
        dest[6] = mat[8];
        dest[7] = mat[9];
        dest[8] = mat[10];

        return dest;
    };

    /**
     * Calculates the inverse of the upper 3x3 elements of a mat4 and copies the result into a mat3
     * The resulting matrix is useful for calculating transformed normals
     *
     * Params:
     * @param {mat4} mat mat4 containing values to invert and copy
     * @param {mat3} [dest] mat3 receiving values
     *
     * @returns {mat3} dest is specified, a new mat3 otherwise, null if the matrix cannot be inverted
     */
    mat4.toInverseMat3 = function (mat, dest) {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2],
            a10 = mat[4], a11 = mat[5], a12 = mat[6],
            a20 = mat[8], a21 = mat[9], a22 = mat[10],

            b01 = a22 * a11 - a12 * a21,
            b11 = -a22 * a10 + a12 * a20,
            b21 = a21 * a10 - a11 * a20,

            d = a00 * b01 + a01 * b11 + a02 * b21,
            id;

        if (!d) { return null; }
        id = 1 / d;

        if (!dest) { dest = mat3.create(); }

        dest[0] = b01 * id;
        dest[1] = (-a22 * a01 + a02 * a21) * id;
        dest[2] = (a12 * a01 - a02 * a11) * id;
        dest[3] = b11 * id;
        dest[4] = (a22 * a00 - a02 * a20) * id;
        dest[5] = (-a12 * a00 + a02 * a10) * id;
        dest[6] = b21 * id;
        dest[7] = (-a21 * a00 + a01 * a20) * id;
        dest[8] = (a11 * a00 - a01 * a10) * id;

        return dest;
    };

    /**
     * Performs a matrix multiplication
     *
     * @param {mat4} mat First operand
     * @param {mat4} mat2 Second operand
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.multiply = function (mat, mat2, dest) {
        if (!dest) { dest = mat; }

        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[ 0], a01 = mat[ 1], a02 = mat[ 2], a03 = mat[3];
        var a10 = mat[ 4], a11 = mat[ 5], a12 = mat[ 6], a13 = mat[7];
        var a20 = mat[ 8], a21 = mat[ 9], a22 = mat[10], a23 = mat[11];
        var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

        // Cache only the current line of the second matrix
        var b0  = mat2[0], b1 = mat2[1], b2 = mat2[2], b3 = mat2[3];  
        dest[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        dest[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        dest[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        dest[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = mat2[4];
        b1 = mat2[5];
        b2 = mat2[6];
        b3 = mat2[7];
        dest[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        dest[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        dest[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        dest[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = mat2[8];
        b1 = mat2[9];
        b2 = mat2[10];
        b3 = mat2[11];
        dest[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        dest[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        dest[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        dest[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = mat2[12];
        b1 = mat2[13];
        b2 = mat2[14];
        b3 = mat2[15];
        dest[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        dest[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        dest[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        dest[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        return dest;
    };

    /**
     * Transforms a vec3 with the given matrix
     * 4th vector component is implicitly '1'
     *
     * @param {mat4} mat mat4 to transform the vector with
     * @param {vec3} vec vec3 to transform
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    mat4.multiplyVec3 = function (mat, vec, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0], y = vec[1], z = vec[2];

        dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
        dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
        dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];

        return dest;
    };

    /**
     * Transforms a vec4 with the given matrix
     *
     * @param {mat4} mat mat4 to transform the vector with
     * @param {vec4} vec vec4 to transform
     * @param {vec4} [dest] vec4 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec4} dest if specified, vec otherwise
     */
    mat4.multiplyVec4 = function (mat, vec, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0], y = vec[1], z = vec[2], w = vec[3];

        dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
        dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
        dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
        dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;

        return dest;
    };

    /**
     * Translates a matrix by the given vector
     *
     * @param {mat4} mat mat4 to translate
     * @param {vec3} vec vec3 specifying the translation
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.translate = function (mat, vec, dest) {
        var x = vec[0], y = vec[1], z = vec[2],
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23;

        if (!dest || mat === dest) {
            mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
            mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
            mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
            mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
            return mat;
        }

        a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
        a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
        a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];

        dest[0] = a00; dest[1] = a01; dest[2] = a02; dest[3] = a03;
        dest[4] = a10; dest[5] = a11; dest[6] = a12; dest[7] = a13;
        dest[8] = a20; dest[9] = a21; dest[10] = a22; dest[11] = a23;

        dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
        dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
        dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
        dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
        return dest;
    };

    /**
     * Scales a matrix by the given vector
     *
     * @param {mat4} mat mat4 to scale
     * @param {vec3} vec vec3 specifying the scale for each axis
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @param {mat4} dest if specified, mat otherwise
     */
    mat4.scale = function (mat, vec, dest) {
        var x = vec[0], y = vec[1], z = vec[2];

        if (!dest || mat === dest) {
            mat[0] *= x;
            mat[1] *= x;
            mat[2] *= x;
            mat[3] *= x;
            mat[4] *= y;
            mat[5] *= y;
            mat[6] *= y;
            mat[7] *= y;
            mat[8] *= z;
            mat[9] *= z;
            mat[10] *= z;
            mat[11] *= z;
            return mat;
        }

        dest[0] = mat[0] * x;
        dest[1] = mat[1] * x;
        dest[2] = mat[2] * x;
        dest[3] = mat[3] * x;
        dest[4] = mat[4] * y;
        dest[5] = mat[5] * y;
        dest[6] = mat[6] * y;
        dest[7] = mat[7] * y;
        dest[8] = mat[8] * z;
        dest[9] = mat[9] * z;
        dest[10] = mat[10] * z;
        dest[11] = mat[11] * z;
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
        return dest;
    };

    /**
     * Rotates a matrix by the given angle around the specified axis
     * If rotating around a primary axis (X,Y,Z) one of the specialized rotation functions should be used instead for performance
     *
     * @param {mat4} mat mat4 to rotate
     * @param {number} angle Angle (in radians) to rotate
     * @param {vec3} axis vec3 representing the axis to rotate around
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.rotate = function (mat, angle, axis, dest) {
        var x = axis[0], y = axis[1], z = axis[2],
            len = Math.sqrt(x * x + y * y + z * z),
            s, c, t,
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23,
            b00, b01, b02,
            b10, b11, b12,
            b20, b21, b22;

        if (!len) { return null; }
        if (len !== 1) {
            len = 1 / len;
            x *= len;
            y *= len;
            z *= len;
        }

        s = Math.sin(angle);
        c = Math.cos(angle);
        t = 1 - c;

        a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
        a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
        a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];

        // Construct the elements of the rotation matrix
        b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
        b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
        b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

        if (!dest) {
            dest = mat;
        } else if (mat !== dest) { // If the source and destination differ, copy the unchanged last row
            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15];
        }

        // Perform rotation-specific matrix multiplication
        dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
        dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
        dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
        dest[3] = a03 * b00 + a13 * b01 + a23 * b02;

        dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
        dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
        dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
        dest[7] = a03 * b10 + a13 * b11 + a23 * b12;

        dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
        dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
        dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
        dest[11] = a03 * b20 + a13 * b21 + a23 * b22;
        return dest;
    };

    /**
     * Rotates a matrix by the given angle around the X axis
     *
     * @param {mat4} mat mat4 to rotate
     * @param {number} angle Angle (in radians) to rotate
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.rotateX = function (mat, angle, dest) {
        var s = Math.sin(angle),
            c = Math.cos(angle),
            a10 = mat[4],
            a11 = mat[5],
            a12 = mat[6],
            a13 = mat[7],
            a20 = mat[8],
            a21 = mat[9],
            a22 = mat[10],
            a23 = mat[11];

        if (!dest) {
            dest = mat;
        } else if (mat !== dest) { // If the source and destination differ, copy the unchanged rows
            dest[0] = mat[0];
            dest[1] = mat[1];
            dest[2] = mat[2];
            dest[3] = mat[3];

            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15];
        }

        // Perform axis-specific matrix multiplication
        dest[4] = a10 * c + a20 * s;
        dest[5] = a11 * c + a21 * s;
        dest[6] = a12 * c + a22 * s;
        dest[7] = a13 * c + a23 * s;

        dest[8] = a10 * -s + a20 * c;
        dest[9] = a11 * -s + a21 * c;
        dest[10] = a12 * -s + a22 * c;
        dest[11] = a13 * -s + a23 * c;
        return dest;
    };

    /**
     * Rotates a matrix by the given angle around the Y axis
     *
     * @param {mat4} mat mat4 to rotate
     * @param {number} angle Angle (in radians) to rotate
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.rotateY = function (mat, angle, dest) {
        var s = Math.sin(angle),
            c = Math.cos(angle),
            a00 = mat[0],
            a01 = mat[1],
            a02 = mat[2],
            a03 = mat[3],
            a20 = mat[8],
            a21 = mat[9],
            a22 = mat[10],
            a23 = mat[11];

        if (!dest) {
            dest = mat;
        } else if (mat !== dest) { // If the source and destination differ, copy the unchanged rows
            dest[4] = mat[4];
            dest[5] = mat[5];
            dest[6] = mat[6];
            dest[7] = mat[7];

            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15];
        }

        // Perform axis-specific matrix multiplication
        dest[0] = a00 * c + a20 * -s;
        dest[1] = a01 * c + a21 * -s;
        dest[2] = a02 * c + a22 * -s;
        dest[3] = a03 * c + a23 * -s;

        dest[8] = a00 * s + a20 * c;
        dest[9] = a01 * s + a21 * c;
        dest[10] = a02 * s + a22 * c;
        dest[11] = a03 * s + a23 * c;
        return dest;
    };

    /**
     * Rotates a matrix by the given angle around the Z axis
     *
     * @param {mat4} mat mat4 to rotate
     * @param {number} angle Angle (in radians) to rotate
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.rotateZ = function (mat, angle, dest) {
        var s = Math.sin(angle),
            c = Math.cos(angle),
            a00 = mat[0],
            a01 = mat[1],
            a02 = mat[2],
            a03 = mat[3],
            a10 = mat[4],
            a11 = mat[5],
            a12 = mat[6],
            a13 = mat[7];

        if (!dest) {
            dest = mat;
        } else if (mat !== dest) { // If the source and destination differ, copy the unchanged last row
            dest[8] = mat[8];
            dest[9] = mat[9];
            dest[10] = mat[10];
            dest[11] = mat[11];

            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15];
        }

        // Perform axis-specific matrix multiplication
        dest[0] = a00 * c + a10 * s;
        dest[1] = a01 * c + a11 * s;
        dest[2] = a02 * c + a12 * s;
        dest[3] = a03 * c + a13 * s;

        dest[4] = a00 * -s + a10 * c;
        dest[5] = a01 * -s + a11 * c;
        dest[6] = a02 * -s + a12 * c;
        dest[7] = a03 * -s + a13 * c;

        return dest;
    };

    /**
     * Generates a frustum matrix with the given bounds
     *
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @param {mat4} [dest] mat4 frustum matrix will be written into
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat4.frustum = function (left, right, bottom, top, near, far, dest) {
        if (!dest) { dest = mat4.create(); }
        var rl = (right - left),
            tb = (top - bottom),
            fn = (far - near);
        dest[0] = (near * 2) / rl;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = (near * 2) / tb;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = (right + left) / rl;
        dest[9] = (top + bottom) / tb;
        dest[10] = -(far + near) / fn;
        dest[11] = -1;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = -(far * near * 2) / fn;
        dest[15] = 0;
        return dest;
    };

    /**
     * Generates a perspective projection matrix with the given bounds
     *
     * @param {number} fovy Vertical field of view
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @param {mat4} [dest] mat4 frustum matrix will be written into
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat4.perspective = function (fovy, aspect, near, far, dest) {
        var top = near * Math.tan(fovy * Math.PI / 360.0),
            right = top * aspect;
        return mat4.frustum(-right, right, -top, top, near, far, dest);
    };

    /**
     * Generates a orthogonal projection matrix with the given bounds
     *
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @param {mat4} [dest] mat4 frustum matrix will be written into
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat4.ortho = function (left, right, bottom, top, near, far, dest) {
        if (!dest) { dest = mat4.create(); }
        var rl = (right - left),
            tb = (top - bottom),
            fn = (far - near);
        dest[0] = 2 / rl;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = 2 / tb;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 0;
        dest[9] = 0;
        dest[10] = -2 / fn;
        dest[11] = 0;
        dest[12] = -(left + right) / rl;
        dest[13] = -(top + bottom) / tb;
        dest[14] = -(far + near) / fn;
        dest[15] = 1;
        return dest;
    };

    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis
     *
     * @param {vec3} eye Position of the viewer
     * @param {vec3} center Point the viewer is looking at
     * @param {vec3} up vec3 pointing "up"
     * @param {mat4} [dest] mat4 frustum matrix will be written into
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat4.lookAt = function (eye, center, up, dest) {
        if (!dest) { dest = mat4.create(); }

        var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
            eyex = eye[0],
            eyey = eye[1],
            eyez = eye[2],
            upx = up[0],
            upy = up[1],
            upz = up[2],
            centerx = center[0],
            centery = center[1],
            centerz = center[2];

        if (eyex === centerx && eyey === centery && eyez === centerz) {
            return mat4.identity(dest);
        }

        //vec3.direction(eye, center, z);
        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;

        // normalize (no check needed for 0 because of early return)
        len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;

        //vec3.normalize(vec3.cross(up, z, x));
        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        //vec3.normalize(vec3.cross(z, x, y));
        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }

        dest[0] = x0;
        dest[1] = y0;
        dest[2] = z0;
        dest[3] = 0;
        dest[4] = x1;
        dest[5] = y1;
        dest[6] = z1;
        dest[7] = 0;
        dest[8] = x2;
        dest[9] = y2;
        dest[10] = z2;
        dest[11] = 0;
        dest[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        dest[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        dest[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        dest[15] = 1;

        return dest;
    };

    /**
     * Creates a matrix from a quaternion rotation and vector translation
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.translate(dest, vec);
     *     var quatMat = mat4.create();
     *     quat4.toMat4(quat, quatMat);
     *     mat4.multiply(dest, quatMat);
     *
     * @param {quat4} quat Rotation quaternion
     * @param {vec3} vec Translation vector
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to a new mat4
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat4.fromRotationTranslation = function (quat, vec, dest) {
        if (!dest) { dest = mat4.create(); }

        // Quaternion math
        var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
            x2 = x + x,
            y2 = y + y,
            z2 = z + z,

            xx = x * x2,
            xy = x * y2,
            xz = x * z2,
            yy = y * y2,
            yz = y * z2,
            zz = z * z2,
            wx = w * x2,
            wy = w * y2,
            wz = w * z2;

        dest[0] = 1 - (yy + zz);
        dest[1] = xy + wz;
        dest[2] = xz - wy;
        dest[3] = 0;
        dest[4] = xy - wz;
        dest[5] = 1 - (xx + zz);
        dest[6] = yz + wx;
        dest[7] = 0;
        dest[8] = xz + wy;
        dest[9] = yz - wx;
        dest[10] = 1 - (xx + yy);
        dest[11] = 0;
        dest[12] = vec[0];
        dest[13] = vec[1];
        dest[14] = vec[2];
        dest[15] = 1;
        
        return dest;
    };

    /**
     * Returns a string representation of a mat4
     *
     * @param {mat4} mat mat4 to represent as a string
     *
     * @returns {string} String representation of mat
     */
    mat4.str = function (mat) {
        return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] +
            ', ' + mat[4] + ', ' + mat[5] + ', ' + mat[6] + ', ' + mat[7] +
            ', ' + mat[8] + ', ' + mat[9] + ', ' + mat[10] + ', ' + mat[11] +
            ', ' + mat[12] + ', ' + mat[13] + ', ' + mat[14] + ', ' + mat[15] + ']';
    };

    /**
     * @class Quaternion
     * @name quat4
     */
    var quat4 = {};

    /**
     * Creates a new instance of a quat4 using the default array type
     * Any javascript array containing at least 4 numeric elements can serve as a quat4
     *
     * @param {quat4} [quat] quat4 containing values to initialize with
     *
     * @returns {quat4} New quat4
     */
    quat4.create = function (quat) {
        var dest = new MatrixArray(4);

        if (quat) {
            dest[0] = quat[0];
            dest[1] = quat[1];
            dest[2] = quat[2];
            dest[3] = quat[3];
        } else {
            dest[0] = dest[1] = dest[2] = dest[3] = 0;
        }

        return dest;
    };

    /**
     * Creates a new instance of a quat4, initializing it with the given arguments
     *
     * @param {number} x X value
     * @param {number} y Y value
     * @param {number} z Z value
     * @param {number} w W value

     * @returns {quat4} New quat4
     */
    quat4.createFrom = function (x, y, z, w) {
        var dest = new MatrixArray(4);

        dest[0] = x;
        dest[1] = y;
        dest[2] = z;
        dest[3] = w;

        return dest;
    };

    /**
     * Copies the values of one quat4 to another
     *
     * @param {quat4} quat quat4 containing values to copy
     * @param {quat4} dest quat4 receiving copied values
     *
     * @returns {quat4} dest
     */
    quat4.set = function (quat, dest) {
        dest[0] = quat[0];
        dest[1] = quat[1];
        dest[2] = quat[2];
        dest[3] = quat[3];

        return dest;
    };

    /**
     * Compares two quaternions for equality within a certain margin of error
     *
     * @param {quat4} a First vector
     * @param {quat4} b Second vector
     *
     * @returns {Boolean} True if a is equivalent to b
     */
    quat4.equal = function (a, b) {
        return a === b || (
            Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
            Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
            Math.abs(a[2] - b[2]) < FLOAT_EPSILON &&
            Math.abs(a[3] - b[3]) < FLOAT_EPSILON
        );
    };

    /**
     * Creates a new identity Quat4
     *
     * @param {quat4} [dest] quat4 receiving copied values
     *
     * @returns {quat4} dest is specified, new quat4 otherwise
     */
    quat4.identity = function (dest) {
        if (!dest) { dest = quat4.create(); }
        dest[0] = 0;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 1;
        return dest;
    };

    var identityQuat4 = quat4.identity();

    /**
     * Calculates the W component of a quat4 from the X, Y, and Z components.
     * Assumes that quaternion is 1 unit in length.
     * Any existing W component will be ignored.
     *
     * @param {quat4} quat quat4 to calculate W component of
     * @param {quat4} [dest] quat4 receiving calculated values. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.calculateW = function (quat, dest) {
        var x = quat[0], y = quat[1], z = quat[2];

        if (!dest || quat === dest) {
            quat[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
            return quat;
        }
        dest[0] = x;
        dest[1] = y;
        dest[2] = z;
        dest[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
        return dest;
    };

    /**
     * Calculates the dot product of two quaternions
     *
     * @param {quat4} quat First operand
     * @param {quat4} quat2 Second operand
     *
     * @return {number} Dot product of quat and quat2
     */
    quat4.dot = function(quat, quat2){
        return quat[0]*quat2[0] + quat[1]*quat2[1] + quat[2]*quat2[2] + quat[3]*quat2[3];
    };

    /**
     * Calculates the inverse of a quat4
     *
     * @param {quat4} quat quat4 to calculate inverse of
     * @param {quat4} [dest] quat4 receiving inverse values. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.inverse = function(quat, dest) {
        var q0 = quat[0], q1 = quat[1], q2 = quat[2], q3 = quat[3],
            dot = q0*q0 + q1*q1 + q2*q2 + q3*q3,
            invDot = dot ? 1.0/dot : 0;
        
        // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
        
        if(!dest || quat === dest) {
            quat[0] *= -invDot;
            quat[1] *= -invDot;
            quat[2] *= -invDot;
            quat[3] *= invDot;
            return quat;
        }
        dest[0] = -quat[0]*invDot;
        dest[1] = -quat[1]*invDot;
        dest[2] = -quat[2]*invDot;
        dest[3] = quat[3]*invDot;
        return dest;
    };


    /**
     * Calculates the conjugate of a quat4
     * If the quaternion is normalized, this function is faster than quat4.inverse and produces the same result.
     *
     * @param {quat4} quat quat4 to calculate conjugate of
     * @param {quat4} [dest] quat4 receiving conjugate values. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.conjugate = function (quat, dest) {
        if (!dest || quat === dest) {
            quat[0] *= -1;
            quat[1] *= -1;
            quat[2] *= -1;
            return quat;
        }
        dest[0] = -quat[0];
        dest[1] = -quat[1];
        dest[2] = -quat[2];
        dest[3] = quat[3];
        return dest;
    };

    /**
     * Calculates the length of a quat4
     *
     * Params:
     * @param {quat4} quat quat4 to calculate length of
     *
     * @returns Length of quat
     */
    quat4.length = function (quat) {
        var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
        return Math.sqrt(x * x + y * y + z * z + w * w);
    };

    /**
     * Generates a unit quaternion of the same direction as the provided quat4
     * If quaternion length is 0, returns [0, 0, 0, 0]
     *
     * @param {quat4} quat quat4 to normalize
     * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.normalize = function (quat, dest) {
        if (!dest) { dest = quat; }

        var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
            len = Math.sqrt(x * x + y * y + z * z + w * w);
        if (len === 0) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            dest[3] = 0;
            return dest;
        }
        len = 1 / len;
        dest[0] = x * len;
        dest[1] = y * len;
        dest[2] = z * len;
        dest[3] = w * len;

        return dest;
    };

    /**
     * Performs quaternion addition
     *
     * @param {quat4} quat First operand
     * @param {quat4} quat2 Second operand
     * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.add = function (quat, quat2, dest) {
        if(!dest || quat === dest) {
            quat[0] += quat2[0];
            quat[1] += quat2[1];
            quat[2] += quat2[2];
            quat[3] += quat2[3];
            return quat;
        }
        dest[0] = quat[0]+quat2[0];
        dest[1] = quat[1]+quat2[1];
        dest[2] = quat[2]+quat2[2];
        dest[3] = quat[3]+quat2[3];
        return dest;
    };

    /**
     * Performs a quaternion multiplication
     *
     * @param {quat4} quat First operand
     * @param {quat4} quat2 Second operand
     * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.multiply = function (quat, quat2, dest) {
        if (!dest) { dest = quat; }

        var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3],
            qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];

        dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

        return dest;
    };

    /**
     * Transforms a vec3 with the given quaternion
     *
     * @param {quat4} quat quat4 to transform the vector with
     * @param {vec3} vec vec3 to transform
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns dest if specified, vec otherwise
     */
    quat4.multiplyVec3 = function (quat, vec, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0], y = vec[1], z = vec[2],
            qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3],

            // calculate quat * vec
            ix = qw * x + qy * z - qz * y,
            iy = qw * y + qz * x - qx * z,
            iz = qw * z + qx * y - qy * x,
            iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat
        dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

        return dest;
    };

    /**
     * Multiplies the components of a quaternion by a scalar value
     *
     * @param {quat4} quat to scale
     * @param {number} val Value to scale by
     * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.scale = function (quat, val, dest) {
        if(!dest || quat === dest) {
            quat[0] *= val;
            quat[1] *= val;
            quat[2] *= val;
            quat[3] *= val;
            return quat;
        }
        dest[0] = quat[0]*val;
        dest[1] = quat[1]*val;
        dest[2] = quat[2]*val;
        dest[3] = quat[3]*val;
        return dest;
    };

    /**
     * Calculates a 3x3 matrix from the given quat4
     *
     * @param {quat4} quat quat4 to create matrix from
     * @param {mat3} [dest] mat3 receiving operation result
     *
     * @returns {mat3} dest if specified, a new mat3 otherwise
     */
    quat4.toMat3 = function (quat, dest) {
        if (!dest) { dest = mat3.create(); }

        var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
            x2 = x + x,
            y2 = y + y,
            z2 = z + z,

            xx = x * x2,
            xy = x * y2,
            xz = x * z2,
            yy = y * y2,
            yz = y * z2,
            zz = z * z2,
            wx = w * x2,
            wy = w * y2,
            wz = w * z2;

        dest[0] = 1 - (yy + zz);
        dest[1] = xy + wz;
        dest[2] = xz - wy;

        dest[3] = xy - wz;
        dest[4] = 1 - (xx + zz);
        dest[5] = yz + wx;

        dest[6] = xz + wy;
        dest[7] = yz - wx;
        dest[8] = 1 - (xx + yy);

        return dest;
    };

    /**
     * Calculates a 4x4 matrix from the given quat4
     *
     * @param {quat4} quat quat4 to create matrix from
     * @param {mat4} [dest] mat4 receiving operation result
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    quat4.toMat4 = function (quat, dest) {
        if (!dest) { dest = mat4.create(); }

        var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
            x2 = x + x,
            y2 = y + y,
            z2 = z + z,

            xx = x * x2,
            xy = x * y2,
            xz = x * z2,
            yy = y * y2,
            yz = y * z2,
            zz = z * z2,
            wx = w * x2,
            wy = w * y2,
            wz = w * z2;

        dest[0] = 1 - (yy + zz);
        dest[1] = xy + wz;
        dest[2] = xz - wy;
        dest[3] = 0;

        dest[4] = xy - wz;
        dest[5] = 1 - (xx + zz);
        dest[6] = yz + wx;
        dest[7] = 0;

        dest[8] = xz + wy;
        dest[9] = yz - wx;
        dest[10] = 1 - (xx + yy);
        dest[11] = 0;

        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;

        return dest;
    };

    /**
     * Performs a spherical linear interpolation between two quat4
     *
     * @param {quat4} quat First quaternion
     * @param {quat4} quat2 Second quaternion
     * @param {number} slerp Interpolation amount between the two inputs
     * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.slerp = function (quat, quat2, slerp, dest) {
        if (!dest) { dest = quat; }

        var cosHalfTheta = quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3],
            halfTheta,
            sinHalfTheta,
            ratioA,
            ratioB;

        if (Math.abs(cosHalfTheta) >= 1.0) {
            if (dest !== quat) {
                dest[0] = quat[0];
                dest[1] = quat[1];
                dest[2] = quat[2];
                dest[3] = quat[3];
            }
            return dest;
        }

        halfTheta = Math.acos(cosHalfTheta);
        sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

        if (Math.abs(sinHalfTheta) < 0.001) {
            dest[0] = (quat[0] * 0.5 + quat2[0] * 0.5);
            dest[1] = (quat[1] * 0.5 + quat2[1] * 0.5);
            dest[2] = (quat[2] * 0.5 + quat2[2] * 0.5);
            dest[3] = (quat[3] * 0.5 + quat2[3] * 0.5);
            return dest;
        }

        ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
        ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;

        dest[0] = (quat[0] * ratioA + quat2[0] * ratioB);
        dest[1] = (quat[1] * ratioA + quat2[1] * ratioB);
        dest[2] = (quat[2] * ratioA + quat2[2] * ratioB);
        dest[3] = (quat[3] * ratioA + quat2[3] * ratioB);

        return dest;
    };

    /**
     * Creates a quaternion from the given 3x3 rotation matrix.
     * If dest is omitted, a new quaternion will be created.
     *
     * @param {mat3}  mat    the rotation matrix
     * @param {quat4} [dest] an optional receiving quaternion
     *
     * @returns {quat4} the quaternion constructed from the rotation matrix
     *
     */
    quat4.fromRotationMatrix = function(mat, dest) {
        if (!dest) dest = quat4.create();
        
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".

        var fTrace = mat[0] + mat[4] + mat[8];
        var fRoot;

        if ( fTrace > 0.0 ) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0);  // 2w
            dest[3] = 0.5 * fRoot;
            fRoot = 0.5/fRoot;  // 1/(4w)
            dest[0] = (mat[7]-mat[5])*fRoot;
            dest[1] = (mat[2]-mat[6])*fRoot;
            dest[2] = (mat[3]-mat[1])*fRoot;
        } else {
            // |w| <= 1/2
            var s_iNext = quat4.fromRotationMatrix.s_iNext = quat4.fromRotationMatrix.s_iNext || [1,2,0];
            var i = 0;
            if ( mat[4] > mat[0] )
              i = 1;
            if ( mat[8] > mat[i*3+i] )
              i = 2;
            var j = s_iNext[i];
            var k = s_iNext[j];
            
            fRoot = Math.sqrt(mat[i*3+i]-mat[j*3+j]-mat[k*3+k] + 1.0);
            dest[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            dest[3] = (mat[k*3+j] - mat[j*3+k]) * fRoot;
            dest[j] = (mat[j*3+i] + mat[i*3+j]) * fRoot;
            dest[k] = (mat[k*3+i] + mat[i*3+k]) * fRoot;
        }
        
        return dest;
    };

    /**
     * Alias. See the description for quat4.fromRotationMatrix().
     */
    mat3.toQuat4 = quat4.fromRotationMatrix;

    (function() {
        var mat = mat3.create();
        
        /**
         * Creates a quaternion from the 3 given vectors. They must be perpendicular
         * to one another and represent the X, Y and Z axes.
         *
         * If dest is omitted, a new quat4 will be created.
         *
         * Example: The default OpenGL orientation has a view vector [0, 0, -1],
         * right vector [1, 0, 0], and up vector [0, 1, 0]. A quaternion representing
         * this orientation could be constructed with:
         *
         *   quat = quat4.fromAxes([0, 0, -1], [1, 0, 0], [0, 1, 0], quat4.create());
         *
         * @param {vec3}  view   the view vector, or direction the object is pointing in
         * @param {vec3}  right  the right vector, or direction to the "right" of the object
         * @param {vec3}  up     the up vector, or direction towards the object's "up"
         * @param {quat4} [dest] an optional receiving quat4
         *
         * @returns {quat4} dest
         **/
        quat4.fromAxes = function(view, right, up, dest) {
            mat[0] = right[0];
            mat[3] = right[1];
            mat[6] = right[2];

            mat[1] = up[0];
            mat[4] = up[1];
            mat[7] = up[2];

            mat[2] = view[0];
            mat[5] = view[1];
            mat[8] = view[2];

            return quat4.fromRotationMatrix(mat, dest);
        };
    })();

    /**
     * Sets a quat4 to the Identity and returns it.
     *
     * @param {quat4} [dest] quat4 to set. If omitted, a
     * new quat4 will be created.
     *
     * @returns {quat4} dest
     */
    quat4.identity = function(dest) {
        if (!dest) dest = quat4.create();
        dest[0] = 0;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 1;
        return dest;
    };

    /**
     * Sets a quat4 from the given angle and rotation axis,
     * then returns it. If dest is not given, a new quat4 is created.
     *
     * @param {Number} angle  the angle in radians
     * @param {vec3}   axis   the axis around which to rotate
     * @param {quat4}  [dest] the optional quat4 to store the result
     *
     * @returns {quat4} dest
     **/
    quat4.fromAngleAxis = function(angle, axis, dest) {
        // The quaternion representing the rotation is
        //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)
        if (!dest) dest = quat4.create();
        
        var half = angle * 0.5;
        var s = Math.sin(half);
        dest[3] = Math.cos(half);
        dest[0] = s * axis[0];
        dest[1] = s * axis[1];
        dest[2] = s * axis[2];
        
        return dest;
    };

    /**
     * Stores the angle and axis in a vec4, where the XYZ components represent
     * the axis and the W (4th) component is the angle in radians.
     *
     * If dest is not given, src will be modified in place and returned, after
     * which it should not be considered not a quaternion (just an axis and angle).
     *
     * @param {quat4} quat   the quaternion whose angle and axis to store
     * @param {vec4}  [dest] the optional vec4 to receive the data
     *
     * @returns {vec4} dest
     */
    quat4.toAngleAxis = function(src, dest) {
        if (!dest) dest = src;
        // The quaternion representing the rotation is
        //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

        var sqrlen = src[0]*src[0]+src[1]*src[1]+src[2]*src[2];
        if (sqrlen > 0)
        {
            dest[3] = 2 * Math.acos(src[3]);
            var invlen = glMath.invsqrt(sqrlen);
            dest[0] = src[0]*invlen;
            dest[1] = src[1]*invlen;
            dest[2] = src[2]*invlen;
        } else {
            // angle is 0 (mod 2*pi), so any axis will do
            dest[3] = 0;
            dest[0] = 1;
            dest[1] = 0;
            dest[2] = 0;
        }
        
        return dest;
    };

    /**
     * Returns a string representation of a quaternion
     *
     * @param {quat4} quat quat4 to represent as a string
     *
     * @returns {string} String representation of quat
     */
    quat4.str = function (quat) {
        return '[' + quat[0] + ', ' + quat[1] + ', ' + quat[2] + ', ' + quat[3] + ']';
    };
    
    /**
     * @class 2 Dimensional Vector
     * @name vec2
     */
    var vec2 = {};
     
    /**
     * Creates a new vec2, initializing it from vec if vec
     * is given.
     *
     * @param {vec2} [vec] the vector's initial contents
     * @returns {vec2} a new 2D vector
     */
    vec2.create = function(vec) {
        var dest = new MatrixArray(2);

        if (vec) {
            dest[0] = vec[0];
            dest[1] = vec[1];
        } else {
            dest[0] = 0;
            dest[1] = 0;
        }
        return dest;
    };

    /**
     * Creates a new instance of a vec2, initializing it with the given arguments
     *
     * @param {number} x X value
     * @param {number} y Y value

     * @returns {vec2} New vec2
     */
    vec2.createFrom = function (x, y) {
        var dest = new MatrixArray(2);

        dest[0] = x;
        dest[1] = y;

        return dest;
    };
    
    /**
     * Adds the vec2's together. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec2} vecA the first operand
     * @param {vec2} vecB the second operand
     * @param {vec2} [dest] the optional receiving vector
     * @returns {vec2} dest
     */
    vec2.add = function(vecA, vecB, dest) {
        if (!dest) dest = vecB;
        dest[0] = vecA[0] + vecB[0];
        dest[1] = vecA[1] + vecB[1];
        return dest;
    };
    
    /**
     * Subtracts vecB from vecA. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec2} vecA the first operand
     * @param {vec2} vecB the second operand
     * @param {vec2} [dest] the optional receiving vector
     * @returns {vec2} dest
     */
    vec2.subtract = function(vecA, vecB, dest) {
        if (!dest) dest = vecB;
        dest[0] = vecA[0] - vecB[0];
        dest[1] = vecA[1] - vecB[1];
        return dest;
    };
    
    /**
     * Multiplies vecA with vecB. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec2} vecA the first operand
     * @param {vec2} vecB the second operand
     * @param {vec2} [dest] the optional receiving vector
     * @returns {vec2} dest
     */
    vec2.multiply = function(vecA, vecB, dest) {
        if (!dest) dest = vecB;
        dest[0] = vecA[0] * vecB[0];
        dest[1] = vecA[1] * vecB[1];
        return dest;
    };
    
    /**
     * Divides vecA by vecB. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec2} vecA the first operand
     * @param {vec2} vecB the second operand
     * @param {vec2} [dest] the optional receiving vector
     * @returns {vec2} dest
     */
    vec2.divide = function(vecA, vecB, dest) {
        if (!dest) dest = vecB;
        dest[0] = vecA[0] / vecB[0];
        dest[1] = vecA[1] / vecB[1];
        return dest;
    };
    
    /**
     * Scales vecA by some scalar number. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecA.
     *
     * This is the same as multiplying each component of vecA
     * by the given scalar.
     *
     * @param {vec2}   vecA the vector to be scaled
     * @param {Number} scalar the amount to scale the vector by
     * @param {vec2}   [dest] the optional receiving vector
     * @returns {vec2} dest
     */
    vec2.scale = function(vecA, scalar, dest) {
        if (!dest) dest = vecA;
        dest[0] = vecA[0] * scalar;
        dest[1] = vecA[1] * scalar;
        return dest;
    };

    /**
     * Calculates the euclidian distance between two vec2
     *
     * Params:
     * @param {vec2} vecA First vector
     * @param {vec2} vecB Second vector
     *
     * @returns {number} Distance between vecA and vecB
     */
    vec2.dist = function (vecA, vecB) {
        var x = vecB[0] - vecA[0],
            y = vecB[1] - vecA[1];
        return Math.sqrt(x*x + y*y);
    };

    /**
     * Copies the values of one vec2 to another
     *
     * @param {vec2} vec vec2 containing values to copy
     * @param {vec2} dest vec2 receiving copied values
     *
     * @returns {vec2} dest
     */
    vec2.set = function (vec, dest) {
        dest[0] = vec[0];
        dest[1] = vec[1];
        return dest;
    };

    /**
     * Compares two vectors for equality within a certain margin of error
     *
     * @param {vec2} a First vector
     * @param {vec2} b Second vector
     *
     * @returns {Boolean} True if a is equivalent to b
     */
    vec2.equal = function (a, b) {
        return a === b || (
            Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
            Math.abs(a[1] - b[1]) < FLOAT_EPSILON
        );
    };

    /**
     * Negates the components of a vec2
     *
     * @param {vec2} vec vec2 to negate
     * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec2} dest if specified, vec otherwise
     */
    vec2.negate = function (vec, dest) {
        if (!dest) { dest = vec; }
        dest[0] = -vec[0];
        dest[1] = -vec[1];
        return dest;
    };

    /**
     * Normlize a vec2
     *
     * @param {vec2} vec vec2 to normalize
     * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec2} dest if specified, vec otherwise
     */
    vec2.normalize = function (vec, dest) {
        if (!dest) { dest = vec; }
        var mag = vec[0] * vec[0] + vec[1] * vec[1];
        if (mag > 0) {
            mag = Math.sqrt(mag);
            dest[0] = vec[0] / mag;
            dest[1] = vec[1] / mag;
        } else {
            dest[0] = dest[1] = 0;
        }
        return dest;
    };

    /**
     * Computes the cross product of two vec2's. Note that the cross product must by definition
     * produce a 3D vector. If a dest vector is given, it will contain the resultant 3D vector.
     * Otherwise, a scalar number will be returned, representing the vector's Z coordinate, since
     * its X and Y must always equal 0.
     *
     * Examples:
     *    var crossResult = vec3.create();
     *    vec2.cross([1, 2], [3, 4], crossResult);
     *    //=> [0, 0, -2]
     *
     *    vec2.cross([1, 2], [3, 4]);
     *    //=> -2
     *
     * See http://stackoverflow.com/questions/243945/calculating-a-2d-vectors-cross-product
     * for some interesting facts.
     *
     * @param {vec2} vecA left operand
     * @param {vec2} vecB right operand
     * @param {vec2} [dest] optional vec2 receiving result. If not specified a scalar is returned
     *
     */
    vec2.cross = function (vecA, vecB, dest) {
        var z = vecA[0] * vecB[1] - vecA[1] * vecB[0];
        if (!dest) return z;
        dest[0] = dest[1] = 0;
        dest[2] = z;
        return dest;
    };
    
    /**
     * Caclulates the length of a vec2
     *
     * @param {vec2} vec vec2 to calculate length of
     *
     * @returns {Number} Length of vec
     */
    vec2.length = function (vec) {
      var x = vec[0], y = vec[1];
      return Math.sqrt(x * x + y * y);
    };

    /**
     * Caclulates the squared length of a vec2
     *
     * @param {vec2} vec vec2 to calculate squared length of
     *
     * @returns {Number} Squared Length of vec
     */
    vec2.squaredLength = function (vec) {
      var x = vec[0], y = vec[1];
      return x * x + y * y;
    };

    /**
     * Caclulates the dot product of two vec2s
     *
     * @param {vec2} vecA First operand
     * @param {vec2} vecB Second operand
     *
     * @returns {Number} Dot product of vecA and vecB
     */
    vec2.dot = function (vecA, vecB) {
        return vecA[0] * vecB[0] + vecA[1] * vecB[1];
    };
    
    /**
     * Generates a 2D unit vector pointing from one vector to another
     *
     * @param {vec2} vecA Origin vec2
     * @param {vec2} vecB vec2 to point to
     * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vecA
     *
     * @returns {vec2} dest if specified, vecA otherwise
     */
    vec2.direction = function (vecA, vecB, dest) {
        if (!dest) { dest = vecA; }

        var x = vecA[0] - vecB[0],
            y = vecA[1] - vecB[1],
            len = x * x + y * y;

        if (!len) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            return dest;
        }

        len = 1 / Math.sqrt(len);
        dest[0] = x * len;
        dest[1] = y * len;
        return dest;
    };

    /**
     * Performs a linear interpolation between two vec2
     *
     * @param {vec2} vecA First vector
     * @param {vec2} vecB Second vector
     * @param {Number} lerp Interpolation amount between the two inputs
     * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vecA
     *
     * @returns {vec2} dest if specified, vecA otherwise
     */
    vec2.lerp = function (vecA, vecB, lerp, dest) {
        if (!dest) { dest = vecA; }
        dest[0] = vecA[0] + lerp * (vecB[0] - vecA[0]);
        dest[1] = vecA[1] + lerp * (vecB[1] - vecA[1]);
        return dest;
    };

    /**
     * Returns a string representation of a vector
     *
     * @param {vec2} vec Vector to represent as a string
     *
     * @returns {String} String representation of vec
     */
    vec2.str = function (vec) {
        return '[' + vec[0] + ', ' + vec[1] + ']';
    };
    
    /**
     * @class 2x2 Matrix
     * @name mat2
     */
    var mat2 = {};
    
    /**
     * Creates a new 2x2 matrix. If src is given, the new matrix
     * is initialized to those values.
     *
     * @param {mat2} [src] the seed values for the new matrix, if any
     * @returns {mat2} a new matrix
     */
    mat2.create = function(src) {
        var dest = new MatrixArray(4);
        
        if (src) {
            dest[0] = src[0];
            dest[1] = src[1];
            dest[2] = src[2];
            dest[3] = src[3];
        } else {
            dest[0] = dest[1] = dest[2] = dest[3] = 0;
        }
        return dest;
    };

    /**
     * Creates a new instance of a mat2, initializing it with the given arguments
     *
     * @param {number} m00
     * @param {number} m01
     * @param {number} m10
     * @param {number} m11

     * @returns {mat2} New mat2
     */
    mat2.createFrom = function (m00, m01, m10, m11) {
        var dest = new MatrixArray(4);

        dest[0] = m00;
        dest[1] = m01;
        dest[2] = m10;
        dest[3] = m11;

        return dest;
    };
    
    /**
     * Copies the values of one mat2 to another
     *
     * @param {mat2} mat mat2 containing values to copy
     * @param {mat2} dest mat2 receiving copied values
     *
     * @returns {mat2} dest
     */
    mat2.set = function (mat, dest) {
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        return dest;
    };

    /**
     * Compares two matrices for equality within a certain margin of error
     *
     * @param {mat2} a First matrix
     * @param {mat2} b Second matrix
     *
     * @returns {Boolean} True if a is equivalent to b
     */
    mat2.equal = function (a, b) {
        return a === b || (
            Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
            Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
            Math.abs(a[2] - b[2]) < FLOAT_EPSILON &&
            Math.abs(a[3] - b[3]) < FLOAT_EPSILON
        );
    };

    /**
     * Sets a mat2 to an identity matrix
     *
     * @param {mat2} [dest] mat2 to set. If omitted a new one will be created.
     *
     * @returns {mat2} dest
     */
    mat2.identity = function (dest) {
        if (!dest) { dest = mat2.create(); }
        dest[0] = 1;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 1;
        return dest;
    };

    /**
     * Transposes a mat2 (flips the values over the diagonal)
     *
     * @param {mat2} mat mat2 to transpose
     * @param {mat2} [dest] mat2 receiving transposed values. If not specified result is written to mat
     *
     * @param {mat2} dest if specified, mat otherwise
     */
    mat2.transpose = function (mat, dest) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (!dest || mat === dest) {
            var a00 = mat[1];
            mat[1] = mat[2];
            mat[2] = a00;
            return mat;
        }
        
        dest[0] = mat[0];
        dest[1] = mat[2];
        dest[2] = mat[1];
        dest[3] = mat[3];
        return dest;
    };

    /**
     * Calculates the determinant of a mat2
     *
     * @param {mat2} mat mat2 to calculate determinant of
     *
     * @returns {Number} determinant of mat
     */
    mat2.determinant = function (mat) {
      return mat[0] * mat[3] - mat[2] * mat[1];
    };
    
    /**
     * Calculates the inverse matrix of a mat2
     *
     * @param {mat2} mat mat2 to calculate inverse of
     * @param {mat2} [dest] mat2 receiving inverse matrix. If not specified result is written to mat
     *
     * @param {mat2} dest is specified, mat otherwise, null if matrix cannot be inverted
     */
    mat2.inverse = function (mat, dest) {
        if (!dest) { dest = mat; }
        var a0 = mat[0], a1 = mat[1], a2 = mat[2], a3 = mat[3];
        var det = a0 * a3 - a2 * a1;
        if (!det) return null;
        
        det = 1.0 / det;
        dest[0] =  a3 * det;
        dest[1] = -a1 * det;
        dest[2] = -a2 * det;
        dest[3] =  a0 * det;
        return dest;
    };
    
    /**
     * Performs a matrix multiplication
     *
     * @param {mat2} matA First operand
     * @param {mat2} matB Second operand
     * @param {mat2} [dest] mat2 receiving operation result. If not specified result is written to matA
     *
     * @returns {mat2} dest if specified, matA otherwise
     */
    mat2.multiply = function (matA, matB, dest) {
        if (!dest) { dest = matA; }
        var a11 = matA[0],
            a12 = matA[1],
            a21 = matA[2],
            a22 = matA[3];
        dest[0] = a11 * matB[0] + a12 * matB[2];
        dest[1] = a11 * matB[1] + a12 * matB[3];
        dest[2] = a21 * matB[0] + a22 * matB[2];
        dest[3] = a21 * matB[1] + a22 * matB[3];
        return dest;
    };

    /**
     * Rotates a 2x2 matrix by an angle
     *
     * @param {mat2}   mat   The matrix to rotate
     * @param {Number} angle The angle in radians
     * @param {mat2} [dest]  Optional mat2 receiving the result. If omitted mat will be used.
     *
     * @returns {mat2} dest if specified, mat otherwise
     */
    mat2.rotate = function (mat, angle, dest) {
        if (!dest) { dest = mat; }
        var a11 = mat[0],
            a12 = mat[1],
            a21 = mat[2],
            a22 = mat[3],
            s = Math.sin(angle),
            c = Math.cos(angle);
        dest[0] = a11 *  c + a12 * s;
        dest[1] = a11 * -s + a12 * c;
        dest[2] = a21 *  c + a22 * s;
        dest[3] = a21 * -s + a22 * c;
        return dest;
    };

    /**
     * Multiplies the vec2 by the given 2x2 matrix
     *
     * @param {mat2} matrix the 2x2 matrix to multiply against
     * @param {vec2} vec    the vector to multiply
     * @param {vec2} [dest] an optional receiving vector. If not given, vec is used.
     *
     * @returns {vec2} The multiplication result
     **/
    mat2.multiplyVec2 = function(matrix, vec, dest) {
      if (!dest) dest = vec;
      var x = vec[0], y = vec[1];
      dest[0] = x * matrix[0] + y * matrix[1];
      dest[1] = x * matrix[2] + y * matrix[3];
      return dest;
    };
    
    /**
     * Scales the mat2 by the dimensions in the given vec2
     *
     * @param {mat2} matrix the 2x2 matrix to scale
     * @param {vec2} vec    the vector containing the dimensions to scale by
     * @param {vec2} [dest] an optional receiving mat2. If not given, matrix is used.
     *
     * @returns {mat2} dest if specified, matrix otherwise
     **/
    mat2.scale = function(matrix, vec, dest) {
      if (!dest) { dest = matrix; }
      var a11 = matrix[0],
          a12 = matrix[1],
          a21 = matrix[2],
          a22 = matrix[3],
          b11 = vec[0],
          b22 = vec[1];
      dest[0] = a11 * b11;
      dest[1] = a12 * b22;
      dest[2] = a21 * b11;
      dest[3] = a22 * b22;
      return dest;
    };

    /**
     * Returns a string representation of a mat2
     *
     * @param {mat2} mat mat2 to represent as a string
     *
     * @param {String} String representation of mat
     */
    mat2.str = function (mat) {
        return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] + ']';
    };
    
    /**
     * @class 4 Dimensional Vector
     * @name vec4
     */
    var vec4 = {};
     
    /**
     * Creates a new vec4, initializing it from vec if vec
     * is given.
     *
     * @param {vec4} [vec] the vector's initial contents
     * @returns {vec4} a new 2D vector
     */
    vec4.create = function(vec) {
        var dest = new MatrixArray(4);
        
        if (vec) {
            dest[0] = vec[0];
            dest[1] = vec[1];
            dest[2] = vec[2];
            dest[3] = vec[3];
        } else {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            dest[3] = 0;
        }
        return dest;
    };

    /**
     * Creates a new instance of a vec4, initializing it with the given arguments
     *
     * @param {number} x X value
     * @param {number} y Y value
     * @param {number} z Z value
     * @param {number} w W value

     * @returns {vec4} New vec4
     */
    vec4.createFrom = function (x, y, z, w) {
        var dest = new MatrixArray(4);

        dest[0] = x;
        dest[1] = y;
        dest[2] = z;
        dest[3] = w;

        return dest;
    };
    
    /**
     * Adds the vec4's together. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec4} vecA the first operand
     * @param {vec4} vecB the second operand
     * @param {vec4} [dest] the optional receiving vector
     * @returns {vec4} dest
     */
    vec4.add = function(vecA, vecB, dest) {
      if (!dest) dest = vecB;
      dest[0] = vecA[0] + vecB[0];
      dest[1] = vecA[1] + vecB[1];
      dest[2] = vecA[2] + vecB[2];
      dest[3] = vecA[3] + vecB[3];
      return dest;
    };
    
    /**
     * Subtracts vecB from vecA. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec4} vecA the first operand
     * @param {vec4} vecB the second operand
     * @param {vec4} [dest] the optional receiving vector
     * @returns {vec4} dest
     */
    vec4.subtract = function(vecA, vecB, dest) {
      if (!dest) dest = vecB;
      dest[0] = vecA[0] - vecB[0];
      dest[1] = vecA[1] - vecB[1];
      dest[2] = vecA[2] - vecB[2];
      dest[3] = vecA[3] - vecB[3];
      return dest;
    };
    
    /**
     * Multiplies vecA with vecB. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec4} vecA the first operand
     * @param {vec4} vecB the second operand
     * @param {vec4} [dest] the optional receiving vector
     * @returns {vec4} dest
     */
    vec4.multiply = function(vecA, vecB, dest) {
      if (!dest) dest = vecB;
      dest[0] = vecA[0] * vecB[0];
      dest[1] = vecA[1] * vecB[1];
      dest[2] = vecA[2] * vecB[2];
      dest[3] = vecA[3] * vecB[3];
      return dest;
    };
    
    /**
     * Divides vecA by vecB. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec4} vecA the first operand
     * @param {vec4} vecB the second operand
     * @param {vec4} [dest] the optional receiving vector
     * @returns {vec4} dest
     */
    vec4.divide = function(vecA, vecB, dest) {
      if (!dest) dest = vecB;
      dest[0] = vecA[0] / vecB[0];
      dest[1] = vecA[1] / vecB[1];
      dest[2] = vecA[2] / vecB[2];
      dest[3] = vecA[3] / vecB[3];
      return dest;
    };
    
    /**
     * Scales vecA by some scalar number. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecA.
     *
     * This is the same as multiplying each component of vecA
     * by the given scalar.
     *
     * @param {vec4}   vecA the vector to be scaled
     * @param {Number} scalar the amount to scale the vector by
     * @param {vec4}   [dest] the optional receiving vector
     * @returns {vec4} dest
     */
    vec4.scale = function(vecA, scalar, dest) {
      if (!dest) dest = vecA;
      dest[0] = vecA[0] * scalar;
      dest[1] = vecA[1] * scalar;
      dest[2] = vecA[2] * scalar;
      dest[3] = vecA[3] * scalar;
      return dest;
    };

    /**
     * Copies the values of one vec4 to another
     *
     * @param {vec4} vec vec4 containing values to copy
     * @param {vec4} dest vec4 receiving copied values
     *
     * @returns {vec4} dest
     */
    vec4.set = function (vec, dest) {
        dest[0] = vec[0];
        dest[1] = vec[1];
        dest[2] = vec[2];
        dest[3] = vec[3];
        return dest;
    };

    /**
     * Compares two vectors for equality within a certain margin of error
     *
     * @param {vec4} a First vector
     * @param {vec4} b Second vector
     *
     * @returns {Boolean} True if a is equivalent to b
     */
    vec4.equal = function (a, b) {
        return a === b || (
            Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
            Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
            Math.abs(a[2] - b[2]) < FLOAT_EPSILON &&
            Math.abs(a[3] - b[3]) < FLOAT_EPSILON
        );
    };

    /**
     * Negates the components of a vec4
     *
     * @param {vec4} vec vec4 to negate
     * @param {vec4} [dest] vec4 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec4} dest if specified, vec otherwise
     */
    vec4.negate = function (vec, dest) {
        if (!dest) { dest = vec; }
        dest[0] = -vec[0];
        dest[1] = -vec[1];
        dest[2] = -vec[2];
        dest[3] = -vec[3];
        return dest;
    };

    /**
     * Caclulates the length of a vec2
     *
     * @param {vec2} vec vec2 to calculate length of
     *
     * @returns {Number} Length of vec
     */
    vec4.length = function (vec) {
      var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
      return Math.sqrt(x * x + y * y + z * z + w * w);
    };

    /**
     * Caclulates the squared length of a vec4
     *
     * @param {vec4} vec vec4 to calculate squared length of
     *
     * @returns {Number} Squared Length of vec
     */
    vec4.squaredLength = function (vec) {
      var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
      return x * x + y * y + z * z + w * w;
    };

    /**
     * Performs a linear interpolation between two vec4
     *
     * @param {vec4} vecA First vector
     * @param {vec4} vecB Second vector
     * @param {Number} lerp Interpolation amount between the two inputs
     * @param {vec4} [dest] vec4 receiving operation result. If not specified result is written to vecA
     *
     * @returns {vec4} dest if specified, vecA otherwise
     */
    vec4.lerp = function (vecA, vecB, lerp, dest) {
        if (!dest) { dest = vecA; }
        dest[0] = vecA[0] + lerp * (vecB[0] - vecA[0]);
        dest[1] = vecA[1] + lerp * (vecB[1] - vecA[1]);
        dest[2] = vecA[2] + lerp * (vecB[2] - vecA[2]);
        dest[3] = vecA[3] + lerp * (vecB[3] - vecA[3]);
        return dest;
    };

    /**
     * Returns a string representation of a vector
     *
     * @param {vec4} vec Vector to represent as a string
     *
     * @returns {String} String representation of vec
     */
    vec4.str = function (vec) {
        return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ', ' + vec[3] + ']';
    };

    /*
     * Exports
     */

    if(root) {
        root.glMatrixArrayType = MatrixArray;
        root.MatrixArray = MatrixArray;
        root.setMatrixArrayType = setMatrixArrayType;
        root.determineMatrixArrayType = determineMatrixArrayType;
        root.glMath = glMath;
        root.vec2 = vec2;
        root.vec3 = vec3;
        root.vec4 = vec4;
        root.mat2 = mat2;
        root.mat3 = mat3;
        root.mat4 = mat4;
        root.quat4 = quat4;
    }

    return {
        glMatrixArrayType: MatrixArray,
        MatrixArray: MatrixArray,
        setMatrixArrayType: setMatrixArrayType,
        determineMatrixArrayType: determineMatrixArrayType,
        glMath: glMath,
        vec2: vec2,
        vec3: vec3,
        vec4: vec4,
        mat2: mat2,
        mat3: mat3,
        mat4: mat4,
        quat4: quat4
    };
}));

/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * Renderable Module Definition
 * @author Adam Ranfelt
 * @version 1.5
 */
define('layer/Renderable',[
    'lib/gl-matrix',
    'layer/Geometry',
    'layer/RenderMediator'
], function(
    glMatrix,
    Geometry,
    RenderMediator
) {
    
    
    /**
     * Locally cached Math.round function
     * Optimization step to decrease the access to Math.round
     *
     * @private
     * @function
     * @type {function}
     * @since 1.0
     */
    var round = Math.round;
    
    /**
     * Locally cached glMatrix.mat3 object
     * Optimization step to decrease the access to mat3
     *
     * @private
     * @type {object}
     * @since 1.0
     */
    var mat3 = glMatrix.mat3;
    
    /**
     * Locally cached glMatrix.vec2 object
     * Optimization step to decrease the access to vec2
     *
     * @private
     * @type {object}
     * @since 1.0
     */
    var vec2 = glMatrix.vec2;
    
    /**
     * Reused cache version of the 2d vector
     * Used to calculate vector calculations without the need
     * for multiple instances of the array within calculations
     *
     * Should not be used within a loop that could call children of the same type or supertype
     *
     * @private
     * @type {number[]}
     * @since 1.0
     */
    var vector = [0, 0];
    
    /**
     * Reused cache version of a 3x3 matrix
     * Used to calculate matrix calculations without the need
     * for multiple instances of the matrix/array object within updateTransform calculations
     *
     * Should not be used within a loop that could call children of the same type or supertype
     *
     * @private
     * @type {number[]}
     * @since 1.0
     */
    var matrix = mat3.identity();
    
    /**
     * Reused cache version of the 3x3 matrix
     * Used to calculate matrix calculations without the need
     * for multiple instances of the matrix/array object within local and world coordinate calculations
     *
     * Should not be used within a loop that could call children of the same type or supertype
     *
     * @private
     * @type {number[]}
     * @since 1.0
     */
    var matrixBuffer = mat3.identity();

    /**
     * Empty namespace placeholder
     * Used for namespace checking
     *
     * @private
     * @constant
     * @type {string}
     * @since 1.5
     */
    var EMPTY_NAMESPACE = '';
    
    /**
     * Renderable Constructor
     *
     * Base implementation built to be extended
     * Supports mouse events via onClick, onMouseMove, onMouseUp, onMouseDown
     * Handles point-based rotations, scale, and position on a run loop
     * Updates the transform content on demand
     * Supports demand flag for when the renderable has been modified
     * Spatial data is based on the origin being placed at top left corner
     *
     * @name Renderable
     * @class Base Renderable structure used to render objects
     * @constructor
     *
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @since 1.0
     */
    var Renderable = function(x, y, width, height) {
        if (x !== undefined && y !== undefined && width !== undefined && height !== undefined) {
            this.init(x, y, width, height);
        }
    };
    
    /**
     * Initializes the Renderable by setting up the spatial properties
     * Sets up the center offset, position, size, scale, rotation, and transform
     *
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @returns {Renderable}
     * @since 1.0
     */
    Renderable.prototype.init = function(x, y, width, height) {
        /**
         * Position in 2d space for the X position
         *
         * @default 0
         * @name Renderable#x
         * @type {number}
         * @since 1.0
         */
        this.x = x || 0;
        
        /**
         * Position in 2d space for the Y position
         *
         * @default 0
         * @name Renderable#y
         * @type {number}
         * @since 1.0
         */
        this.y = y || 0;
        
        /**
         * Size in 2d space of width without any scale
         *
         * @default 0
         * @name Renderable#unscaledWidth
         * @type {number}
         * @since 1.0
         */
        this.unscaledWidth = width || 0;
        
        /**
         * Size in 2d space of height without any scale
         *
         * @default 0
         * @name Renderable#unscaledHeight
         * @type {number}
         * @since 1.0
         */
        this.unscaledHeight = height || 0;
        
        /**
         * Fully scaled size in 2d space of width
         * Read-only Value
         *
         * @default 0
         * @name Renderable#width
         * @type {number}
         * @since 1.0
         */
        this.width = this.unscaledWidth;
        
        /**
         * Fully scaled size in 2d space of height
         * Read-only Value
         *
         * @default 0
         * @name Renderable#height
         * @type {number}
         * @since 1.0
         */
        this.height = this.unscaledHeight;
        
        /**
         * Scale of the renderable in the x axis
         *
         * @default 1
         * @name Renderable#scaleX
         * @type {number}
         * @since 1.0
         */
        this.scaleX = 1;
        
        /**
         * Scale of the renderable in the y axis
         *
         * @default 1
         * @name Renderable#scaleY
         * @type {number}
         * @since 1.0
         */
        this.scaleY = 1;
        
        /**
         * Rotation of the renderable in radians
         *
         * @default 0
         * @name Renderable#rotation
         * @type {number}
         * @since 1.0
         */
        this.rotation = 0;
        
        /**
         * Spatial 3x3 matrix transform of the renderable
         * Intended to be an affine transform
         *
         * @default [1, 0, 0, 0, 1, 0, 0, 0, 1]
         * @name Renderable#transform
         * @type {number[]}
         * @since 1.0
         */
        this.transform = mat3.identity();
        
        /**
         * Normalized center position in x
         * Value should be within the range [0, 1]
         *
         * @default .5
         * @name Renderable#centerOffsetX
         * @type {number}
         * @since 1.0
         */
        this.centerOffsetX = 0.5;
        
        /**
         * Normalized center position in y
         * Value should be within the range [0, 1]
         *
         * @default .5
         * @name Renderable#centerOffsetY
         * @type {number}
         * @since 1.0
         */
        this.centerOffsetY = 0.5;
        
        /**
         * Actual unscaled offset of the X position
         * Read-only Value
         *
         * @default 0
         * @name Renderable#unscaledOffsetX
         * @type {number}
         * @since 1.0
         */
        this.unscaledOffsetX = this.unscaledWidth * this.centerOffsetX;
        
        /**
         * Actual unscaled offset of the Y position
         * Read-only Value
         *
         * @default 0
         * @name Renderable#unscaledOffsetY
         * @type {number}
         * @since 1.0
         */
        this.unscaledOffsetY = this.unscaledHeight * this.centerOffsetY;
        
        /**
         * Renderable's parent's transform
         * Reference only
         * Immutable property
         *
         * @default null
         * @name Renderable#parentTransform
         * @type {number[]}
         * @since 1.0
         */
        this.parentTransform = null;

        /**
         * Namespace used to identify which scene
         * the renderable is a part of in the click stack
         *
         * @name Renderable#sceneNamespace
         * @type {string}
         * @since 1.5
         */
        this.sceneNamespace = EMPTY_NAMESPACE;
        
        /**
         * Needs Update validation flag
         * Dirty flag for whether the renderable requires an update to the transform
         *
         * @default true
         * @name Renderable#needsUpdate
         * @type {boolean}
         * @since 1.0
         */
        this.needsUpdate = true;
        
        /**
         * Is interactive flag
         * When it is inactive, the hit detection will disregard the renderable
         *
         * @default true
         * @name Renderable#isInteractive
         * @type {boolean}
         * @since 1.2
         */
        this.isInteractive = true;
        
        /**
         * Flag for whether the renderable is a leaf node
         * When it is a leaf node, hit stacks will not perform a DFS
         *
         * @default true
         * @name Renderable#isLeafNode
         * @type {boolean}
         * @since 1.3
         */
        this.isLeafNode = true;
    };
    
    /**
     * Sets the parent transform reference
     * Requests the renderable to update the transform
     *
     * @param {number[]} transform Parent transform
     * @returns {Renderable}
     * @since 1.0
     */
    Renderable.prototype.setParentTransform = function(transform) {
        this.parentTransform = transform;
        this.needsUpdate = true;
        
        return this;
    };

    /**
     * Sets the scene namespace reference
     * Pushes a render request to the RenderMediator to inform the scene to render
     *
     * @param {string} sceneNamespace Scene namespace that the renderable is a part of
     * @returns {Renderable}
     * @since 1.5
     */
    Renderable.prototype.setSceneNamespace = function(sceneNamespace) {
        this.sceneNamespace = sceneNamespace;
        this.setNeedsRender();

        return this;
    };
    
    /**
     * Sets the center point to rotate from
     * Requests the renderable to update
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable}
     * @since 1.0
     */
    Renderable.prototype.setCenterPoint = function(x, y) {
        this.centerOffsetX = x;
        this.centerOffsetY = y;
        this.unscaledOffsetX = this.unscaledWidth * this.centerOffsetX;
        this.unscaledOffsetY = this.unscaledHeight * this.centerOffsetY;
        this.setNeedsUpdate();
        
        return this;
    };

    /**
     * Sets the renderable to be dirty
     * Pushes a render request to the RenderMediator to inform the scene to render
     *
     * @returns {Renderable}
     * @since 1.5
     */
    Renderable.prototype.setNeedsRender = function() {
        if (this.sceneNamespace !== EMPTY_NAMESPACE) {
            RenderMediator.setNeedsRender(this.sceneNamespace);
        }

        return this;
    };

    /**
     * Sets the renderable to be dirty and need to update its current spatial logic
     * Pushes a render request to the RenderMediator to inform the scene to render
     *
     * @returns {Renderable}
     * @since 1.0
     */
    Renderable.prototype.setNeedsUpdate = function() {
        this.needsUpdate = true;
        this.setNeedsRender();
        
        return this;
    };
    
    /**
     * Updates the transform based on the position, scale, and rotation of the object
     * Calculates the transform from the parent if it exists, identify if otherwise
     * Handled internally, should only be called if necessary
     *
     * @since 1.0
     */
    Renderable.prototype.updateTransform = function() {
        // Sets up the base transform as the parentTransform if it exists
        if (this.parentTransform) {
            mat3.set(this.parentTransform, this.transform);
            matrix = this.transform;
        // Sets up the base transform with an identity
        } else {
            matrix = mat3.identity(this.transform);
        }
        
        // Only setup the translate if x or y is set
        if (this.x !== 0 || this.y !== 0) {
            vector[0] = this.x;
            vector[1] = this.y;
            mat3.translate(matrix, vector);
        }
        
        // Only setup the scale if the scaleX or scaleY is set
        if (this.scaleX !== 1 || this.scaleY !== 1) {
            vector[0] = this.unscaledOffsetX;
            vector[1] = this.unscaledOffsetY;
            mat3.translate(matrix, vector);
            vector[0] = this.scaleX;
            vector[1] = this.scaleY;
            this.width = this.unscaledWidth * this.scaleX;
            this.height = this.unscaledHeight * this.scaleY;
            mat3.scale(matrix, vector);
            vector[0] = -this.unscaledOffsetX;
            vector[1] = -this.unscaledOffsetY;
            mat3.translate(matrix, vector);
        }
        
        // Only setup the rotation if the rotation is non-zero
        if (this.rotation) {
            vector[0] = this.unscaledOffsetX;
            vector[1] = this.unscaledOffsetY;
            mat3.translate(matrix, vector);
            mat3.rotate(matrix, this.rotation);
            vector[0] = -vector[0];
            vector[1] = -vector[1];
            mat3.translate(matrix, vector);
        }
        
        this.needsUpdate = false;
    };
    
    /**
     * Converts the passed in vector to local coordinates
     *
     * @param {number[]} vec 2D Vector in world coordinates
     * @param {boolean} shouldRound If true, rounds the converted coordinates, optional
     * @returns {number[]}
     * @since 1.0
     */
    Renderable.prototype.toLocalCoordinates = function(vec, shouldRound) {
        if (this.needsUpdate) {
            this.updateTransform();
        }
        
        mat3.identity(matrixBuffer);
        mat3.multiplyVec2(mat3.inverse(this.transform, matrixBuffer), vec);
        
        if (shouldRound) {
            vec[0] = round(vec[0]);
            vec[1] = round(vec[1]);
        }
        
        return vec;
    };
    
    /**
     * Converts the passed in vector to world coordinates
     *
     * @param {number[]} vec 2D Vector in local coordinates
     * @param {boolean} shouldRound If true, rounds the converted coordinates, optional
     * @returns {number[]}
     * @since 1.0
     */
    Renderable.prototype.toWorldCoordinates = function(vec, shouldRound) {
        if (this.needsUpdate) {
            this.updateTransform();
        }
        
        mat3.multiplyVec2(this.transform, vec);
        if (shouldRound) {
            vec[0] = round(vec[0]);
            vec[1] = round(vec[1]);
        }
        
        return vec;
    };
    
    /**
     * Tests the hit to see if it exists within the bounding box of this renderable
     * Uses a rectangle test method
     *
     * @param {number} x X Position in World Coordinates
     * @param {number} y Y Position in Wolrd Coordinates
     * @returns {boolean}
     * @since 1.0
     */
    Renderable.prototype.hitTest = function(x, y) {
        vector[0] = x;
        vector[1] = y;
        
        vector = this.toLocalCoordinates(vector, true);
        
        return Geometry.isPointInRect(vector[0], vector[1], 0, 0, this.unscaledWidth, this.unscaledHeight);
    };
    
    /**
     * Returns the first child hit target for the given position
     * If there is no child, returns null
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable|null}
     * @since 1.0
     */
    Renderable.prototype.getChildHitTarget = function(x, y) {
        return null;
    };
    
    /**
     * Finds the next child hit target if it exists
     * If it doesn't exist, returns null
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @param {Renderable} sibling Previously found sibling
     * @returns {Renderable|null}
     * @since 1.4
     */
    Renderable.prototype.getNextChildHitTarget = function(x, y, sibling) {
        return null;
    };
    
    /**
     * Returns the target for the given position
     * If there is no target, returns this
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable}
     * @since 1.0
     */
    Renderable.prototype.getHitTarget = function(x, y) {
        return this;
    };
    
    /**
     * Applies the transform to the context
     * Bypasses traditional save, restore methods and uses a setTransform instead
     *
     * @param {CanvasRenderingContext2D} context Context to apply the transform to
     * @since 1.0
     */
    Renderable.prototype.applyTransform = function(context) {
        matrix = this.transform;
        context.setTransform(matrix[0], matrix[1], matrix[3], matrix[4], matrix[6], matrix[7]);
    };
    
    /**
     * Sets up the update transform stack and applies the transform
     * Updates the transform if necessary
     *
     * @param {CanvasRenderingContext2D} context Context to render to
     * @since 1.0
     */
    Renderable.prototype.render = function(context) {
        if (this.needsUpdate) {
            this.updateTransform();
        }
        
        this.applyTransform(context);
    };

    return Renderable;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * RenderableGroup Module Definition
 * @author Adam Ranfelt 
 * @version 1.5
 */
define('layer/RenderableGroup',[
    'layer/Renderable',
    'layer/Geometry'
], function(
    Renderable,
    Geometry
) {
    
    
    var Math = window.Math;
    var MathMax = Math.max;
    var MathMin = Math.min;
    
    var vector = [0, 0];
    
    /**
     * <p>Renderable Group Constructor</p>
     *
     * <p>Base group construct built to support scenegraph based children</p>
     * 
     * @name RenderableGroup
     * @class Base RenderableGroup Container structure used to store Renderable children
     * @constructor
     * @extends Renderable
     * 
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @since 1.0
     */
    var RenderableGroup = function(x, y, width, height) {
        if (x !== undefined && y !== undefined && width !== undefined && height !== undefined) {
            this.init(x, y, width, height);
        }
    };
    
    RenderableGroup.prototype = new Renderable();
    RenderableGroup.prototype.constructor = RenderableGroup;
    
    /**
     * @see Renderable#init
     */
    RenderableGroup.prototype.Renderable_init = Renderable.prototype.init;
    
    /**
     * @see Renderable#updateTransform
     */
    RenderableGroup.prototype.Renderable_updateTransform = Renderable.prototype.updateTransform;

    /**
     * @see Renderable#setSceneNamespace
     */
    RenderableGroup.prototype.Renderable_setSceneNamespace = Renderable.prototype.setSceneNamespace;
    
    /**
     * Initializes the RenderableGroup with the Renderable parameters
     * Sets up the initial children
     *
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @returns {RenderableGroup}
     * @since 1.0
     */
    RenderableGroup.prototype.init = function(x, y, width, height) {
        this.Renderable_init(x, y, width, height);
        
        /**
         * X Position of the content relative to the group
         *
         * @default 0
         * @name RenderableGroup#contentX
         * @type {number}
         * @since 1.2
         */
        this.contentX = 0;
        
        /**
         * Y Position of the content relative to the group
         *
         * @default 0
         * @name RenderableGroup#contentY
         * @type {number}
         * @since 1.2
         */
        this.contentY = 0;
        
        /**
         * Width of the children in box dimensions
         *
         * @default 0
         * @name RenderableGroup#contentWidth
         * @type {number}
         * @since 1.1
         */
        this.contentWidth = 0;
        
        /**
         * Height of the children in box dimensions
         *
         * @default 0
         * @name RenderableGroup#contentHeight
         * @type {number}
         * @since 1.1
         */
        this.contentHeight = 0;
        
        /**
         * SceneGraph children set
         *
         * @default []
         * @name RenderableGroup#children
         * @type {Renderable[]}
         * @since 1.0
         */
        this.children = [];
        
        /**
         * Flag for whether the renderable is a leaf node
         * When it is a leaf node, hit stacks will not perform a DFS
         *
         * @default false
         * @name RenderableGroup#isLeafNode
         * @type {boolean}
         * @since 1.3
         */
        this.isLeafNode = false;
    };

    /**
     * Sets the scene namespace reference normally and pushes the namespace to its children
     *
     * @param {string} namespace Scene namespace that the renderable is a part of
     * @returns {Renderable}
     * @since 1.4
     */
    RenderableGroup.prototype.setSceneNamespace = function(sceneNamespace) {
        this.Renderable_setSceneNamespace(sceneNamespace);

        var i = 0;
        var children = this.children;
        var length = children.length;

        for (; i < length; i++) {
            children[i].setSceneNamespace(sceneNamespace);
        }

        return this;
    };
    
    /**
     * Adds a child to the stack and pushes the parent transform
     *
     * @throws {ExistentialError} If the child is already a child of this object
     * @param {Renderable} child Child to add
     * @returns {RenderableGroup}
     * @since 1.0
     */
    RenderableGroup.prototype.addChild = function(child) {
        if (this.children.indexOf(child) !== -1) {
            throw new Error('ExistentialError: Child already exists in group');
        }

        this.children.push(child);
        if (this.needsUpdate) {
            this.updateTransform();
        }
        child.setSceneNamespace(this.sceneNamespace);
        child.setParentTransform(this.transform);

        return this;
    };

    /**
     * Add child to the stack at index and pushes the parent transform
     *
     * @throws {ExistentialError} If the child is already a child of this object
     * @param {Number} index Index to insert child at
     * @param {Renderable} child Child to add
     * @return {RenderableGroup}
     * @since 1.5
     */
    RenderableGroup.prototype.insertChildAtIndex = function(index, child) {
        if (this.children.indexOf(child) !== -1) {
            throw new Error('ExistentialError: Child already exists in group');
        }

        if (index < 0) {
            this.children.unshift(child);
        } else if (index >= this.children.length) {
            this.children.push(child);
        } else {
            this.children.splice(index, 0, child);
        }

        if (this.needsUpdate) {
            this.updateTransform();
        }
        child.setSceneNamespace(this.sceneNamespace);
        child.setParentTransform(this.transform);

        return this;
    };
    
    /**
     * Checks if the child exists within the children stack
     *
     * @param {Renderable} child Child to check
     * @returns {boolean}
     * @since 1.0
     */
    RenderableGroup.prototype.hasChild = function(child) {
        return this.children.indexOf(child) !== -1;
    };
    
    /**
     * Removes a child from the stack and pushes a null parent transform
     *
     * @throws {ExistentialError} If the child is not a child of this object
     * @param {Renderable} child Child to remove
     * @returns {RenderableGroup}
     * @since 1.0
     */
    RenderableGroup.prototype.removeChild = function(child) {
        var index = this.children.indexOf(child);
        if (index === -1) {
            throw new Error('ExistentialError: Child does not exist in group');
        }
        
        this.children.splice(index, 1);
        child.setSceneNamespace('');
        child.setParentTransform(null);
        
        return this;
    };
    
    /**
     * Tests the hit to see if it exists within the bounding box of the renderable group content
     * Uses a rectangle test method
     *
     * @param {number} x X Position in World Coordinates
     * @param {number} y Y Position in Wolrd Coordinates
     * @returns {boolean}
     * @since 1.2
     */
    RenderableGroup.prototype.hitTest = function(x, y) {
        vector[0] = x;
        vector[1] = y;
        
        vector = this.toLocalCoordinates(vector, true);
        
        return Geometry.isPointInRect(vector[0], vector[1], this.contentX, this.contentY, this.contentWidth, this.contentHeight);
    };
    
    /**
     * Finds the first child hit target if it exists
     * If it doesn't exist, returns null
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable|null}
     * @since 1.0
     */
    RenderableGroup.prototype.getChildHitTarget = function(x, y) {
        var target = null;
        var children = this.children;
        var length = children.length;
        var i = length - 1;
        for (; i >= 0; i--) {
            if (children[i].isInteractive && children[i].hitTest(x, y)) {
                target = children[i];
                break;
            }
        }
        
        return target;
    };
    
    /**
     * Finds the next child hit target if it exists
     * If it doesn't exist, returns null
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @param {Renderable} sibling Previously found sibling
     * @returns {Renderable|null}
     * @since 1.3
     */
    RenderableGroup.prototype.getNextChildHitTarget = function(x, y, sibling) {
        var target = null;
        var children = this.children;
        var length = children.length;
        var i = children.indexOf(sibling) - 1;
        for (; i >= 0; i--) {
            if (children[i].isInteractive && children[i].hitTest(x, y)) {
                target = children[i];
                break;
            }
        }
        
        return target;
    };
    
    /**
     * Requests the hit target from the subsequent children
     * If the child doesn't exist, returns this
     * Should only be called if the hit target is hit
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable}
     * @since 1.0
     */
    RenderableGroup.prototype.getHitTarget = function(x, y) {
        var target = this;
        var children = this.children;
        var length = children.length;
        var i = length - 1;
        for (; i >= 0; i--) {
            if (children[i].isInteractive && children[i].hitTest(x, y)) {
                target = children[i].getHitTarget();
                break;
            }
        }
        
        return target;
    };
    
    /**
     * Updates the transform normally and pushes the transform to the child
     * Calculates the width and height of the content based on the rectangular boundaries determined by the children
     *
     * @since 1.0
     */
    RenderableGroup.prototype.updateTransform = function() {
        this.Renderable_updateTransform();
        
        var i = 0;
        var children = this.children;
        var length = children.length;
        var transform = this.transform;
        var bottom = 0;
        var top = this.unscaledHeight;
        var left = this.unscaledWidth;
        var right = 0;
        var child;
        for (; i < length; i++) {
            children[i].setParentTransform(transform);
        }
        
        i = 0;
        for (; i < length; i++) {
            child = children[i];
            left = MathMin(child.x, left);
            top = MathMin(child.y, top);
            right = MathMax(child.unscaledWidth + child.x, right);
            bottom = MathMax(child.unscaledHeight + child.y, bottom);
        }
        
        this.contentX = left;
        this.contentY = top;
        this.contentWidth = right - left;
        this.contentHeight = bottom - top;
    };
    
    /**
     * Renders all the children in the group's render stack
     *
     * @param {CanvasRenderingContext2D} context Context to render to
     * @since 1.0
     */
    RenderableGroup.prototype.render = function(context) {
        if (this.needsUpdate) {
            this.updateTransform();
        }
        
        this.needsRender = false;
        
        var i = 0;
        var children = this.children;
        var length = children.length;
        
        for (; i < length; i++) {
            children[i].render(context);
        }
    };
    
    return RenderableGroup;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * Layer Module Definition
 * @author Adam Ranfelt
 * @version 1.2
 */
define('layer/Layer',[
    'layer/RenderableGroup'
], function(
    RenderableGroup
) {
    
    
    /**
     * Layer ID Prefix
     *
     * @private
     * @type {string}
     * @constant
     * @since 1.0
     */
    var LAYER_PREFIX = 'layer-';
    
    /**
     * Canvas ID number that increments whenever a new id is applied
     *
     * @static
     * @private
     * @type {number}
     * @since 1.0
     */
    var _canvasId = 0;
    
    /**
     * Layer Constructor
     *
     * Layer model which stores the canvas information
     *
     * @name Layer
     * @class Canvas Layer object
     * @constructor
     * @extends RenderableGroup
     *
     * @param {HTMLCanvasElement} canvas Canvas element that the layer represents
     * @param {string} sceneNamespace Scene namespace firing events from
     * @since 1.0
     */
    var Layer = function(canvas, sceneNamespace) {
        if (canvas !== undefined && sceneNamespace !== undefined) {
            this.init(canvas, sceneNamespace);
        }
    };
    
    /**
     * Initializes the layer and sets up the width, height, canvas, and context
     *
     * @param {HTMLCanvasElement} canvas Canvas element that the layer represents
     * @param {string} sceneNamespace Scene namespace firing events from
     * @returns {Layer}
     * @since 1.0
     */
    Layer.prototype.init = function(canvas, sceneNamespace) {
        // If the id is undefined, define it
        if (canvas.id === undefined) {
            canvas.id = LAYER_PREFIX + _canvasId;
        }
        
        /**
         * Layer name
         *
         * @name Layer#name
         * @type {string}
         * @since 1.0
         */
        this.name = canvas.id;
        
        /**
         * Canvas the layer represents
         *
         * @name Layer#canvas
         * @type {HTMLCanvasElement}
         * @since 1.0
         */
        this.canvas = canvas;
        
        /**
         * Context the layer uses from the canvas
         *
         * @name Layer#context
         * @type {CanvasRenderingContext2D}
         * @since 1.0
         */
        this.context = null;
        
        /**
         * Layer width
         *
         * @name Layer#width
         * @type {number}
         * @since 1.0
         */
        this.width = canvas.width;
        
        /**
         * Layer height
         *
         * @name Layer#height
         * @type {number}
         * @since 1.0
         */
        this.height = canvas.height;

        /**
         * Scene Namespace that input events will be firing from
         *
         * @name Layer#sceneNamespace
         * @type {string}
         * @since 1.2
         */
        this.sceneNamespace = sceneNamespace;
        
        /**
         * Root Layer Node
         * When a layer is rendered, the root renders
         *
         * @name Layer#root
         * @type {RenderableGroup}
         * @since 1.1
         */
        this.root = new RenderableGroup(0, 0, this.width, this.height);
        this.root.setSceneNamespace(this.sceneNamespace);
        
        return this;
    };
    
    /**
     * Gets the layer's canvas element
     *
     * @returns {HTMLCanvasElement}
     * @since 1.0
     */
    Layer.prototype.getCanvas = function() {
        return this.canvas;
    };
    
    /**
     * Gets the layer's context
     *
     * @returns {CanvasRenderingContext2D}
     * @since 1.0
     */
    Layer.prototype.getContext = function() {
        if (this.context === null) {
            this.context = this.canvas.getContext('2d');
        }
        
        return this.context;
    };
    
    /**
     * Gets the rendering layer's root node
     * Root node is expected to be an instance of RenderableGroup
     *
     * @returns {RenderableGroup}
     * @since 1.1
     */
    Layer.prototype.getRoot = function() {
        return this.root;
    };
    
    /**
     * Renders the layer's root if it needs to be rendered
     * Intended to be called from a run loop that doesn't check on the root for its render requirement
     * TODO: Integrate the needsRender prerequisite
     *
     * @since 1.1
     */
    Layer.prototype.render = function() {
        var root = this.root;
        var context = this.getContext();
        
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.width, this.height);
        root.render(context);
    };
    
    return Layer;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * Render Cache Definition
 * @author Adam Ranfelt
 * @version 1.1
 */
define('layer/RenderCache',[],function() {
    
    
    /**
     * Static id used for debugging - makes each render cache a unique id
     *
     * @private
     * @type {number}
     * @since 1.0
     */
    var _id = 0;
    
    /**
     * Cache prefix name used for identifying the id of the cache
     *
     * @private
     * @constant
     * @type {object}
     * @since 1.0
     */
    var CACHE_PREFIX = 'cache-';

    /**
     * Type definition that all renderCommand must be
     * Used to compare all renderCommand types against
     *
     * @type {string}
     * @constant
     */
    var RENDER_COMMAND_TYPE = 'function';
    
    /**
     * Generates a canvas with an id, width, and height specified
     *
     * @private
     * @function
     * @param {string} name Name and ID of the canvas
     * @param {number} width Width of the canvas element
     * @param {number} height Height of the canvas element
     * @returns {HTMLCanvasElement}
     * @since 1.0
     */
    var _makeCanvas = function(name, width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.id = name;
        
        return canvas;
    };
    
    /**
     * RenderCache Constructor
     *
     * Cache structure used to render out content from a functional source
     * Content rendered onto the RenderCache is not updated until render is called
     *
     * @name RenderCache
     * @class Render Cache structure which renders content on demand to be used for later rendering
     * @constructor
     *
     * @param {number} width Cache Width
     * @param {number} height Cache Height
     * @param {function} renderCommand Function to render the content with - will include a context parameter
     * @since 1.0
     */
    var RenderCache = function(width, height, renderCommand) {
        /**
         * Debugging id of the cache
         *
         * @default 0
         * @name RenderCache#id
         * @type {number}
         * @since 1.0
         */
        this.id = _id++;
        
        /**
         * Cache width
         *
         * @default 0
         * @name RenderCache#width
         * @type {number}
         * @since 1.0
         */
        this.width = 0;
        
        /**
         * Cache height
         *
         * @default 0
         * @name RenderCache#height
         * @type {number}
         * @since 1.0
         */
        this.height = 0;
        
        /**
         * Canvas used to cache with
         *
         * @default null
         * @name RenderCache#canvas
         * @type {HTMLCanvasElement}
         * @since 1.0
         */
        this.canvas = null;
        
        /**
         * Cached canvas context
         *
         * @default null
         * @name RenderCache#context
         * @type {2dRenderingContext}
         * @since 1.0
         */
        this.context = null;
        
        /**
         * Render command to cache
         *
         * @default null
         * @name RenderCache#renderCommand
         * @type {function}
         * @since 1.0
         */
        this.renderCommand = null;
        
        if (width !== undefined && height !== undefined && renderCommand !== undefined) {
            this.init(width, height, renderCommand);
        }
    };
    
    /**
     * Convenience function to create a canvas
     *
     * @static
     *
     * @param {string} name Name and ID of the canvas element
     * @param {number} width Base width of the canvas element
     * @param {number} height Base height of the canvas element
     * @returns {HTMLCanvasElement}
     * @since 1.0
     */
    RenderCache.createCanvas = function(name, width, height) {
        return _makeCanvas(name, width, height);
    };
    
    /**
     * Initializes the cache by creating the canvas and rendering out the command
     *
     * @throws {Error} When the renderCommand is not of type function
     *
     * @param {number} width Cache Width
     * @param {number} height Cache Height
     * @param {function} renderCommand Function to render the content with - will include a context parameter
     * @returns {RenderCache}
     * @since 1.0
     */
    RenderCache.prototype.init = function(width, height, renderCommand) {
        if (width === 0 || height === 0) {
            throw 'RenderCache::init - Error: width and height must be greater than 0';
        }

        this.width = width;
        this.height = height;
        
        this.canvas = _makeCanvas(CACHE_PREFIX + this.id, width, height);
        this.context = this.canvas.getContext('2d');
        
        if (typeof renderCommand !== RENDER_COMMAND_TYPE) {
            throw 'RenderCache::init - Error: RenderCommand is of type '
                + (typeof renderCommand) + ' not of type ' + RENDER_COMMAND_TYPE;
        }

        this.renderCommand = renderCommand;
        
        this.render();
        
        return this;
    };
    
    /**
     * Sets up the size of the render cache
     *
     * @param {number} width Cache Width
     * @param {number} height Cache Height
     * @returns {RenderCache}
     * @since 1.0
     */
    RenderCache.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        
        return this;
    };
    
    /**
     * Gets the currently rendered content
     *
     * @returns {HTMLCanvasElement}
     * @since 1.1
     */
    RenderCache.prototype.getContent = function() {
        return this.canvas;
    };
    
    /**
     * Renders out the command onto the cache
     * Not intended to be run on the main loop at every step
     *
     * @returns {RenderCache}
     * @since 1.0
     */
    RenderCache.prototype.render = function() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.renderCommand(this.context);
        
        return this;
    };
    
    return RenderCache;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * Stage Module Definition
 * @author Adam Ranfelt 
 * @version 1.2
 */
define('layer/Stage',[
    'layer/Layer',
    'layer/RenderCache'
], function(
    Layer,
    RenderCache
) {
    
    
    /**
     * Hardware CSS Styles to modify for acceleration
     *
     * @private
     * @type {string[]}
     * @constant
     * @since 1.0
     */
    var HARDWARE_STYLES = [
        'webkitTransform'
    ];
    
    /**
     * Settings for each hardware CSS styles to modify for acceleration
     *
     * @private
     * @type {Object}
     * @constant
     * @since 1.0
     */
    var HARDWARE_SETTINGS = {
        'webkitTransform': 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)'
    };
    
    /**
     * Prepares and calculates the hardware settings
     * Attempts to apply settings only if unset
     *
     * @private
     * @function
     * @param {HTMLElement} element Element to prepare hardware acceleration for
     * @returns {string[]}
     * @since 1.0
     */
    var _prepareHardwareSettings = function(element) {
        var i = 0;
        var length = HARDWARE_STYLES.length;
        for (; i < length; i++) {
            if (element.style[HARDWARE_STYLES[i]] === '') {
                element.style[HARDWARE_STYLES[i]] = HARDWARE_SETTINGS[HARDWARE_STYLES[i]];
            }
        }
    };
    
    /**
     * Applies a statically generated layer name/id
     *
     * @private
     * @function
     * @since 1.0
     */
    var _applyAutoLayerName = function(layer) {
        layer.id = LAYER_PREFIX + _canvasId++;
    };
    
    /**
     * <p>Stage Constructor</p>
     *
     * <p>Manager of the layers of the stage and controls hardware acceleration</p>
     * 
     * @name Stage
     * @class Container to manage the canvas elements and layers
     * @constructor
     * 
     * @param {HTMLElement} viewport Container for the canvas elements
     * @param {number} width Base width of the stage
     * @param {number} height Base height of the stage
     * @param {string} sceneNamespace Scene namespace firing events from
     * @since 1.0
     */
    var Stage = function(viewport, width, height, sceneNamespace) {
        if (viewport !== undefined && width !== undefined && height !== undefined && sceneNamespace !== undefined) {
            this.init(viewport, width, height, sceneNamespace);
        }
    };
    
    /**
     * Stage initialization
     *
     * Initializes the layer management container
     * Generates layers for canvas layer elements located within the container
     * 
     * @throws {ArgumentsError} If the stage doesn't receive all the arguments
     * 
     * @param {HTMLElement} viewport Container for the canvas elements
     * @param {number} width Base width of the stage
     * @param {number} height Base height of the stage
     * @param {string} sceneNamespace Scene namespace firing events from
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.init = function(viewport, width, height, sceneNamespace) {
        if (arguments.length !== 4) {
            throw new Error('ArgumentsError: Stage expects arguments: new Stage(viewport, width, height, sceneNamespace) received ' + arguments.length);
        }
        
        /**
         * Viewport container object to contain the layers/canvases
         *
         * @name Stage#viewport
         * @type {HTMLElement}
         * @since 1.0
         */
        this.viewport = viewport;
        
        /**
         * Width of the stage
         *
         * @name Stage#width
         * @type {number}
         * @since 1.0
         */
        this.width = width;
        
        /**
         * Height of the stage
         *
         * @name Stage#height
         * @type {number}
         * @since 1.0
         */
        this.height = height;

        /**
         * Namespace of the scene firing events from
         *
         * @name Stage#sceneNamespace
         * @type {string}
         * @since 1.2
         */
        this.sceneNamespace = sceneNamespace;
        
        /**
         * Layer list which mimics the DOM representation
         *
         * @default []
         * @name Stage#layers
         * @type {Layer[]}
         * @since 1.0
         */
        var layers = this.layers = [];
        
        /**
         * Layer cache which stores layers by name for quick lookup
         *
         * @default {}
         * @name Stage#layerCache
         * @type {Object}
         * @since 1.0
         */
        this.layerCache = {};

        var children = this.viewport.children;
        var i = 0;
        var length = children.length;

        // Creates representative layers for existing canvases
        for (; i < length; i++) {
            children[i].width = width;
            children[i].height = height;
            layers.push(new Layer(children[i], sceneNamespace));
        }
        
        /**
         * Count of the layers in the stage
         *
         * @name Stage#layerCount
         * @type {number}
         * @since 1.0
         */
        this.layerCount = layers.length;
        
        return this;
    };
    
    /**
     * Creates a layer with the dimensions of the stage and name provided
     * 
     * @throws {ArgumentsError} If the name is undefined
     * 
     * @param {string} name Layer name/id
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.createLayer = function(name) {
        if (name === undefined) {
            throw new Error('ArgumentsError: Layer name is undefined');
        }
        
        return new Layer(RenderCache.createCanvas(name, this.width, this.height), this.sceneNamespace);
    };
    
    /**
     * Enables hardware acceleration for all canvases
     *
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.enableCSSAcceleration = function() {
        var i = 0;
        var length = this.layers.length;
        for (; i < length; i++) {
            this.enableCSSAccelerationByIndex(i);
        }
        
        return this;
    };
    
    /**
     * Enables hardware acceleration for a specific layer
     *
     * @param {Layer} layer Layer to enable acceleration for
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.enableCSSAccelerationForLayer = function(layer) {
        var canvas = layer.getCanvas();
        _prepareHardwareSettings(canvas);
        
        return this;
    };
    
    /**
     * Enables acceleration by a layer name contained within the stage
     *
     * @param {string} name Name of the layer to enable
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.enableCSSAccelerationByName = function(name) {
        return this.enableCSSAccelerationForLayer(this.getLayerByName(name));
    };
    
    /**
     * Enables acceleration by a layer index
     *
     * @param {string} index Index of the layer to enable acceleration
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.enableCSSAccelerationByIndex = function(index) {
        return this.enableCSSAccelerationForLayer(this.getLayerByIndex(index));
    };
    
    /**
     * Creates and prepends a layer into stage
     *
     * @param {string} name Name of the layer to create
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.createAndPrependLayer = function(name) {
        return this.prependLayer(this.createLayer(name));
    };
    
    /**
     * Creates and appends a layer into stage
     *
     * @param {string} name Name of the layer to create
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.createAndAppendLayer = function(name) {
        return this.appendLayer(this.createLayer(name));
    };
    
    /**
     * Creates and inserts a layer into stage
     *
     * @param {string} name Name of the layer to create
     * @param {number} index Index to insert into
     * @returns {Stage}
     * @since 1.0
     */
    Stage.prototype.createAndInsertLayerAtIndex = function(name, index) {
        return this.insertLayerAtIndex(this.createLayer(name), index);
    };
    
    /**
     * Using the cache, gets a layer by name
     *
     * @throws {UndefinedError} If the layer by the provided name doesn't exist
     *
     * @param {string} name Name of the layer to find
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.getLayerByName = function(name) {
        if (!this.layerCache.hasOwnProperty(name)) {
            throw new Error('UndefinedError: Layer with name ' + name + ' does not exist');
        }
        
        return this.layerCache[name];
    };
    
    /**
     * Gets a layer by index
     *
     * @throws {UndefinedError} If the index is out of bounds
     *
     * @param {number} index Index of the layer to find
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.getLayerByIndex = function(index) {
        if (index < 0 || index >= this.layerCount) {
            throw new Error('UndefinedError: Index ' + index + ' is out of bounds');
        }
        
        return this.layers[index];
    };
    
    /**
     * Prepends the layer to the viewport and stage
     *
     * @param {Layer} layer Layer to prepend
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.prependLayer = function(layer) {
        if (!this.viewport.hasChildNodes()) {
            return this.appendLayer(layer);
        }

        this.viewport.insertBefore(layer.getCanvas(), this.viewport.firstChild);
        this.layerCache[layer.name] = layer;
        this.layers.unshift(layer);
        this.layerCount = this.layers.length;
        
        return this;
    };
    
    /**
     * Appends the layer to the viewport and stage
     *
     * @param {Layer} layer Layer to append
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.appendLayer = function(layer) {
        this.viewport.appendChild(layer.getCanvas());
        this.layerCache[layer.name] = layer;
        this.layers.push(layer);
        this.layerCount = this.layers.length;
        
        return this;
    };
    
    /**
     * Insert the layer to the viewport and stage
     *
     * @param {Layer} layer Layer to insert
     * @param {number} index Index to insert layer after
     * @returns {Layer}
     * @since 1.0
     */
    Stage.prototype.insertLayerAtIndex = function(layer, index) {
        if (index < 0) {
            return this.prependLayer(layer);
        } else if (index >= this.layerCount) {
            return this.appendLayer(layer);
        }

        var targetLayer = this.layers[index];
        var targetCanvas = targetLayer.getCanvas();
        targetCanvas.parentNode.insertBefore(layer.getCanvas(), targetCanvas);

        this.layerCache[layer.name] = layer;
        this.layers.splice(index, 0, layer);
        this.layerCount = this.layers.length;

        return this;
    };
    
    /**
     * Public convenience function to loop on the layers with
     *
     * @param {function} callback Callback that expects layer as a parameter
     * @since 1.1
     */
    Stage.prototype.forEachLayer = function(callback) {
        var i = 0;
        var layerCount = this.layerCount;
        
        for (; i < layerCount; i++) {
            callback(this.getLayerByIndex(i));
        }
    };
    
    return Stage;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * Scene Module Definition
 * @author Adam Ranfelt
 * @version 1.5
 */
define('layer/Scene',[
    'layer/Stage',
    'layer/Input',
    'layer/HitEvent',
    'layer/RenderMediator',
    'layer/EventBus'
], function(
    Stage,
    Input,
    HitEvent,
    RenderMediator,
    EventBus
) {
    
    
    /**
     * Render Layer
     * Renders the layer called during an iteration on the Stage object
     *
     * @param {Layer} layer Layer to render with
     * @since 1.1
     */
    var _renderLayer = function(layer) {
        layer.render();
    };
    
    /**
     * Scene Constructor
     *
     * Effectively acts as Facade of the interactive engine
     * Scene to coordinate all components of a display
     * Facade pattern to encapsulate the stage, layers, and hit detection
     *
     * @name Scene
     * @class Scene container object for layered canvas
     * @constructor
     *
     * @param {HTMLElement} container Container object where the canvases are contained
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @since 1.0
     */
    var Scene = function(container, width, height) {
        if (container !== undefined && width !== undefined && height !== undefined) {
            this.init(container, width, height);
        }
    };
    
    /**
     * Initializes the Scene with the container
     * Sets up a stage and all necessary layers
     *
     * @param {HTMLElement} container Container object where the canvases are contained
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @returns {Scene}
     * @since 1.0
     */
    Scene.prototype.init = function(container, width, height) {
        /**
         * Stage for the scene to be contained within
         *
         * @default null
         * @name Scene#stage
         * @type {Stage}
         * @since 1.0
         */
        this.stage = null;
        
        /**
         * Container object for the scene to be contained within
         * Container may have canvas elements within it
         * Container will be used as the viewport for the stage
         *
         * @name Scene#container
         * @type {HTMLElement}
         * @since 1.3.1
         */
        this.container = container;
        
        /**
         * Scene Input controller to listen from the container
         *
         * @name Scene#input
         * @type {Input}
         * @since 1.0
         */
        this.input = new Input(container);

        /**
         * Scene Input controller namespace to associate directly with the scene
         *
         * @name Scene#sceneNamespace
         * @type {string}
         * @since 1.5
         */
        this.sceneNamespace = this.input.getNamespace();

        this.setupStage(container, width, height);
        
        /**
         * Currently active input target
         * Used to determine which element is currently active and hovered within the scene
         *
         * @name Scene#activeTarget
         * @type {Renderable}
         * @since 1.1
         */
        this.activeTarget = null;
        
        /**
         * Last used mouse object
         * Should be considered immutable and opaque
         *
         * @private
         * @name Scene#activeMouse
         * @type {Mouse}
         * @since 1.1
         */
        this.activeMouse = null;
        
        /**
         * Flag to determine whether the layer system should find all elements
         * If this is disabled, it only finds the path to the top-most element
         *
         * @name Scene#shouldFindAllRenderables
         * @type {boolean}
         * @since 1.4
         */
        this.shouldFindAllRenderables = false;
        
        /**
         * Flag for whether the scene is enabled or not
         * If the scene is enabled, it will listen to the input
         *
         * @name Scene#isEnabled
         * @type {boolean}
         * @since 1.4
         */
        this.isEnabled = false;

        RenderMediator.setNeedsRender(this.sceneNamespace);
        
        return this.setupHandlers().enable();
    };

    /**
     * Create new stage for the scene to be contained within
     *
     * @param {HTMLElement} container Container object where the canvases are contained
     * @param {number} width Base unscaled width
     * @param {number} height Base unscaled height
     * @returns {Scene}
     * @since 1.3
     */
    Scene.prototype.setupStage = function(container, width, height) {
        this.stage = new Stage(container, width, height, this.sceneNamespace);

        return this;
    };
    
    /**
     * Binds all handler functions to local bound handler functions
     *
     * @returns {Scene}
     * @since 1.0
     */
    Scene.prototype.setupHandlers = function() {
        this.onMoveHandler = this.onMove.bind(this);
        this.onUpHandler = this.onUp.bind(this);
        this.onDownHandler = this.onDown.bind(this);
        this.onClickHandler = this.onClick.bind(this);
        this.onInputDisableHandler = this.onInputDisable.bind(this);

        return this;
    };
    
    /**
     * Enables interactivity
     *
     * @returns {Scene}
     * @since 1.4
     */
    Scene.prototype.enable = function() {
        if (this.isEnabled) {
            return this;
        }
        
        this.isEnabled = true;
        
        var sceneNamespace = this.sceneNamespace;
        
        EventBus.on(Input.MOUSE_MOVE + sceneNamespace, this.onMoveHandler);
        EventBus.on(Input.MOUSE_UP + sceneNamespace, this.onUpHandler);
        EventBus.on(Input.MOUSE_DOWN + sceneNamespace, this.onDownHandler);
        EventBus.on(Input.CLICK + sceneNamespace, this.onClickHandler);
        EventBus.on(Input.DISABLE + sceneNamespace, this.onInputDisableHandler);

        return this;
    };
    
    /**
     * Disables interactivity
     *
     * @returns {Scene}
     * @since 1.4
     */
    Scene.prototype.disable = function() {
        if (!this.isEnabled) {
            return this;
        }
        
        this.isEnabled = false;
        
        var sceneNamespace = this.sceneNamespace;
        
        EventBus.off(Input.MOUSE_MOVE + sceneNamespace, this.onMoveHandler);
        EventBus.off(Input.MOUSE_UP + sceneNamespace, this.onUpHandler);
        EventBus.off(Input.MOUSE_DOWN + sceneNamespace, this.onDownHandler);
        EventBus.off(Input.CLICK + sceneNamespace, this.onClickHandler);
        EventBus.off(Input.DISABLE + sceneNamespace, this.onInputDisableHandler);

        return this;
    };
    
    /**
     * Adds a child to the layer at index 0 if no target is defined
     * Otherwise the target will be parsed by number or string to pipe to the proper method
     *
     * @param {Renderable} child Child to add
     * @param {string|number|null} target Optional target element key to add the child to
     * @returns {Scene}
     * @since 1.1
     */
    Scene.prototype.addChild = function(child, target) {
        if (target === undefined) {
            return this.addChildToLayerByIndex(child, 0);
        } else if (typeof target === 'number') {
            return this.addChildToLayerByIndex(child, target);
        } else if (typeof target === 'string') {
            return this.addChildToLayerByName(child, name);
        }
        
        return this;
    };
    
    /**
     * Removes a child from the layer at index 0 if no target is defined
     * Otherwise, the target will be parsed by number or string to pipe to the proper method
     *
     * @param {Renderable} child Child to remove
     * @param {string|number|null} target Optional target element key to add the child to
     * @returns {Scene}
     * @since 1.1
     */
    Scene.prototype.removeChild = function(child, target) {
        if (target === undefined) {
            return this.removeChildFromLayerByIndex(child, 0);
        } else if (typeof target === 'number') {
            return this.removeChildFromLayerByIndex(child, target);
        } else if (typeof target === 'string') {
            return this.removeChildFromLayerByName(child, name);
        }
        
        return this;
    };
    
    /**
     * Adds a child to the layer at the index specified
     *
     * @param {Renderable} child Child to add
     * @param {number} layerIndex Index of the layer to add to
     * @returns {Scene}
     * @since 1.2
     */
    Scene.prototype.addChildToLayerByIndex = function(child, layerIndex) {
        var layer = this.stage.getLayerByIndex(layerIndex);
        layer.root.addChild(child);
        
        return this;
    };
    
    /**
     * Removes a child to the layer from the index specified
     *
     * @param {Renderable} child Child to remove
     * @param {number} layerIndex Index of the layer to add to
     * @returns {Scene}
     * @since 1.2
     */
    Scene.prototype.removeChildFromLayerByIndex = function(child, layerIndex) {
        var layer = this.stage.getLayerByIndex(layerIndex);
        layer.root.removeChild(child);
        
        return this;
    };
    
    /**
     * Adds a child to the layer at the name specified
     *
     * @param {Renderable} child Child to add
     * @param {number} layerName Name of the layer to add to
     * @returns {Scene}
     * @since 1.3
     */
    Scene.prototype.addChildToLayerByName = function(child, layerName) {
        var layer = this.stage.getLayerByName(layerName);
        layer.root.addChild(child);
        
        return this;
    };
    
    /**
     * Removes a child to the layer from the name specified
     *
     * @param {Renderable} child Child to remove
     * @param {string} layerName Name of the layer to add to
     * @returns {Scene}
     * @since 1.3
     */
    Scene.prototype.removeChildFromLayerByName = function(child, layerName) {
        var layer = this.stage.getLayerByName(layerName);
        layer.root.removeChild(child);
        
        return this;
    };

    /**
     * Generates a stack of renderables
     * If it no target exists, returns an empty stack
     * Performs a depth first search to find the scene graph elements in order
     * If the scene has shouldFindAllRenderables enabled, it performs a full-graph DFS
     * Prunes naturally if a branch is not interactive or fails a hit test
     *
     * Generates a hit stack array object from a renderable source and point
     * The stack is in ordered by the origin at 0 to the front-most hit area at the end
     * TODO: Update hit stack to only gather methods that have the proper hit callback methods implemented
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable[]}
     * @since 1.1
     */
    Scene.prototype.getHitStack = function(x, y) {
        var hitStack = [];
        var target = null;
        var self = this;
        
        // Follows the layer order - untested against a large layer set
        this.stage.forEachLayer(function(layer) {
            target = layer.getRoot();
            
            self.getDepthFirstHitStack(x, y, hitStack, target, 0);
        });
        
        return hitStack;
    };
    
    /**
     * Generates a stack of renderables through a depth first search
     * If it no target exists, returns an empty stack
     *
     * Generates a hit stack array object from a renderable source and point
     * The stack is in ordered by the origin at 0 to the front-most hit area at the end
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @param {Renderable[]} stack Hit stack
     * @param {Renderable} parent Parent renderable to perform search from
     * @param {number} insertIndex Index in the stack to insert discovered elements
     * @returns {Renderable[]}
     * @since 1.4
     */
    Scene.prototype.getDepthFirstHitStack = function(x, y, stack, parent, insertIndex) {
        var child = parent.getChildHitTarget(x, y);
        while (child !== null) {
            stack.splice(insertIndex, 0, child);
            // If the child is a leaf node and the scene has the full stack enabled
            if (!child.isLeafNode) {
                this.getDepthFirstHitStack(x, y, stack, child, insertIndex + 1);
            }
            
            if (this.shouldFindAllRenderables) {
                child = parent.getNextChildHitTarget(x, y, child);
            } else {
                child = null;
            }
        }
    };
    
    /**
     * Gathers the bottommost hit target to use
     * If it no target exists, returns null
     *
     * Target is gathered from all the layers
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {Renderable[]|null}
     * @since 1.1
     */
    Scene.prototype.getHitTarget = function(x, y) {
        var targetList = [];
        var target = null;
        
        this.stage.forEachLayer(function(layer) {
            target = layer.getRoot().getHitTarget(x, y);
            
            if (target) {
                targetList.push(target);
            }
        });
        
        target = targetList.shift();
        return target || null;
    };
    
    /**
     * Updates the active target based on the passed positioning
     * Active target updates include out/over logic to update which element is currently hovered
     *
     * @param {Renderable[]} hitStack Stack of hit targets
     * @param {number} x X Hit position
     * @param {number} y Y Hit position
     * @returns {Scene}
     * @since 1.1
     */
    Scene.prototype.updateActiveTarget = function(hitStack, x, y) {
        var topHitTarget = null;
        if (hitStack.length) {
            topHitTarget = hitStack[hitStack.length - 1 || 0];
        }
        
        if (this.activeTarget !== topHitTarget) {
            
            if (this.activeTarget !== null) {
                this.onOut(this.activeTarget, x, y);
            }
            
            if (topHitTarget !== null) {
                this.onOver(topHitTarget, x, y);
            }
            
            this.activeTarget = topHitTarget;
        }
        
        return this;
    };
    
    /**
     * Gets the Stage
     *
     * @returns {Stage}
     * @since 1.1
     */
    Scene.prototype.getStage = function() {
        return this.stage;
    };

    /**
     * Trigger onOut with active target when input is disabled
     *
     * @param {String} type
     * @param {Mouse} mouse
     * @since 1.5
     */
    Scene.prototype.onInputDisable = function(type, mouse) {
        if (this.activeTarget !== null) {
            this.onOut(this.activeTarget, mouse.x, mouse.y);
        }

        this.activeTarget = null;
    };
    
    /**
     * onMove Handler
     * Creates a HitEvent when a mousemove event is triggered
     *
     * @param {string} type Event type
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onMove = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        this.updateActiveTarget(hitStack, mouse.x, mouse.y);

        this.activeMouse = mouse;

        if (hitStack.length > 0) {
            var event = new HitEvent(HitEvent.MOUSE_MOVE, mouse.x, mouse.y, hitStack, true);
        }
    };
    
    /**
     * onUp Handler
     * Creates a HitEvent when a mouseup event is triggered
     *
     * @param {string} type Event type
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onUp = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        if (hitStack.length > 0) {
            var event = new HitEvent(HitEvent.MOUSE_UP, mouse.x, mouse.y, hitStack, true);
        }
    };
    
    /**
     * onDown Handler
     * Creates a HitEvent when a mousedown event is triggered
     *
     * @param {string} type Event type
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onDown = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        if (hitStack.length > 0) {
            var event = new HitEvent(HitEvent.MOUSE_DOWN, mouse.x, mouse.y, hitStack, true);
        }
    };
    
    /**
     * onClick Handler
     * Creates a HitEvent when a click event is triggered
     *
     * @param {string} type Event type
     * @param {Mouse} mouse Mouse state
     * @since 1.0
     */
    Scene.prototype.onClick = function(type, mouse) {
        var hitStack = this.getHitStack(mouse.x, mouse.y);
        if (hitStack.length > 0) {
            var event = new HitEvent(HitEvent.CLICK, mouse.x, mouse.y, hitStack, true);
        }
    };
    
    /**
     * onOver Handler
     * Creates a HitEvent when a mouseover event is triggered
     *
     * @param {Renderable} target Mouse state
     * @param {number} x X mouse position
     * @param {number} y Y mouse position
     * @since 1.1
     */
    Scene.prototype.onOver = function(target, x, y) {
        var event = new HitEvent(HitEvent.MOUSE_OVER, x, y, target, false);
    };
    
    /**
     * onOut Handler
     * Creates a HitEvent when a mouseout event is triggered
     *
     * @param {Renderable} target Mouse state
     * @param {number} x X mouse position
     * @param {number} y Y mouse position
     * @since 1.1
     */
    Scene.prototype.onOut = function(target, x, y) {
        var event = new HitEvent(HitEvent.MOUSE_OUT, x, y, target, false);
    };
    
    /**
     * Updates the scene input elements
     * Tells the active target to update in case something has moved
     * If disabled, the loop does not fully process
     *
     * @since 1.1
     */
    Scene.prototype.update = function() {
        if (!this.isEnabled) {
            return;
        }
        
        var activeMouse = this.activeMouse;
        if (activeMouse === null) {
            return;
        }
        
        var hitStack = this.getHitStack(activeMouse.x, activeMouse.y);
        this.updateActiveTarget(hitStack, activeMouse.x, activeMouse.y);
    };
    
    /**
     * Renders all the children in the stage's layer stack
     *
     * @since 1.0
     */
    Scene.prototype.render = function() {
        if (RenderMediator.getNeedsRender(this.sceneNamespace)) {
            this.stage.forEachLayer(_renderLayer);
        }
    };

    return Scene;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * PolarRenderable Module Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */
define('layer/polar/PolarRenderable',[
    'layer/Renderable',
    'layer/Geometry'
], function(
    Renderable,
    Geometry
) {
    
    
    /**
     * Locally cached Math.sqrt function
     * Optimization step to decrease the access to Math.sqrt
     *
     * @private
     * @function
     * @type {function}
     * @since 1.0
     */
    var sqrt = Math.sqrt;
    
    /**
     * Locally cached Math.round function
     * Optimization step to decrease the access to Math.round
     *
     * @private
     * @function
     * @type {function}
     * @since 1.0
     */
    var round = Math.round;
    
    /**
     * Locally cached Math.atan2 function
     * Optimization step to decrease the access to Math.atan2
     *
     * @private
     * @function
     * @type {function}
     * @since 1.0
     */
    var atan2 = Math.atan2;
    
    /**
     * Reused cache version of the 2d vector
     * Used to calculate vector calculations without the need
     * for multiple instances of the array within calculations
     *
     * Should not be used within a loop that could call children of the same type or supertype
     *
     * @private
     * @type {number[]}
     * @since 1.0
     */
    var vector = [0, 0];
    
    /**
     * Reused cache version of the polar vector
     * Used to calculate vector calculations without the need
     * for multiple instances of the array within calculations
     * (r, theta)
     *
     * Should not be used within a loop that could call children of the same type or supertype
     *
     * @private
     * @type {number[]}
     * @since 1.0
     */
    var polarVector = [0, 0];
    
    /**
     * PolarRenderable Constructor
     *
     * Base implementation built to be extended
     * Supports mouse events via onClick, onMouseMove, onMouseUp, onMouseDown
     * Handles point-based rotations, scale, and position on a run loop
     * Updates the transform content on demand
     * Supports demand flag for when the renderable has been modified
     * X and Y is assumed to be the x and y with respect to a polar coordinate space
     * 
     * @name PolarRenderable
     * @class Polar Renderable structure used to render objects in polar space
     * @constructor
     * @extends Renderable
     * 
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} radius Radius in polar coordinates
     * @param {number} theta Angle in radians
     * @since 1.0
     */
    var PolarRenderable = function(x, y, radius, theta) {
        if (x !== undefined && y !== undefined && radius !== undefined && theta !== undefined) {
            this.init(x, y, radius, theta);
        }
    };
    
    PolarRenderable.prototype = new Renderable();
    PolarRenderable.prototype.constructor = PolarRenderable;
    
    /**
     * @see Renderable#init
     */
    PolarRenderable.prototype.Renderable_init = Renderable.prototype.init;
    
    /**
     * Initializes the Renderable by setting up the spatial properties
     * Sets up the center offset, position, size, scale, rotation, and transform
     *
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} radius Radius in polar coordinates
     * @param {number} theta Angle in radians
     * @returns {PolarRenderable}
     * @since 1.0
     */
    PolarRenderable.prototype.init = function(x, y, radius, theta) {
        this.Renderable_init(x, y, radius, theta);
        
        /**
         * Radius of the polar renderable's position
         *
         * @default 0
         * @name PolarRenderable#radius
         * @type {number}
         * @since 1.0
         */
        this.radius = radius || 0;
        
        /**
         * Theta of the polar renderable's position
         *
         * @default 0
         * @name PolarRenderable#radius
         * @type {number}
         * @since 1.0
         */
        this.theta = theta || 0;
    };
    
    /**
     * Tests the hit to see if it exists within the bounding box of this renderable
     * Uses a rectangle test method
     *
     * @param {number} x X Position in World Coordinates
     * @param {number} y Y Position in Wolrd Coordinates
     * @returns {boolean}
     * @since 1.0
     */
    PolarRenderable.prototype.hitTest = function(x, y) {
        polarVector = this.convertWorldToPolar(x, y);
        return this.theta === polarVector[1] && polarVector[0] <= this.radius;
    };
    
    /**
     * Converts a local coordinate space into a polar coordinate space
     *
     * @param {number[]} vec 2 dimensional local coordinates
     * @returns {number[]}
     * @since 1.0
     */
    PolarRenderable.prototype.toPolarCoords = function(vec) {
        polarVector[0] = sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
        polarVector[1] = atan2(vec[1], vec[0]);
        
        if (polarVector[1] < 0) {
            polarVector[1] = polarVector[1] + Geometry.TWO_PI;
        }
        
        return polarVector;
    };
    
    /**
     * Converts a world coordinate space into a polar coordinate space
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {number[]}
     * @since 1.0
     */
    PolarRenderable.prototype.convertWorldToPolar = function(x, y) {
        vector[0] = x;
        vector[1] = y;
        vector = this.toLocalCoordinates(vector, true);
        polarVector = this.toPolarCoords(vector);
        
        return polarVector;
    };

    return PolarRenderable;
});
/**
 * @fileOverview
 * Copyright (c) 2012 Adam Ranfelt
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
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
 * PolarRenderableGroup Module Definition
 * @author Adam Ranfelt 
 * @version 1.0
 */

define('layer/polar/PolarRenderableGroup',[
    'layer/RenderableGroup',
    'layer/Geometry'
], function(
    RenderableGroup,
    Geometry
) {
    
    
    /**
     * Locally cached Math.sqrt function
     * Optimization step to decrease the access to Math.sqrt
     *
     * @private
     * @function
     * @type {function}
     * @since 1.0
     */
    var sqrt = Math.sqrt;
    
    /**
     * Locally cached Math.round function
     * Optimization step to decrease the access to Math.round
     *
     * @private
     * @function
     * @type {function}
     * @since 1.0
     */
    var round = Math.round;
    
    /**
     * Locally cached Math.atan2 function
     * Optimization step to decrease the access to Math.atan2
     *
     * @private
     * @function
     * @type {function}
     * @since 1.0
     */
    var atan2 = Math.atan2;
    
    /**
     * Reused cache version of the 2d vector
     * Used to calculate vector calculations without the need
     * for multiple instances of the array within calculations
     *
     * Should not be used within a loop that could call children of the same type or supertype
     *
     * @private
     * @type {number[]}
     * @since 1.0
     */
    var vector = [0, 0];
    
    /**
     * Reused cache version of the polar vector
     * Used to calculate vector calculations without the need
     * for multiple instances of the array within calculations
     * (r, theta)
     *
     * Should not be used within a loop that could call children of the same type or supertype
     *
     * @private
     * @type {number[]}
     * @since 1.0
     */
    var polarVector = [0, 0];
    
    /**
     * <p>Polar Renderable Group Constructor</p>
     *
     * <p>Polar renderable group construct built to support scenegraph based children</p>
     * 
     * @name PolarRenderableGroup
     * @class Polar RenderableGroup Container structure used to store Renderable children which owns the origin
     * @constructor
     * @extends RenderableGroup
     * 
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} radius Radius of the renderable group
     * @since 1.0
     */
    var PolarRenderableGroup = function(x, y, radius) {
        if (x !== undefined && y !== undefined && radius !== undefined) {
            this.init(x, y, radius);
        }
    };
    
    PolarRenderableGroup.prototype = new RenderableGroup();
    PolarRenderableGroup.prototype.constructor = PolarRenderableGroup;
    
    PolarRenderableGroup.prototype.RenderableGroup_init = RenderableGroup.prototype.init;
    PolarRenderableGroup.prototype.RenderableGroup_toLocalCoordinates = RenderableGroup.prototype.toLocalCoordinates;
    PolarRenderableGroup.prototype.RenderableGroup_render = RenderableGroup.prototype.render;
    
    PolarRenderableGroup.prototype.init = function(x, y, radius) {
        this.RenderableGroup_init(x, y, radius, radius);
        
        this.radius = radius;
    };
    
    /**
     * Tests the hit to see if it exists within the bounding box of this renderable
     * Uses a rectangle test method
     *
     * @param {number} x X Position in World Coordinates
     * @param {number} y Y Position in Wolrd Coordinates
     * @returns {boolean}
     * @since 1.0
     */
    PolarRenderableGroup.prototype.hitTest = function(x, y) {
        vector[0] = x;
        vector[1] = y;
        
        vector = this.toLocalCoordinates(vector, true);
        
        return vector[0] * vector[0] + vector[1] * vector[1] <= this.radius * this.radius;
    };
    
    /**
     * Converts a local coordinate space into a polar coordinate space
     *
     * @param {number[]} vec 2 dimensional local coordinates
     * @returns {number[]}
     * @since 1.0
     */
    PolarRenderableGroup.prototype.toPolarCoords = function(vec) {
        polarVector[0] = sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
        polarVector[1] = atan2(vec[1], vec[0]);
        
        if (polarVector[1] < 0) {
            polarVector[1] = polarVector[1] + Geometry.TWO_PI;
        }
        
        return polarVector;
    };
    
    /**
     * Converts a world coordinate space into a polar coordinate space
     *
     * @param {number} x X Position
     * @param {number} y Y Position
     * @returns {number[]}
     * @since 1.0
     */
    PolarRenderableGroup.prototype.convertWorldToPolar = function(x, y) {
        vector[0] = x;
        vector[1] = y;
        vector = this.toLocalCoordinates(vector, true);
        polarVector = this.toPolarCoords(vector);
        
        return polarVector;
    };
    
    return PolarRenderableGroup;
});
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
define("Layer", function(){});
}));