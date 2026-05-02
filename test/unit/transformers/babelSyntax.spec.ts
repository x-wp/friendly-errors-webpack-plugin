import babelSyntax from '../../../src/transformers/babelSyntax';
import { annotatedError } from '../../helpers';

describe('babelSyntax transformer', () => {
  it('promotes ModuleBuildError to severity 1000 and renames to "Syntax Error"', () => {
    const out = babelSyntax(annotatedError({
      name: 'ModuleBuildError',
      message: 'SyntaxError',
    }));
    expect(out.severity).toBe(1000);
    expect(out.name).toBe('Syntax Error');
  });

  it('strips the "Module build failed (...): " prefix from the message', () => {
    const out = babelSyntax(annotatedError({
      name: 'ModuleBuildError',
      message: 'Module build failed (from ./node_modules/babel-loader/index.js): Unexpected token',
    }));
    expect(out.message).toMatch(/^Syntax Error: Unexpected token/);
  });

  it('does not set type — defaultError formatter handles syntax errors', () => {
    const out = babelSyntax(annotatedError({ name: 'ModuleBuildError', message: 'x' }));
    expect(out.type).toBeUndefined();
  });

  it('passes through unrecognized errors unchanged', () => {
    const err = annotatedError({ name: 'OtherError' });
    expect(babelSyntax(err)).toEqual(err);
  });
});
