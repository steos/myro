var path = require('path')
module.exports = {
    context: path.join(__dirname, "src"),
    entry: {
        javascript: "./index.js"
    },

    output: {
        filename: "myro.js",
        path: path.join(__dirname, "lib"),
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                  presets: ['es2015']
                }
            }
        ]
    }
};
