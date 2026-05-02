import moduleNotFound from '../../../src/formatters/moduleNotFound';
import { annotatedError } from '../../helpers';

const mnf = (over: { module: string; file?: string }) =>
  annotatedError({ type: 'module-not-found', ...over });

describe('moduleNotFound formatter — bare modules', () => {
  it('formats one missing dependency with an install hint', () => {
    expect(moduleNotFound([mnf({ module: 'redux' })])).toEqual([
      'This dependency was not found:',
      '',
      '* redux',
      '',
      'To install it, you can run: npm install --save redux',
    ]);
  });

  it('groups multiple dependencies under one header and one install hint', () => {
    expect(
      moduleNotFound([mnf({ module: 'redux' }), mnf({ module: 'react' })])
    ).toEqual([
      'These dependencies were not found:',
      '',
      '* redux',
      '* react',
      '',
      'To install them, you can run: npm install --save redux react',
    ]);
  });

  it('groups identical missing modules and lists their callers', () => {
    expect(
      moduleNotFound([
        mnf({ module: 'react', file: './a.js' }),
        mnf({ module: 'react', file: './b.js' }),
      ])
    ).toEqual([
      'This dependency was not found:',
      '',
      '* react in ./a.js, ./b.js',
      '',
      'To install it, you can run: npm install --save react',
    ]);
  });

  it('truncates the caller list past two files with " and N other(s)"', () => {
    const threeCallers = [
      mnf({ module: 'react', file: './a.js' }),
      mnf({ module: 'react', file: './b.js' }),
      mnf({ module: 'react', file: './c.js' }),
    ];
    expect(moduleNotFound(threeCallers)).toContainEqual(
      '* react in ./a.js, ./b.js and 1 other'
    );

    const fourCallers = [...threeCallers, mnf({ module: 'react', file: './d.js' })];
    expect(moduleNotFound(fourCallers)).toContainEqual(
      '* react in ./a.js, ./b.js and 2 others'
    );
  });
});

describe('moduleNotFound formatter — relative modules', () => {
  it('formats a missing relative module under a separate header (no install hint)', () => {
    expect(moduleNotFound([mnf({ module: './missing.js' })])).toEqual([
      'This relative module was not found:',
      '',
      '* ./missing.js',
    ]);
  });

  it('separates relative modules from bare-package dependencies in the same run', () => {
    const out = moduleNotFound([
      mnf({ module: 'redux' }),
      mnf({ module: './nope.js' }),
    ]);
    expect(out).toContain('This dependency was not found:');
    expect(out).toContain('This relative module was not found:');
  });
});

it('skips errors of other types', () => {
  expect(moduleNotFound([annotatedError({ type: 'lint-error' })])).toEqual([]);
});
