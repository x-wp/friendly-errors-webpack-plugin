import stripAnsi from 'strip-ansi';
import defaultError from '../../../src/formatters/defaultError';
import { annotatedError } from '../../helpers';

const noColor = (lines: string[] | null | undefined | false) =>
  (lines || []).map(stripAnsi);

describe('defaultError formatter', () => {
  it('formats untyped errors as title + file + message + trailing blank', () => {
    const out = noColor(defaultError(
      [annotatedError({ message: 'Error message', file: './src/index.js' })],
      'warning'
    ));
    expect(out).toEqual([
      ' warning  in ./src/index.js',
      '',
      'Error message',
      '',
    ]);
  });

  it('appends origin lines when present', () => {
    const out = noColor(defaultError(
      [annotatedError({ message: 'msg', file: './x.js', origin: '\n @ ./entry.js' })],
      'error'
    ));
    expect(out).toContain('\n @ ./entry.js');
  });

  it('strips loader prefixes from the displayed file path', () => {
    const out = noColor(defaultError(
      [annotatedError({ message: 'msg', file: '!!css-loader!./src/styles.css' })],
      'error'
    ));
    expect(out[0]).toBe(' error  in ./src/styles.css');
  });

  it('skips errors that already have a type (other formatters claim them)', () => {
    expect(defaultError([annotatedError({ type: 'lint-error' })], 'error')).toEqual([]);
  });
});
