require.config({
    baseUrl: 'js/',
    paths: {
        layer: '../../../../src/layer',
        lib: '../../../../src/lib',
        assets: '../../../assets/js'
    },
    urlArgs: 'cb=' + new Date().getTime()
});