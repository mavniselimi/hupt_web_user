/**
 * Tiny hook that exposes the translate function and detected language.
 * Deliberately non-reactive — language is detected once at page load.
 */
import { t, lang } from './index'

export function useT() {
  return { t, lang }
}
