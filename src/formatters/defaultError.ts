'use strict';

import { concat } from '../utils';
import { formatTitle } from '../utils/colors';
import type { AnnotatedError, ErrorSeverity, Formatter } from '../types';

function displayError(severity: ErrorSeverity | string, error: AnnotatedError): string[] {
  const baseError = formatTitle(severity, severity);

  return concat<string>(
    `${baseError} ${removeLoaders(error.file)}`,
    '',
    error.message,
    error.origin ? error.origin : undefined,
    '',
    error.infos
  );
}

function removeLoaders(file: string | undefined): string {
  if (!file) {
    return '';
  }
  const split = file.split('!');
  const filePath = split[split.length - 1];
  return `in ${filePath}`;
}

function isDefaultError(error: AnnotatedError): boolean {
  return !error.type;
}

/**
 * Format errors without a type
 */
const format: Formatter = (errors, type = 'error') => {
  return errors
    .filter(isDefaultError)
    .reduce<string[]>((accum, error) => accum.concat(displayError(type, error)), []);
};

export = format;
