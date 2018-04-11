const webpack = require('webpack')
const serverConfig = require('./webpack.server.config')
const clientConfig = require('./webpack.client.config')
const MFS = require('memory-fs')
const path = require('path')
const fs = require('fs')
const middleware = require('webpack-dev-middleware')

module.exports = (app, templatePath, callback) => {
    let bundle
    let clientManifest
    let ready

    const readyPromise = new Promise((resolve, reject) => {
        ready = resolve
    })

    const update = () => {
        if (bundle && clientManifest) {
            ready()
            
            callback(bundle, {
                template: templatePath,
                clientManifest
            })
        }
    }

    /**
     * Client stuff
     */
    clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
    clientConfig.output.filename = '[name].js'
    clientConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin()
    )

    const clientCompiler = webpack(clientConfig)

    const developmentMiddleware = middleware(clientCompiler, {
        publicPath: clientConfig.output.publicPath
    })

    app.use(developmentMiddleware)

    clientCompiler.plugin('done', () => {
        clientManifest = JSON.parse(
            developmentMiddleware.fileSystem.readFileSync(path.join(clientConfig.output.path, 'vue-ssr-client-manifest.json'), 'utf-8')
        )

        update()
    })

    app.use(require('webpack-hot-middleware')(clientCompiler, { heartbeat: 5000 }))

    /**
     * Server stuff
     */

    const mfs = new MFS()
    const serverCompiler = webpack(serverConfig)

    serverCompiler.outputFileSystem = mfs

    serverCompiler.watch({}, () => {
        bundle = JSON.parse(
            mfs.readFileSync(path.join(clientConfig.output.path, 'vue-ssr-server-bundle.json'), 'utf-8')
        )

        update()
    })

    return readyPromise
}
