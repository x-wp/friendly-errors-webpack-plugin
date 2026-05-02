'use strict';

// The plugin source lives in src/*.ts and is compiled to dist/ by `npm run build`.
// webpack-g9x will switch the package's `main` directly to dist/index.js and
// drop this shim entirely. Until then, this preserves the existing
// `require('@soda/friendly-errors-webpack-plugin')` entry point against the
// built output.
const FriendlyErrorsWebpackPlugin = require('./dist/friendly-errors-plugin');

module.exports = FriendlyErrorsWebpackPlugin;
module.exports.default = FriendlyErrorsWebpackPlugin;
