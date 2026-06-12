import en from "./messages/en.json";

export const DEFAULT_LOCALE = "en";
export const LOCALES = ["en"];

const CATALOGS = { en };

export function getMessages(locale = DEFAULT_LOCALE) {
  return CATALOGS[locale] ?? CATALOGS[DEFAULT_LOCALE];
}

function resolve(messages, key) {
  return key.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), messages);
}

export function translate(messages, key, params = {}) {
  const value = resolve(messages, key);
  if (typeof value !== "string") return key;
  return Object.entries(params).reduce((str, [k, v]) => str.replaceAll(`{${k}}`, String(v)), value);
}
