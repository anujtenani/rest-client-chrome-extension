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
    plugins: [
        new CopyWebpackPlugin([{from: path.resolve(__dirname, 'manifest.json'), to: path.resolve(__dirname, 'build-chrome')}])
    ]
};
