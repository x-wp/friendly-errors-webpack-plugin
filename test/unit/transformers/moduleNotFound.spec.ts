import moduleNotFound from '../../../src/transformers/moduleNotFound';
import { annotatedError } from '../../helpers';

describe('moduleNotFound transformer', () => {
  it('annotates with severity, type, name, and the missing module from webpackError.dependencies', () => {
    const err = annotatedError({
      name: 'ModuleNotFoundError',
      message: 'Module not found: redux',
      webpackError: {
        message: 'Module not found: redux',
        dependencies: [{ request: 'redux' }],
      },
    });
    expect(moduleNotFound(err)).toMatchObject({
      severity: 900,
      type: 'module-not-found',
      module: 'redux',
      name: 'Module not found',
      message: 'Module not found redux',
    });
  });

  it('falls back to parsing the resolver message when dependencies is empty (webpack 5 path)', () => {
    const err = annotatedError({
      name: 'ModuleNotFoundError',
      message: "Module not found: Error: Can't resolve 'react' in '/some/path'",
      webpackError: {
        message: "Module not found: Error: Can't resolve 'react' in '/some/path'",
      },
    });
    expect(moduleNotFound(err).module).toBe('react');
  });

  it('passes through unrecognized errors unchanged', () => {
    const err = annotatedError({ name: 'OtherError' });
    expect(moduleNotFound(err)).toEqual(err);
  });
});
