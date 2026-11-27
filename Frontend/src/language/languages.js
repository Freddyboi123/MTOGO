export const LANGUAGES = ['da', 'en'];
export const DEFAULT_LANGUAGE = 'da';
const STORAGE_KEY = 'language';

export function readLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function saveLanguage(language) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    return;
  }
}

export function pickTexts(texts, language) {
  return texts[language] ?? texts[DEFAULT_LANGUAGE];
}
