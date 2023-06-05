import * as en from './en.json';
import * as ru from './ru.json';

const translations: Record<string, any> = {
  en: en,
  ru: ru,
};

function translateString(string: string, translatedStrings: string | Record<string, any>): string | undefined {
  if (typeof translatedStrings === 'string') {
    return translatedStrings;
  }
  const splitted = string.split('.');
  const [key, ...otherKeys] = splitted;

  const translated = translatedStrings[key];
  if (!translated || typeof translated === 'string') {
    return translated;
  }

  return translateString(otherKeys && otherKeys.length > 0 ? otherKeys.join('.') : '', translated);
}

function language(): string {
  let lang: string | null | undefined = localStorage.getItem('selectedLanguage')?.replace(/['"]+/g, '').replace('-', '_');
  if (lang === 'null') {
    lang = undefined;
  }
  if (!lang) {
    lang = localStorage.getItem('i18nextLng');
  }
  if (!lang || lang === 'null') {
    lang = 'en';
  }
  return lang;
}

export function t(string: string, search = '', replace = ''): string {
  const lang = language();

  let translatedStrings;
  try {
    translatedStrings = { ...translations[lang] };
  } catch (e) {
    translatedStrings = { ...translations['en'] };
  }

  let translated = translateString(string, translatedStrings);
  if (translated === undefined) {
    translated = translateString(string, { ...translations['en'] });
  }

  if (translated && search !== '' && replace !== '') {
    translated = translated.replace(`{${search}}`, replace);
  }
  return translated ?? '';
}
