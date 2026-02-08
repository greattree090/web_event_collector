const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // devtool: 'source-map',
  entry: {
    WEB_EVENT_COLLECTOR: './src/index.js',
  },
  output: {
    filename: `web_event_collector.min.js`,
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        },
      },
      // {
      //   test: /\.css$/,
      //   use: ["style-loader", "css-loader"] 
      // }
    ]
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: "./test/index.html",
    //   filename: 'index.html'
    // }),
    new webpack.DefinePlugin({
      PACKAGE_MODE: JSON.stringify("production"),
    })
  ]
};
