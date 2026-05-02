
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
  ]
};