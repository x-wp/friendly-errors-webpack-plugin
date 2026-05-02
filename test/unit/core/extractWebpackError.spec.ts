import path from 'path';
import extractError from '../../../src/core/extractWebpackError';
import { rawError } from '../../helpers';

describe('extractWebpackError — file resolution', () => {
  it('uses e.file directly when set', () => {
    expect(extractError(rawError({ message: 'err', file: './src/index.js' })).file)
      .toBe('./src/index.js');
  });

  it('falls back to module.readableIdentifier with a cwd-stripping shortener', () => {
    const cwd = process.cwd();
    const out = extractError(rawError({
      message: 'err',
      module: {
        readableIdentifier(s: { shorten: (request: string) => string }) {
          return s.shorten(path.join(cwd, 'src', 'foo.js'));
        },
      },
    }));
    expect(out.file).toBe('./src/foo.js');
  });

  it('normalizes path separators to forward slashes', () => {
    const cwd = process.cwd();
    const out = extractError(rawError({
      message: 'err',
      module: {
        readableIdentifier(s: { shorten: (request: string) => string }) {
          return s.shorten(cwd + path.sep + 'a' + path.sep + 'b.js');
        },
      },
    }));
    expect(out.file).toBe('./a/b.js');
  });

  it('returns undefined when there is no file or module', () => {
    expect(extractError(rawError({ message: 'err' })).file).toBeUndefined();
  });
});

describe('extractWebpackError — origin', () => {
  it('returns "" when there are no dependencies', () => {
    expect(extractError(rawError({ message: 'err' })).origin).toBe('');
  });
});

describe('extractWebpackError — output shape', () => {
  it('initializes severity to 0 (transformers raise it)', () => {
    expect(extractError(rawError({ message: 'x' })).severity).toBe(0);
  });

  it('passes the original webpack error through on .webpackError', () => {
    const original = rawError({ message: 'oops', name: 'X' });
    expect(extractError(original).webpackError).toBe(original);
  });

  it('returns [] for originalStack when the error has no stack', () => {
    expect(extractError(rawError({ message: 'x' })).originalStack).toEqual([]);
  });
});
