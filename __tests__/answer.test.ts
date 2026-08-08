import {isAnswerCorrect, normalizeAnswer} from '../src/utils/answer';

describe('answer grading', () => {
  it('ignores case, punctuation and extra spaces', () => {
    expect(normalizeAnswer('  Hello, World!  ')).toBe('hello world');
  });

  it('accepts a single typo within tolerance', () => {
    expect(isAnswerCorrect('recieve', ['receive'])).toBe(true);
  });

  it('rejects clearly wrong answers', () => {
    expect(isAnswerCorrect('banana', ['receive'])).toBe(false);
  });
});
