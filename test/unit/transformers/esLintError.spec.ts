import esLintError from '../../../src/transformers/esLintError';
import { annotatedError } from '../../helpers';

describe('esLintError transformer', () => {
  it('matches by error name (eslint-webpack-plugin@4 emits ESLintError)', () => {
    const out = esLintError(
      annotatedError({ name: 'ESLintError', message: 'no-unused-vars: foo' })
    );
    expect(out.type).toBe('lint-error');
    expect(out.name).toBe('Lint error');
  });

  it('matches by stack frame (legacy eslint-loader path)', () => {
    const out = esLintError(annotatedError({
      name: 'Other',
      originalStack: [
        { fileName: '/path/to/eslint-loader/index.js' } as any,
      ],
    }));
    expect(out.type).toBe('lint-error');
  });

  it('passes through unrecognized errors unchanged', () => {
    const err = annotatedError({ name: 'OtherError', message: 'unrelated' });
    expect(esLintError(err)).toEqual(err);
  });

  it('does not mutate the input', () => {
    const err = annotatedError({ name: 'ESLintError' });
    const out = esLintError(err);
    expect(err.type).toBeUndefined();
    expect(out).not.toBe(err);
  });
});
