"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { CountryId } from "@/lib/countries";
import type { Scenario } from "@/lib/scenarios";
import { getProfile, logActivity, type Profile, type Word } from "@/lib/store";
import { MicError, canRecord, startRecording, type Recorder } from "@/lib/recorder";
import type { Turn, TutorReply } from "@/lib/tuteur";
import { recordingToWav } from "@/lib/wav";

type Item = { role: "tutor"; reply: TutorReply } | { role: "child"; text: string };

// La reconnaissance vocale du navigateur n'a pas de types officiels.
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

const LOCALE = { ma: "ar-MA", dz: "ar-DZ", tn: "ar-TN" } as const;

function recognitionClass(): (new () => Recognition) | undefined {
  const w = window as unknown as Record<string, new () => Recognition>;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

function browserSpeak(text: string, locale: string) {
  if (!("speechSynthesis" in window)) return;
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
}

let current: HTMLAudioElement | null = null;
let speakId = 0;
// Les phrases déjà prononcées sont gardées : « Réécouter » ne coûte rien de plus.
const voiceCache = new Map<string, string>();

function stopSpeaking() {
  speakId += 1;
  current?.pause();
  current = null;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** La voix neuronale du serveur si elle est configurée, sinon celle du navigateur. */
async function speak(text: string, derja: CountryId) {
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
    if (mine !== speakId) return;
    current = new Audio(url);
    await current.play();
  } catch {
    if (mine === speakId) browserSpeak(text, LOCALE[derja]);
  }
}

export default function Conversation({ scenario }: { scenario: Scenario }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  // Reconnaissance du serveur (Azure) si elle est configurée, sinon celle du navigateur.
  const serverStt = useRef(false);
  const recorder = useRef<Recorder | null>(null);
  const autoStop = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const logged = useRef(false);

  const lastReply = [...items].reverse().find((i) => i.role === "tutor")?.reply;
  const finished = lastReply?.fin === true;
  const locale = profile ? LOCALE[profile.derja] : "ar-MA";

  async function ask(history: Item[], p: Profile) {
    setBusy(true);
    setError("");
    setShowHelp(false);
    const turns: Turn[] = history.map((i) =>
      i.role === "child"
        ? { role: "child", text: i.text }
        : { role: "tutor", ar: i.reply.ar, fr: i.reply.fr },
    );
    try {
      const res = await fetch("/api/tuteur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ derja: p.derja, age: p.age, scenario: scenario.id, turns }),
      });
      const data = (await res.json().catch(() => null)) as (TutorReply & { error?: string }) | null;
      if (!res.ok || !data || data.error) {
        setError(data?.error ?? "Lissan a eu un souci. Réessaie dans un instant.");
      } else {
        setItems([...history, { role: "tutor", reply: data }]);
        void speak(data.ar, p.derja);
      }
    } catch {
      setError("Connexion impossible. Vérifie le réseau et réessaie.");
    }
    setBusy(false);
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const p = getProfile();
    setProfile(p);
    setCanListen(Boolean(recognitionClass()));
    // La reconnaissance du serveur comprend mieux la derja et marche sur tous les téléphones.
    void fetch("/api/ecoute")
      .then((r) => r.json() as Promise<{ enabled?: boolean }>)
      .then((d) => {
        serverStt.current = d.enabled === true && canRecord();
        setCanListen(serverStt.current || Boolean(recognitionClass()));
      })
      .catch(() => {});
    if (p) void ask([], p);
    return () => {
      recognition.current?.stop();
      if (autoStop.current) clearTimeout(autoStop.current);
      void recorder.current?.stop();
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [items, busy, showHelp]);

  // Fin de séance : on garde les mots appris pour le résumé des parents.
  useEffect(() => {
    if (!finished || logged.current) return;
    logged.current = true;
    const replies = items.flatMap((i) => (i.role === "tutor" ? [i.reply] : []));
    const seen = new Set<string>();
    const words: Word[] = replies
      .flatMap((r) => r.mots)
      .filter((w) => !seen.has(w.ar) && seen.add(w.ar));
    logActivity({
      kind: "conversation",
      id: scenario.id,
      label: scenario.title,
      words,
      corrections: replies.filter((r) => r.correction).length,
    });
  }, [finished, items, scenario]);

  function send(said: string) {
    const clean = said.trim().slice(0, 300);
    if (!clean || busy || finished || !profile) return;
    setText("");
    const history: Item[] = [...items, { role: "child", text: clean }];
    setItems(history);
    void ask(history, profile);
  }

  function retry() {
    if (profile) void ask(items, profile);
  }

  async function finishRecording() {
    if (autoStop.current) clearTimeout(autoStop.current);
    const rec = recorder.current;
    recorder.current = null;
    setListening(false);
    if (!rec || !profile) return;
    setTranscribing(true);
    try {
      const wav = await recordingToWav(await rec.stop());
      const res = await fetch(`/api/ecoute?derja=${profile.derja}`, { method: "POST", body: wav });
      const data = (await res.json().catch(() => null)) as { text?: string } | null;
      if (!res.ok || !data) {
        setError("Je n'ai pas pu t'écouter. Écris ta réponse, ou réessaie dans un instant.");
      } else if (!data.text) {
        setError("Je n'ai rien entendu. Rapproche-toi du téléphone, parle un peu plus fort et réessaie.");
      } else {
        setTranscribing(false);
        send(data.text);
        return;
      }
    } catch {
      setError("Je n'ai pas pu t'écouter. Écris ta réponse, ou réessaie dans un instant.");
    }
    setTranscribing(false);
  }

  async function toggleMic() {
    if (listening) {
      if (serverStt.current) void finishRecording();
      else recognition.current?.stop();
      return;
    }
    stopSpeaking();
    setError("");
    if (serverStt.current) {
      try {
        recorder.current = await startRecording();
      } catch (err) {
        const reason = err instanceof MicError ? err.reason : "unsupported";
        setError(
          reason === "denied"
            ? "Le micro est bloqué. Autorise-le dans les réglages du navigateur pour ce site, puis réessaie."
            : reason === "none"
              ? "Je ne trouve pas de micro sur cet appareil."
              : "Le micro ne marche pas dans ce navigateur. Écris ta réponse.",
        );
        return;
      }
      setListening(true);
      // Une phrase d'enfant dure quelques secondes : on coupe à 12 secondes.
      autoStop.current = setTimeout(() => void finishRecording(), 12_000);
      return;
    }
    const Rec = recognitionClass();
    if (!Rec) return;
    const rec = new Rec();
    rec.lang = locale;
    rec.interimResults = false;
    rec.onresult = (e) => send(e.results[0][0].transcript);
    rec.onerror = (e) => {
      const code = e?.error;
      setError(
        code === "not-allowed" || code === "service-not-allowed"
          ? "Le micro est bloqué. Autorise-le dans les réglages du navigateur (et la dictée sur iPhone), puis réessaie."
          : code === "language-not-supported"
            ? "Ce téléphone ne comprend pas cette derja à voix haute. Écris ta réponse."
            : "Je n'ai pas entendu. Appuie sur le micro et réessaie, ou écris ta réponse.",
      );
    };
    rec.onend = () => setListening(false);
    recognition.current = rec;
    setListening(true);
    rec.start();
  }

  if (started.current && !profile && !busy) {
    return (
      <div className="stack">
        <p className="muted">Il faut d'abord créer le profil de l'enfant.</p>
        <Link href="/app/bienvenue" className="btn-next">Créer le profil</Link>
      </div>
    );
  }

  const words = finished
    ? items.flatMap((i) => (i.role === "tutor" ? i.reply.mots : []))
    : [];

  return (
    <div className="talk">
      <h1 className="lesson-title">{scenario.title}</h1>
      <div className="chat-thread talk-thread" aria-live="polite">
        {items.map((item, i) =>
          item.role === "child" ? (
            <div key={i} className="bubble bubble-child">
              <p className="bubble-who">TOI</p>
              <p dir="auto">{item.text}</p>
            </div>
          ) : (
            <div key={i} className="talk-turn">
              {item.reply.correction && (
                <div className="tip">
                  <p className="caps">Petite astuce</p>
                  <p className="bubble-ar" lang="ar" dir="rtl">{item.reply.correction.ar}</p>
                  <p>{item.reply.correction.translit}</p>
                  <p className="muted">{item.reply.correction.astuce}</p>
                </div>
              )}
              <div className="bubble bubble-tutor">
                <p className="bubble-who">LISSAN</p>
                <p className="bubble-ar" lang="ar" dir="rtl">{item.reply.ar}</p>
                <p className="muted">{item.reply.translit} · {item.reply.fr}</p>
                <button
                  type="button"
                  className="replay"
                  onClick={() => void speak(item.reply.ar, profile?.derja ?? "ma")}
                >
                  Réécouter
                </button>
              </div>
            </div>
          ),
        )}
        {busy && <p className="lesson-note" role="status">Lissan réfléchit…</p>}
        {showHelp && lastReply?.aide && (
          <div className="tip">
            <p className="caps">Tu peux dire</p>
            <p className="bubble-ar" lang="ar" dir="rtl">{lastReply.aide.ar}</p>
            <p>{lastReply.aide.translit}</p>
            <p className="muted">{lastReply.aide.fr}</p>
            <button type="button" className="replay" onClick={() => void speak(lastReply.aide!.ar, profile?.derja ?? "ma")}>
              Écouter
            </button>
          </div>
        )}
        {error && (
          <div className="tip" role="alert">
            <p className="feedback wrong">{error}</p>
            {!busy && items[items.length - 1]?.role !== "tutor" && (
              <button type="button" className="replay" onClick={retry}>Réessayer</button>
            )}
          </div>
        )}
        <div ref={bottom} />
      </div>

      {finished ? (
        <div className="stack talk-end">
          <div className="next-card">
            <p className="caps">Bravo, séance terminée</p>
            {words.length > 0 ? (
              <ul className="words">
                {words.map((w, i) => (
                  <li key={i}>
                    <span lang="ar" dir="rtl" className="words-ar">{w.ar}</span>
                    <span>{w.translit} · {w.fr}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Tu as tenu toute la conversation !</p>
            )}
          </div>
          <Link href="/app/parler" className="btn-next">Choisir une autre situation</Link>
          <Link href="/app" className="btn-plain link-btn">Retour à l'accueil</Link>
        </div>
      ) : (
        <div className="talk-controls">
          {canListen && (
            <button
              type="button"
              className={listening ? "mic on" : "mic"}
              aria-pressed={listening}
              disabled={busy || transcribing || items.length === 0}
              onClick={toggleMic}
            >
              {transcribing ? "Je réfléchis à ce que tu as dit…" : listening ? "Je t'écoute… (appuie pour arrêter)" : "Appuie et parle"}
            </button>
          )}
          <form
            className="talk-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              send(text);
            }}
          >
            <label className="sr-only" htmlFor="reponse">Ta réponse</label>
            <input
              id="reponse"
              className="input"
              dir="auto"
              value={text}
              maxLength={300}
              placeholder={canListen ? "Ou écris ta réponse" : "Écris ta réponse"}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="btn-teal talk-send" disabled={busy || !text.trim()}>
              Envoyer
            </button>
          </form>
          {!canListen && (
            <p className="lesson-note">
              Le micro n'est pas disponible dans ce navigateur. Essaie avec Chrome ou Safari.
            </p>
          )}
          {lastReply?.aide && !showHelp && (
            <button type="button" className="btn-plain" onClick={() => setShowHelp(true)}>
              Aide-moi
            </button>
          )}
        </div>
      )}
    </div>
  );
}
