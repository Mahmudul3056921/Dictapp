// src/context/LanguageContext.tsx
import React, { createContext, useState, useContext } from "react";

export type Language =
  | "bangla"
  | "english"
  | "hindi"
  | "urdu"
  | "tamil"
  | "malayalam"
  | "nepali"
  | "arabic";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "english",
  setLanguage: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("english"); // default = bangla

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 🔹 helper hook (optional, just for convenience)
export const useLanguage = () => useContext(LanguageContext);

export { LanguageContext };
