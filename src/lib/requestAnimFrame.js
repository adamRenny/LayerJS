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
        define([], function () {
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

});