/* eslint-env node */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname),
  entry: { app: './src/md-template/app.js' },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://localhost:8080',
  },
  devServer: { host: '0.0.0.0', port: '8080', disableHostCheck: true },
  stats: {
    colors: true,
    modules: true,
    reasons: true,
    errorDetails: true,
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [path.resolve(__dirname, 'node_modules')],
        query: { presets: ['env'] },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/md-template/index.html' },
      { from: 'src/md-template/app.html' },
      { from: 'src/md-template/app.css' },
      { from: 'src/md-template/resources/', to: 'resources/' },
    ]),
  ],
};
