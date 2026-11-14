import { LOCALES, type CountryId } from "./countries";

function browserSpeak(text: string, locale: string): boolean {
  if (!("speechSynthesis" in window)) return false;
  const u = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  // La voix de la derja si l'appareil en a une, sinon n'importe quelle voix arabe.
  const voice =
    voices.find((v) => v.lang === locale) ?? voices.find((v) => v.lang.startsWith("ar"));
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? locale;
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  return true;
}

let current: HTMLAudioElement | null = null;
let speakId = 0;
// Les phrases déjà prononcées sont gardées : réécouter ne coûte rien de plus.
const voiceCache = new Map<string, string>();

export function stopSpeaking(): void {
  speakId += 1;
  current?.pause();
  current = null;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/**
 * Prononce le texte avec la voix neuronale du serveur si elle est configurée,
 * sinon avec celle du navigateur. Renvoie false si rien n'a pu être lu.
 */
export async function speak(text: string, derja: CountryId = "ma"): Promise<boolean> {
  stopSpeaking();
  const mine = speakId;
  const cacheKey = `${derja}:${text}`;
  try {
    let url = voiceCache.get(cacheKey);
    if (!url) {
      const res = await fetch("/api/voix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ derja, text }),
      });
      if (!res.ok) throw new Error("voix");
      url = URL.createObjectURL(await res.blob());
      voiceCache.set(cacheKey, url);
    }
    if (mine !== speakId) return true;
    current = new Audio(url);
    await current.play();
    return true;
  } catch {
    return mine === speakId ? browserSpeak(text, LOCALES[derja]) : true;
  }
}
