'use strict';

import extractError from './extractWebpackError';
import type { AnnotatedError, RawWebpackError, Transformer } from '../types';

/**
 * Applies all transformers to all errors and returns "annotated" errors.
 *
 * Each transformer should have the signature: AnnotatedError => AnnotatedError.
 *
 * The plugin will only display errors having maximum severity at the same time.
 * If they don't have a 'type' field, they will be handled by the default formatter.
 */
function processErrors(
  errors: RawWebpackError[],
  transformers: Transformer[]
): AnnotatedError[] {
  const transform = (error: AnnotatedError, transformer: Transformer) => transformer(error);
  const applyTransformations = (error: AnnotatedError) => transformers.reduce(transform, error);

  return errors.map(extractError).map(applyTransformations);
}

export = processErrors;
