import { afterEach, describe, expect, it } from 'vitest';
import { pickTexts, readLanguage, saveLanguage } from './languages';

const texts = { da: { hello: 'Hej' }, en: { hello: 'Hello' } };

describe('languages', () => {
  afterEach(() => localStorage.clear());

  it('uses Danish when nothing is saved', () => {
    expect(readLanguage()).toBe('da');
  });

  it('remembers the chosen language', () => {
    saveLanguage('en');
    expect(readLanguage()).toBe('en');
  });

  it('ignores an unknown saved language', () => {
    localStorage.setItem('language', 'fr');
    expect(readLanguage()).toBe('da');
  });

  it('picks the texts for the language', () => {
    expect(pickTexts(texts, 'en').hello).toBe('Hello');
  });

  it('falls back to Danish texts when a language is missing', () => {
    expect(pickTexts(texts, 'fr').hello).toBe('Hej');
  });
});
