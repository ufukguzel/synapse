import {editDistance, isAnswerCorrect, levenshtein, normalizeAnswer} from '../src/utils/answer';

describe('normalizeAnswer', () => {
  it('ignores case, punctuation and extra spaces', () => {
    expect(normalizeAnswer('  Hello, World!  ')).toBe('hello world');
  });

  it('strips apostrophes so contractions compare equal', () => {
    expect(normalizeAnswer("it's")).toBe(normalizeAnswer('its'));
  });

  it('collapses runs of whitespace to a single space', () => {
    expect(normalizeAnswer('a\t b\n  c')).toBe('a b c');
  });
});

describe('editDistance', () => {
  it('is zero for identical strings', () => {
    expect(editDistance('same', 'same')).toBe(0);
  });

  it('counts a substitution as one', () => {
    expect(editDistance('cat', 'cut')).toBe(1);
  });

  it('counts an adjacent transposition as one, not two', () => {
    expect(editDistance('receive', 'recieve')).toBe(1);
  });

  it('equals the other string length when one is empty', () => {
    expect(editDistance('', 'abc')).toBe(3);
    expect(editDistance('abc', '')).toBe(3);
  });

  it('exposes levenshtein as an alias', () => {
    expect(levenshtein).toBe(editDistance);
  });
});

describe('isAnswerCorrect', () => {
  it('accepts an exact match ignoring case and punctuation', () => {
    expect(isAnswerCorrect('Good Morning!', ['good morning'])).toBe(true);
  });

  it('accepts a single typo on a longer word', () => {
    expect(isAnswerCorrect('recieve', ['receive'])).toBe(true);
  });

  it('rejects clearly wrong answers', () => {
    expect(isAnswerCorrect('banana', ['receive'])).toBe(false);
  });

  it('gives short words (<= 4 chars) no typo tolerance', () => {
    // One edit apart, but too short to forgive — otherwise "cat" == "cut".
    expect(isAnswerCorrect('cut', ['cat'])).toBe(false);
    expect(isAnswerCorrect('cat', ['cat'])).toBe(true);
  });

  it('matches any of several accepted answers (translation)', () => {
    const accepted = ['hello, my name is ayse', 'hi, my name is ayse'];
    expect(isAnswerCorrect('Hi my name is Ayse', accepted)).toBe(true);
  });

  it('honours a wider tolerance when asked (listen_type)', () => {
    expect(isAnswerCorrect('wold', ['world'], 1)).toBe(true); // 1 edit
    expect(isAnswerCorrect('wrld', ['world'], 1)).toBe(true); // 1 deletion
    expect(isAnswerCorrect('wold', ['worlds'], 1)).toBe(false); // 2 edits, tol 1
    expect(isAnswerCorrect('wold', ['worlds'], 2)).toBe(true); // 2 edits, tol 2
  });

  it('treats whitespace and casing differences as equal', () => {
    expect(isAnswerCorrect('  NICE   to  meet you ', ['nice to meet you'])).toBe(true);
  });

  it('rejects an empty answer against a non-empty target', () => {
    expect(isAnswerCorrect('', ['hello'])).toBe(false);
  });
});
