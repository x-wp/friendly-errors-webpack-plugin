import stripAnsi from 'strip-ansi';
import eslintError from '../../../src/formatters/eslintError';
import { annotatedError } from '../../helpers';

const noColor = (lines: string[] | null | undefined | false) =>
  (lines || []).map(stripAnsi);

describe('eslintError formatter', () => {
  it('outputs each lint error message followed by a blank line and an eslint-disable footer', () => {
    const out = noColor(eslintError(
      [
        annotatedError({ type: 'lint-error', message: 'foo.js: no-unused-vars' }),
        annotatedError({ type: 'lint-error', message: 'bar.js: semi' }),
      ],
      'warning'
    ));

    expect(out.slice(0, 4)).toEqual([
      'foo.js: no-unused-vars',
      '',
      'bar.js: semi',
      '',
    ]);
    expect(out[4]).toContain('You may use special comments');
    expect(out[5]).toContain('eslint-disable-next-line');
    expect(out[6]).toContain('eslint-disable');
  });

  it('returns an empty array when no lint errors are present', () => {
    expect(eslintError([annotatedError({ type: 'module-not-found' })], 'warning')).toEqual([]);
  });
});
