import formatErrors from '../../../src/core/formatErrors';
import type { AnnotatedError, Formatter } from '../../../src/types';
import { annotatedError } from '../../helpers';

const simple: Formatter = (errors) => errors.filter((e) => !e.type).map((e) => e.message);
const allCaps: Formatter = (errors) =>
  errors.filter((e) => e.type === 'other').map((e) => e.message.toUpperCase());
const notFound: Formatter = (errors) =>
  errors.filter((e) => e.type === 'not-found').map(() => 'Not found');

describe('formatErrors', () => {
  it('runs every formatter against the full error list and concatenates the results', () => {
    const errors: AnnotatedError[] = [
      annotatedError({ message: 'Error 1' }),
      annotatedError({ message: 'Error 2', type: 'other' }),
      annotatedError({ message: 'Error 3', type: 'not-found' }),
    ];
    expect(formatErrors(errors, [simple, allCaps, notFound], 'error')).toEqual([
      'Error 1',
      'ERROR 2',
      'Not found',
    ]);
  });

  it('treats a falsy formatter return as empty', () => {
    const skipping: Formatter = () => undefined;
    const lines: Formatter = () => ['hello'];
    expect(formatErrors([], [skipping, lines], 'error')).toEqual(['hello']);
  });
});
