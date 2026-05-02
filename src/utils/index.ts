'use strict';

/**
 * Concat and flattens non-null values.
 * Ex: concat(1, undefined, 2, [3, 4]) = [1, 2, 3, 4]
 */
export function concat<T = unknown>(
  ...args: Array<T | T[] | null | undefined>
): T[] {
  const filtered = args.filter((e): e is T | T[] => e != null);
  const baseArray: T[] = Array.isArray(filtered[0])
    ? filtered[0]
    : ([filtered[0] as T]);
  return baseArray.concat(...(filtered.slice(1) as Array<T | T[]>));
}

/**
 * Dedupes array based on criterion returned from iteratee function.
 * Ex: uniqueBy([{ id: 1 }, { id: 1 }, { id: 2 }], v => v.id)
 *   = [{ id: 1 }, { id: 2 }]
 */
export function uniqueBy<T, K>(arr: T[], fun: (item: T) => K): T[] {
  const seen = new Set<K>();
  return arr.filter((el) => {
    const key = fun(el);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
