"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LETTERS } from "@/lib/alphabet";
import { SURAHS } from "@/lib/coran";
import { COUNTRIES } from "@/lib/countries";
import {
  eraseEverything,
  getJournal,
  getLetters,
  getProfile,
  getSurahs,
  getWords,
  lastWeek,
  useStored,
} from "@/lib/store";

export default function ParentSummary() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const { ready, value } = useStored(() => ({
    profile: getProfile(),
    week: lastWeek(getJournal()),
    letters: getLetters(),
    surahs: getSurahs(),
    words: getWords(),
  }));

  if (!ready || !value) return null;
  const { profile, week, letters, surahs, words: wordsDone } = value;

  if (!profile) {
    return (
      <div className="stack">
        <p className="muted">Aucun profil sur cet appareil pour l'instant.</p>
        <Link href="/app/bienvenue" className="btn-next">Créer le profil</Link>
      </div>
    );
  }

  const talks = week.filter((a) => a.kind === "conversation");
  const newLetters = week.filter((a) => a.kind === "lettre");
  const listens = week.filter((a) => a.kind === "sourate");
  const writes = week.filter((a) => a.kind === "ecriture");
  const written = writes.flatMap((a) => a.words ?? []);
  const toReview = [...new Map(writes.flatMap((a) => a.review ?? []).map((w) => [w.ar, w])).values()];
  const words = talks.flatMap((t) => t.words ?? []);
  const corrections = talks.reduce((n, t) => n + (t.corrections ?? 0), 0);
  const days = new Set(week.map((a) => a.at.slice(0, 10))).size;
  const nextLetter = LETTERS.find((l) => !letters.includes(l.id));
  const nextSurah = SURAHS.find((s) => !surahs.includes(s.id));
  const derja = COUNTRIES.find((c) => c.id === profile.derja)?.adjective;

  function erase() {
    eraseEverything();
    router.push("/");
  }

  return (
    <div className="stack">
      <div>
        <h1 className="lesson-title">Espace parents</h1>
        <p className="muted">
          {profile.name}, {profile.age} ans · derja {derja}
        </p>
      </div>

      <section className="next-card">
        <p className="caps">Les 7 derniers jours</p>
        {week.length === 0 ? (
          <p>Pas encore d'activité cette semaine.</p>
        ) : (
          <ul className="summary">
            <li><strong>{days}</strong> jour{days > 1 ? "s" : ""} d'activité</li>
            <li><strong>{talks.length}</strong> conversation{talks.length > 1 ? "s" : ""} en derja</li>
            <li><strong>{newLetters.length}</strong> nouvelle{newLetters.length > 1 ? "s" : ""} lettre{newLetters.length > 1 ? "s" : ""}</li>
            <li><strong>{written.length}</strong> mot{written.length > 1 ? "s" : ""} écrit{written.length > 1 ? "s" : ""} en arabe</li>
            <li><strong>{listens.length}</strong> écoute{listens.length > 1 ? "s" : ""} complète{listens.length > 1 ? "s" : ""} de sourate</li>
          </ul>
        )}
      </section>

      {words.length > 0 && (
        <section className="next-card">
          <p className="caps">Mots travaillés en conversation</p>
          <ul className="words">
            {words.slice(-12).map((w, i) => (
              <li key={i}>
                <span lang="ar" dir="rtl" className="words-ar">{w.ar}</span>
                <span>{w.translit} · {w.fr}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="next-card">
        <p className="caps">Depuis le début</p>
        <ul className="summary">
          <li><strong>{letters.length}</strong> lettre{letters.length > 1 ? "s" : ""} sur {LETTERS.length}</li>
          <li><strong>{wordsDone.length}</strong> mot{wordsDone.length > 1 ? "s" : ""} écrit{wordsDone.length > 1 ? "s" : ""} correctement</li>
          <li><strong>{surahs.length}</strong> sourate{surahs.length > 1 ? "s" : ""} sur {SURAHS.length} connue{surahs.length > 1 ? "s" : ""} par cœur</li>
        </ul>
      </section>

      <section className="next-card">
        <p className="caps">Points à travailler</p>
        <ul className="summary">
          {corrections > 0 && (
            <li>{corrections} correction{corrections > 1 ? "s" : ""} de derja cette semaine : refaites une des situations ensemble.</li>
          )}
          {toReview.length > 0 && (
            <li>
              Mots à réécrire :{" "}
              {toReview.slice(-6).map((w) => `${w.ar} (${w.fr})`).join(", ")}
            </li>
          )}
          {nextLetter && <li>Prochaine lettre : {nextLetter.name} ({nextLetter.glyph})</li>}
          {nextSurah && <li>Prochaine sourate : {nextSurah.transliteration}</li>}
          {talks.length === 0 && <li>Aucune conversation cette semaine : cinq minutes suffisent.</li>}
        </ul>
      </section>

      <p className="lesson-note">
        Ce suivi est calculé sur cet appareil. Rien n'est enregistré sur nos serveurs ; seul ce que
        l'enfant dit en conversation (enregistrement vocal et texte) est envoyé à nos prestataires de
        voix et d'IA, sans son prénom.
      </p>

      <Link href="/app/bienvenue" className="btn-plain link-btn">Modifier le profil</Link>
      {confirming ? (
        <div className="tip" role="alertdialog" aria-label="Confirmer l'effacement">
          <p>Effacer le profil et toute la progression de cet appareil ? C'est définitif.</p>
          <div className="chips">
            <button type="button" className="chip danger" onClick={erase}>Oui, tout effacer</button>
            <button type="button" className="chip" onClick={() => setConfirming(false)}>Annuler</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn-plain" onClick={() => setConfirming(true)}>
          Effacer toutes les données
        </button>
      )}
    </div>
  );
}
