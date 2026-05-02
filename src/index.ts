'use strict';

import FriendlyErrorsWebpackPlugin = require('./friendly-errors-plugin');

// Preserve the dual CJS/ESM export shape the v1.x JS entry shipped with —
// `require('@soda/friendly-errors-webpack-plugin')` returns the class and
// `require('@soda/friendly-errors-webpack-plugin').default` also returns it,
// so consumers using `import X from '...'` (esModuleInterop: false) keep working.
(FriendlyErrorsWebpackPlugin as any).default = FriendlyErrorsWebpackPlugin;

export = FriendlyErrorsWebpackPlugin;
