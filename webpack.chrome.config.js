const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin'); //installed via npm
let pathsToClean = [
    'build-chrome'
]
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
        new CleanWebpackPlugin(pathsToClean),
        new CopyWebpackPlugin([
            {from: path.resolve(__dirname, 'chrome/'), to: path.resolve(__dirname, 'build-chrome'), ignore:["index.js", "test.js"]},
            {from: path.resolve(__dirname, 'images/'), to: path.resolve(__dirname, 'build-chrome/images'), ignore:['.DS_Store']},
       //     {from: path.join(__dirname,'..','frontend','build/'), to: path.resolve(__dirname, 'build-chrome'),ignore:['.DS_Store','*.js.map']},
        ])
    ],
    //devtool: 'source-map'
};
