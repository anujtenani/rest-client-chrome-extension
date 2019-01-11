const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: {
        'bundle.js': [
            path.resolve(__dirname, 'chrome/index.js')
        ]
    },
    output: {
        filename: 'background.js',
        path: path.resolve(__dirname,'build-chrome'),
    },

    optimization: {
        minimize: false
    },

    plugins: [
        new CopyWebpackPlugin([
            {from: path.resolve(__dirname, 'chrome/manifest.json'), to: path.resolve(__dirname, 'build-chrome')},
            {from: path.resolve(__dirname, 'images/'), to: path.resolve(__dirname, 'build-chrome/images')},
            {from: path.resolve(__dirname, 'test.html'), to: path.resolve(__dirname, 'build-chrome/test.html')},
            {from: path.resolve(__dirname, 'test.js'), to: path.resolve(__dirname, 'build-chrome/test.js')}

        ])
    ],
   // devtool: 'source-map'
};
