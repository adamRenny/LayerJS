({
	baseUrl: '../../src',
	paths: {
        layer: 'layer',
        lib: 'lib'
    },
    name: '../tool/compiler/almond',

    include: 'Layer',

    out: '../../dist/Layer.js',

    wrap: {
        start: '' + 
'(function(root, factory) {\n' + 
    'if (typeof exports === \'object\') {\n' + 
        '// Node. Does not work with strict CommonJS, but\n' + 
        '// only CommonJS-like enviroments that support module.exports,\n' + 
        '// like Node.\n' + 
        'module.exports = factory(global);\n' + 
    '} else if (typeof define === \'function\' && define.amd) {\n' + 
        '// AMD. Register as an anonymous module.\n' + 
        'define([], function() {\n' + 
            '// Not using a global object to avoid setting globally\n' +
            'return factory(null);\n' + 
        '});\n' + 
    '} else {\n' + 
        '// Browser globals\n' + 
        'factory(root);\n' +
    '}\n' +
'}(this, function(root) {\n',
        end: '' +
        'var layer = require(\'Layer\');\n' +
        'if (root) {\n' +
            'root.layer = layer;\n' +
        '}\n' +
        'return layer;\n' +
        '}));'
    }
})