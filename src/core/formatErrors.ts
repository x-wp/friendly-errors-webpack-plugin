'use strict';

import type { AnnotatedError, ErrorSeverity, Formatter } from '../types';

/**
 * Applies formatters to all AnnotatedErrors and returns the flattened log lines.
 */
function formatErrors(
  errors: AnnotatedError[],
  formatters: Formatter[],
  errorType: ErrorSeverity | string
): string[] {
  const format = (formatter: Formatter): string[] =>
    (formatter(errors, errorType) || []) as string[];
  const flatten = (accum: string[], curr: string[]): string[] => accum.concat(curr);

  return formatters.map(format).reduce(flatten, []);
}

export = formatErrors;
