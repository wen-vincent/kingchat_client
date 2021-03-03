module.exports = function (api) {
    api.cache(true);

    const presets = [
        ["@babel/env", {
            "modules": "commonjs",
            "targets": {
                // "edge": "17",
                // "firefox": "60",
                "chrome": "43"
                // "safari": "11.1"
              },
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