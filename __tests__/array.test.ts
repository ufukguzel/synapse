import {shuffle} from '../src/utils/array';

describe('shuffle', () => {
  it('returns a permutation without touching the input', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);

    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it('is deterministic when the random source is', () => {
    const alwaysZero = () => 0;
    expect(shuffle(['a', 'b', 'c'], alwaysZero)).toEqual(['b', 'c', 'a']);
  });

  it('handles empty and single-item arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(['only'])).toEqual(['only']);
  });
});
