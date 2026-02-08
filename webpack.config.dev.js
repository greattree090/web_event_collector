const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    WEB_EVENT_COLLECTOR: './src/index.js',
  },
  output: {
    filename: `web_event_collector.dev.js`,
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
    // new HtmlWebpackPlugin({
    //   template: "./test/404.html",
    //   filename: '404.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: "./test/about.html",
    //   filename: 'about.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: "./test/contact.html",
    //   filename: 'contact.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: "./test/feature.html",
    //   filename: 'feature.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: "./test/project.html",
    //   filename: 'project.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: "./test/quote.html",
    //   filename: 'quote.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: "./test/service.html",
    //   filename: 'service.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: "./test/team.html",
    //   filename: 'team.html'
    // }),
    // new HtmlWebpackPlugin({
    //   template: "./test/testimonial.html",
    //   filename: 'testimonial.html'
    // }),
    new webpack.DefinePlugin({
      PACKAGE_MODE: JSON.stringify("develop"),
    })
  ],
  devServer: {
    port: 8080,
    open: ['/index.html'],
    static: {
      directory: path.resolve(__dirname, 'test')
    }
  }
};
