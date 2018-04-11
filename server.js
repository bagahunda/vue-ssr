const fs = require('fs')
const express = require('express')
const { createBundleRenderer } = require('vue-server-renderer')

const isProduction = process.env.NODE_ENV === 'production'

app = express()

let renderer
let devServerReady

const templatePath = fs.readFileSync('./index.html', 'utf-8')

if (isProduction) {
    const bundle = require('./dist/vue-ssr-server-bundle.json')

    renderer = createBundleRenderer(bundle, {
        basedir: './dist',
        template: templatePath,
        clientManifest: require('./dist/vue-ssr-client-manifest.json')
    })
} else {
    const devServer = require('./build/dev-server')

    devServerReady = devServer(app, templatePath, (bundle, options) => {
        renderer = createBundleRenderer(bundle, options)
    })
}

app.use('/dist', express.static('./dist'))

function render (request, response) {
    const context = {
        title: 'Codecourse',
        url: request.url
    }

    return renderer.renderToString(context, (err, html) => {
        response.send(html)
    })
}

app.get('*', (request, response) => {
    if (isProduction) {
        render(request, response)
    } else {
        devServerReady.then(() => {
           render(request, response)
        })
    }
})

app.listen(8080)