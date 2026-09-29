import React, { createContext, useContext, useState } from 'react';

export type Language = 'English' | 'हिंदी' | 'मराठी';
const copy = {
  English: { greeting: 'Good morning, Savita', screen: 'Start screening', patients: 'My mothers', offline: 'Working offline', urgent: 'Urgent cases', due: 'Follow-ups due' },
  हिंदी: { greeting: 'सुप्रभात, सविता', screen: 'जाँच शुरू करें', patients: 'मेरी माताएँ', offline: 'ऑफलाइन काम कर रहा है', urgent: 'तत्काल मामले', due: 'फॉलो-अप बाकी' },
  मराठी: { greeting: 'शुभ सकाळ, सविता', screen: 'तपासणी सुरू करा', patients: 'माझ्या माता', offline: 'ऑफलाइन कार्यरत', urgent: 'तातडीची प्रकरणे', due: 'पाठपुरावा बाकी' },
};
const LanguageContext = createContext<any>(undefined);
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('English');
  return <LanguageContext.Provider value={{ language, setLanguage, t: copy[language] }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error('Language provider missing'); return value; }
