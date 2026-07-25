/**
 * Smoke test kept intentionally light: rendering <App /> boots navigation,
 * react-query and the Supabase auth listener, which needs more mocks than
 * this stage of the project justifies. Unit tests live next to this file.
 *
 * @format
 */
import {formatMinutes, formatXp, pluralize} from '../src/utils/format';

describe('formatters', () => {
  it('formats minutes below and above an hour', () => {
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(60)).toBe('1 h');
    expect(formatMinutes(95)).toBe('1 h 35 min');
  });

  it('abbreviates large XP values', () => {
    expect(formatXp(940)).toBe('940');
    expect(formatXp(1000)).toBe('1k');
    expect(formatXp(1450)).toBe('1.5k');
  });

  it('pluralizes counts', () => {
    expect(pluralize(1, 'day')).toBe('1 day');
    expect(pluralize(3, 'day')).toBe('3 days');
  });
});
