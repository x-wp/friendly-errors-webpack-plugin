'use strict';

import type { AnnotatedError, Transformer } from '../types';

/**
 * This will be removed in next versions as it is not handled in the babel-loader
 * See: https://github.com/geowarin/friendly-errors-webpack-plugin/issues/2
 */
function cleanStackTrace(message: string): string {
  return message.replace(/^\s*at\s.*:\d+:\d+[\s)]*\n/gm, '');
}

function cleanMessage(message: string): string {
  return message
    // match until the last semicolon followed by a space
    // linux  : "(SyntaxError: )Unexpected token (5:11)"
    // windows: "(SyntaxError: C:/projects/index.js: )Unexpected token (5:11)"
    .replace(/^Module build failed.*:\s/, 'Syntax Error: ')
    // remove mini-css-extract-plugin loader tracing errors
    .replace(/^Syntax Error: ModuleBuildError:.*:\s/, '')
    // remove babel extra wording and path
    .replace(/^Syntax Error: SyntaxError: (([A-Z]:)?\/.*:\s)?/, 'Syntax Error: ');
}

function isBabelSyntaxError(e: AnnotatedError): boolean {
  return e.name === 'ModuleBuildError' || (e.name === 'ModuleBuildError'
    && typeof e.message === 'string' && e.message.indexOf('SyntaxError') >= 0);
}

const transform: Transformer = (error) => {
  if (isBabelSyntaxError(error)) {
    return Object.assign({}, error, {
      message: cleanStackTrace(cleanMessage(error.message) + '\n'),
      severity: 1000,
      name: 'Syntax Error',
    });
  }
  return error;
};

export = transform;
