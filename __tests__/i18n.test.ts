import {en} from '@/i18n/en';
import {tr} from '@/i18n/tr';
import {
  DEFAULT_LOCALE,
  formatDuration,
  resolveLocale,
  translate,
  translateCount,
} from '@/i18n';

describe('i18n dictionaries', () => {
  it('translates every English key in Turkish', () => {
    const missing = (Object.keys(en) as (keyof typeof en)[]).filter(key => !tr[key]);
    expect(missing).toEqual([]);
  });

  it('has no extra Turkish keys the English source does not define', () => {
    const extra = Object.keys(tr).filter(key => !(key in en));
    expect(extra).toEqual([]);
  });
});

describe('translate', () => {
  it('returns the locale string for a known key', () => {
    expect(translate('en', 'welcome.getStarted')).toBe('Get started');
    expect(translate('tr', 'welcome.getStarted')).toBe('Başla');
  });

  it('fills brace tokens from params', () => {
    expect(translate('en', 'home.greetingNamed', {greeting: 'Good evening', name: 'Eda'})).toBe(
      'Good evening, Eda',
    );
  });

  it('leaves unknown tokens untouched rather than printing undefined', () => {
    expect(translate('en', 'home.greetingNamed', {greeting: 'Hi'})).toBe('Hi, {name}');
  });
});

describe('translateCount', () => {
  it('uses the singular only at exactly one in English', () => {
    expect(translateCount('en', 'practice.reviewWords', 1)).toBe('Review 1 word');
    expect(translateCount('en', 'practice.reviewWords', 5)).toBe('Review 5 words');
  });

  it('keeps a single form in Turkish', () => {
    expect(translateCount('tr', 'practice.reviewWords', 1)).toBe('1 kelime tekrar et');
    expect(translateCount('tr', 'practice.reviewWords', 5)).toBe('5 kelime tekrar et');
  });
});

describe('formatDuration', () => {
  it('formats minutes, hours and mixed values per locale', () => {
    expect(formatDuration('en', 45)).toBe('45 min');
    expect(formatDuration('en', 60)).toBe('1 h');
    expect(formatDuration('en', 90)).toBe('1 h 30 min');
    expect(formatDuration('tr', 45)).toBe('45 dk');
    expect(formatDuration('tr', 90)).toBe('1 sa 30 dk');
  });
});

describe('resolveLocale', () => {
  it('passes through supported locales and defaults the rest', () => {
    expect(resolveLocale('en')).toBe('en');
    expect(resolveLocale('tr')).toBe('tr');
    expect(resolveLocale('de')).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
  });
});
