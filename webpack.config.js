const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './client/src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'client/dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/index.html',
      title: 'IronClash - Tank Battle',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: 'client/assets', 
          to: 'assets',
          noErrorOnMissing: true 
        }
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'client/dist'),
    },
    compress: true,
    port: 8080,
    hot: true,
  },
};
