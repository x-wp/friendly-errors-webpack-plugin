const FriendlyErrorsWebpackPlugin = require('../index');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: __dirname + '/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new ESLintPlugin({
      context: __dirname,
      files: '*.js',
    }),
  ],
};
