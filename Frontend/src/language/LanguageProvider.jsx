import { useEffect, useState } from 'react';
import { LanguageContext } from './LanguageContext';
import { DEFAULT_LANGUAGE, readLanguage, saveLanguage } from './languages';
import useFeatureFlag from '../featureFlags/useFeatureFlag';

export default function LanguageProvider({ children }) {
  const languageChoice = useFeatureFlag('languageChoice');
  const [chosen, setChosen] = useState(readLanguage);
  const language = languageChoice ? chosen : DEFAULT_LANGUAGE;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(next) {
    setChosen(next);
    saveLanguage(next);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
  );
}
