'use strict';

import type { Transformer } from '../types';

const transform: Transformer = (error) => {
  if (isEslintError(error)) {
    return Object.assign({}, error, {
      name: 'Lint error',
      type: 'lint-error',
    });
  }
  return error;
};

function isEslintError(e: { originalStack?: { fileName?: string }[]; name?: string }): boolean {
  const hasEslintLoaderFrame = !!e.originalStack && e.originalStack.some(
    (stackframe) => !!stackframe.fileName && stackframe.fileName.indexOf('eslint-loader') > 0
  );
  return hasEslintLoaderFrame || e.name === 'ESLintError';
}

export = transform;
