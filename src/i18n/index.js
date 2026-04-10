import en from '../locales/en.json'
import tr from '../locales/tr.json'
import de from '../locales/de.json'

const SUPPORTED = ['en', 'tr', 'de']
const FALLBACK = 'en'
const RESOURCES = { en, tr, de }

/** Detect browser language and resolve to a supported language code. */
function detectLang() {
  const langs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language || FALLBACK]

  for (const lang of langs) {
    const code = lang.split('-')[0].toLowerCase()
    if (SUPPORTED.includes(code)) return code
  }
  return FALLBACK
}

export const lang = detectLang()

/**
 * Translate a dot-separated key, with optional {{variable}} interpolation.
 * Falls back to English, then to the raw key if nothing is found.
 */
export function t(key, vars = {}) {
  let value =
    getDeep(RESOURCES[lang], key) ??
    getDeep(RESOURCES[FALLBACK], key) ??
    key

  if (typeof value === 'string' && Object.keys(vars).length) {
    value = value.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)
  }

  return typeof value === 'string' ? value : key
}

function getDeep(obj, path) {
  return path.split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), obj)
}
