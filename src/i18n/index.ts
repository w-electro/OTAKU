import en from './translations/en.json';
import ar from './translations/ar.json';

export const translations = {
  en,
  ar,
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = typeof en;

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K
      : never
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<TranslationKeys>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof value === 'string' ? value : path;
}

export function t(
  key: string,
  language: Language = 'en',
  params?: Record<string, string | number>
): string {
  const translation = getNestedValue(translations[language] as unknown as Record<string, unknown>, key);

  if (!params) return translation;

  return Object.entries(params).reduce((str, [paramKey, value]) => {
    return str.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
  }, translation);
}

export function useTranslation(language: Language = 'en') {
  return {
    t: (key: string, params?: Record<string, string | number>) => t(key, language, params),
    language,
    isRTL: language === 'ar',
    dir: language === 'ar' ? 'rtl' : 'ltr',
  };
}

export const isRTL = (language: Language): boolean => language === 'ar';

export const getDirection = (language: Language): 'rtl' | 'ltr' =>
  language === 'ar' ? 'rtl' : 'ltr';
