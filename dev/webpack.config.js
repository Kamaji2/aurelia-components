const { resolve } = require('path');
const { AureliaPlugin, ModuleDependenciesPlugin } = require('aurelia-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');
const webpack = require('webpack');
const pkg = require('./package.json');


module.exports = env => {
  dotenv.config({ path: resolve(__dirname, `./src/environments/${env.environment}.env`) });
  return {
    entry: { app: ['aurelia-bootstrapper'] },
    resolve: {
      modules: ['src', 'node_modules'],
      symlinks: false
    },
    output: {
      path: __dirname + '/build',
      publicPath: '/',
      filename: env.environment === 'development' ? '[name].[hash].bundle.js' : '[chunkhash].bundle.js',
      sourceMapFilename: env.environment === 'development' ? '[name].[hash].bundle.map' : '[chunkhash].bundle.map',
      chunkFilename: env.environment === 'development' ? '[name].[hash].chunk.js' : '[chunkhash].chunk.js',
    },
    devServer: {
      static: {
        directory: __dirname + '/dev'
      },
      historyApiFallback: true,
      compress: true,
      hot: false,
      https: process.env.APP_WEBPACK_HTTPS === "true",
      host: process.env.APP_WEBPACK_HOST || 'localhost',
      port: process.env.APP_WEBPACK_PORT || 2027
    },
    devtool: env.environment === 'development' ? 'eval-cheap-module-source-map' : 'nosources-source-map',
    optimization: {
      concatenateModules: false,
      moduleIds: 'size',
      splitChunks: {
        hidePathInfo: true,
        chunks: "async",
        maxSize: 200000
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/i,
          exclude: /node_modules/,
          use: [{ loader: 'babel-loader' }]
        }, {
          test: /\.css$/,
          use: [{ loader: 'css-loader' }],
          issuer: /\.html$/i
        }, {
          test: /\.css$/,
          use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
          issuer: { not: [/\.html$/i] }
        }, {
          test: /\.(sass|scss)$/,
          use: [{ loader: 'css-loader' }, { loader: 'sass-loader' }],
          issuer: /\.html$/i
        }, {
          test: /\.(sass|scss)$/,
          use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' }],
          issuer: { not: [/\.html$/i] }
        }, {
          test: /\.(html)$/i,
          use: [{ loader: 'html-loader', options: { sources: { urlFilter: (attr, value) => { return !(/^\/static/.test(value)); } } } }],
        }, {
          test: /\.(jpe?g|svg|png|gif|ico|eot|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
          type: 'asset/resource',
        }, {
          test: /\.js$/i,
          include: /node_modules\/aurelia-components/,
          exclude: /ckeditor/,
          use: [{ loader: 'babel-loader' }]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        ENVIRONMENT: JSON.stringify(process.env),
        VERSION: JSON.stringify(`${pkg.version} (${env.environment})`)
      }),
      new HtmlWebpackPlugin({
        template: 'src/index.html'
      }),
      new AureliaPlugin({
        aureliaApp: 'index'
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'static', to: 'static', globOptions: { ignore: ['.*', '*.sass'] } }
        ]
      })
    ]
  }
};
