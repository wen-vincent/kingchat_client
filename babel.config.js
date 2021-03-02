module.exports = function (api) {
    api.cache(true);

    const presets = [
        ["@babel/env", {
            "modules": "commonjs"
        }]
    ];
    // const plugins = [
    //     "@babel/plugin-transform-runtime",
    //     ["import", { "libraryName": "protoo-client", "style": true }]
    // ];

    const plugins = [
        "@babel/plugin-transform-runtime"
    ];

    return {
        presets,
        plugins
    };
}