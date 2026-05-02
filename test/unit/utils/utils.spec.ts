import { concat, uniqueBy } from '../../../src/utils';

describe('concat', () => {
  it('drops null and undefined values', () => {
    expect(concat<number | string>(1, undefined, '', null)).toEqual([1, '']);
  });

  it('flattens an array as the first non-nullish argument', () => {
    expect(concat<number>(1, [2, 3], null)).toEqual([1, 2, 3]);
  });
});

describe('uniqueBy', () => {
  it('keeps the first occurrence per criterion', () => {
    expect(
      uniqueBy([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 3 }], (val) => val.id)
    ).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });
});
