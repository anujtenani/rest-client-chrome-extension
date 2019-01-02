const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: {
        'bundle.js': [
            path.resolve(__dirname, 'src/index.js')
        ]
    },
    output: {
        filename: 'background.js',
        path: path.resolve(__dirname,'build'),
    },
    plugins: [
        new CopyWebpackPlugin([{from: path.resolve(__dirname, 'manifest.json'), to: path.resolve(__dirname, 'build')}])
    ]
};
