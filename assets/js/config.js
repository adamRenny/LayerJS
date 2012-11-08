require.config({
    baseUrl: 'js/',
    paths: {
        layer: '../../../../assets/js/layer',
        lib: '../../../../assets/js/lib',
        assets: '../../../../assets/js'
    },
    urlArgs: 'cb=' + new Date().getTime()
});