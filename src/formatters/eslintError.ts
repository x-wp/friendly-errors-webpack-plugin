'use strict';

import chalk from 'chalk';
import { concat } from '../utils';
import type { AnnotatedError, Formatter } from '../types';

const infos: string[] = [
  'You may use special comments to disable some warnings.',
  'Use ' + chalk.yellow('// eslint-disable-next-line') + ' to ignore the next line.',
  'Use ' + chalk.yellow('/* eslint-disable */') + ' to ignore all warnings in a file.',
];

function displayError(error: AnnotatedError): string[] {
  return [error.message, ''];
}

const format: Formatter = (errors) => {
  const lintErrors = errors.filter((e) => e.type === 'lint-error');
  if (lintErrors.length > 0) {
    const flatten = (accum: string[], curr: string[]) => accum.concat(curr);
    return concat<string>(
      lintErrors.map(displayError).reduce(flatten, []),
      infos
    );
  }
  return [];
};

export = format;
