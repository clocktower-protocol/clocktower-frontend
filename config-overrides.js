const webpack = require('webpack');

module.exports = function override(config, env) {
    const fallback = config.resolve.fallback || {};
    config.ignoreWarnings = [/Failed to parse source map/];
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url"),
        "process/browser": require.resolve("process/browser")
    })
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])

    /*
    if (env === 'development') {
        config.devtool = 'cheap-module-source-map';
        config.output = {
          ...config.output,
          devtoolModuleFilenameTemplate: 'webpack://[resource-path]',
        };
        // Ensure source maps are written to disk
        config.devServer = {
          ...(config.devServer || {}),
          devMiddleware: {
            writeToDisk: true, // Write bundle and source map files to disk
          },
        };
      }
        */
    return config;
}
