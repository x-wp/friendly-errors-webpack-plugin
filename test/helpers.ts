import type { AnnotatedError, RawWebpackError } from '../src/types';

/** Build a complete AnnotatedError with sane defaults; pass overrides per test. */
export function annotatedError(over: Partial<AnnotatedError> = {}): AnnotatedError {
  return {
    message: '',
    file: undefined,
    origin: '',
    name: undefined,
    severity: 0,
    webpackError: { message: '' },
    originalStack: [],
    ...over,
  };
}

/** Build a RawWebpackError (the webpack-side input to extractWebpackError). */
export function rawError(over: Partial<RawWebpackError> = {}): RawWebpackError {
  return { message: '', ...over };
}
