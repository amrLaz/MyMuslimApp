import type { CountryId } from "./countries";

/** Voix neuronales d'Azure Speech propres à chaque pays, toutes féminines pour que Lissan garde la même personnalité. */
export const VOICES: Record<CountryId, { locale: string; name: string }> = {
  ma: { locale: "ar-MA", name: "ar-MA-MounaNeural" },
  dz: { locale: "ar-DZ", name: "ar-DZ-AminaNeural" },
  tn: { locale: "ar-TN", name: "ar-TN-ReemNeural" },
};

export const MAX_SPEECH_CHARS = 300;

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Un débit un peu plus lent que la normale, pour qu'un enfant suive. */
export function buildSsml(derja: CountryId, text: string): string {
  const { locale, name } = VOICES[derja];
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}"><voice name="${name}"><prosody rate="-8%">${escapeXml(text)}</prosody></voice></speak>`;
}

export function parseSpeechRequest(
  input: unknown,
): { ok: true; derja: CountryId; text: string } | { ok: false } {
  if (typeof input !== "object" || input === null) return { ok: false };
  const { derja, text } = input as Record<string, unknown>;
  if (typeof derja !== "string" || !(derja in VOICES)) return { ok: false };
  if (typeof text !== "string" || !text.trim() || text.length > MAX_SPEECH_CHARS) return { ok: false };
  return { ok: true, derja: derja as CountryId, text: text.trim() };
}
