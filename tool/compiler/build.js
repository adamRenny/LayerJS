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
'(function(root, factory) {' + 
    'if (typeof exports === \'object\') {' + 
        '// Node. Does not work with strict CommonJS, but' + 
        '// only CommonJS-like enviroments that support module.exports,' + 
        '// like Node.' + 
        'module.exports = factory(global);' + 
    '} else if (typeof define === \'function\' && define.amd) {' + 
        '// AMD. Register as an anonymous module.' + 
        'define([], function() {' + 
            '// Not using a global object to avoid setting globally' +
            'return factory(null);' + 
        '});' + 
    '} else {' + 
        '// Browser globals' + 
        'factory(root);' +
    '}' +
'}(this, function(root) {',
        end: '}));'
    }
})