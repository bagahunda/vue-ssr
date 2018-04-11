const merge = require('webpack-merge')
const base = require('./webpack.base.config')
const webpack = require('webpack')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = merge(base, {
    entry: {
        app: './src/main.js'
    },
    plugins: [
        new VueSSRClientPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': "'client'"
        })
    ]
})