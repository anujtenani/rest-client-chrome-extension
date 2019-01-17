const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin'); //installed via npm

let pathsToClean = [
    'build-firefox'
]
module.exports = {
    entry: {
        'bundle.js': [
            path.resolve(__dirname, 'firefox/index.js')
        ]
    },
    output: {
        filename: 'background.js',
        path: path.resolve(__dirname,'build-firefox'),
    },
    plugins: [
        new CleanWebpackPlugin(pathsToClean),
        new CopyWebpackPlugin([
            {from: path.resolve(__dirname, 'firefox/manifest.json'), to: path.resolve(__dirname, 'build-firefox')},
            {from: path.resolve(__dirname, 'firefox/content-script.js'), to: path.resolve(__dirname, 'build-firefox')},
            {from: path.resolve(__dirname, 'images/'), to: path.resolve(__dirname, 'build-firefox/images')}
        ])
    ],
    //devtool: 'source-map'
};
