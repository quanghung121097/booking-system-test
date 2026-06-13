import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';
import { registerApiErrorTranslator } from '../utils/apiErrors';

const I18nContext = createContext(null);

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function interpolate(template, params = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] ?? '');
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(
    () => localStorage.getItem('locale') || 'vi',
  );

  const setLocale = useCallback((next) => {
    setLocaleState(next);
    localStorage.setItem('locale', next);
  }, []);

  const t = useCallback(
    (key, params) => {
      const value =
        getNested(translations[locale], key) ??
        getNested(translations.vi, key) ??
        key;
      return typeof value === 'string' ? interpolate(value, params) : key;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  registerApiErrorTranslator(t);

  useEffect(() => () => registerApiErrorTranslator(null), []);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}
