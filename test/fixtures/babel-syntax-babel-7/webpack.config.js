const FriendlyErrorsWebpackPlugin = require('../../../src/friendly-errors-plugin');

module.exports = {
  mode: 'development',
  entry: __dirname + "/index.js",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: require.resolve('babel-loader'),
      }
    ]
  },
};
