import useLanguage from './useLanguage';
import { pickTexts } from './languages';

export default function useTexts(texts) {
  const { language } = useLanguage();
  return pickTexts(texts, language);
}
