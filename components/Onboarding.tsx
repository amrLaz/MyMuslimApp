"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { COUNTRIES, type CountryId } from "@/lib/countries";
import { GOALS, getProfile, saveProfile, type GoalId } from "@/lib/store";

const AGES = [6, 7, 8, 9, 10, 11, 12, 13, 14];

export default function Onboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState(8);
  const [derja, setDerja] = useState<CountryId>("ma");
  const [goals, setGoals] = useState<GoalId[]>(["parler"]);
  const [consent, setConsent] = useState(false);

  // Si un profil existe déjà, on le modifie au lieu d'en créer un autre.
  useEffect(() => {
    const p = getProfile();
    if (!p) return;
    setName(p.name);
    setAge(p.age);
    setDerja(p.derja);
    setGoals(p.goals);
    setConsent(true);
  }, []);

  const valid = name.trim().length > 0 && goals.length > 0 && consent;

  function toggleGoal(id: GoalId) {
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    saveProfile({ name: name.trim(), age, derja, goals });
    router.push("/app");
  }

  return (
    <form className="stack" onSubmit={submit}>
      <div>
        <h1 className="lesson-title">Bienvenue !</h1>
        <p className="muted">
          Un parent remplit cette page avec l'enfant. Cela prend une minute.
        </p>
      </div>

      <div className="field">
        <label className="lesson-label" htmlFor="prenom">Prénom de l'enfant</label>
        <input
          id="prenom"
          className="input"
          value={name}
          maxLength={30}
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
        />
        <p className="lesson-note">Il reste sur cet appareil, il n'est envoyé nulle part.</p>
      </div>

      <div className="field">
        <label className="lesson-label" htmlFor="age">Âge</label>
        <select id="age" className="input" value={age} onChange={(e) => setAge(Number(e.target.value))}>
          {AGES.map((a) => (
            <option key={a} value={a}>{a} ans</option>
          ))}
        </select>
      </div>

      <div className="field">
        <p className="lesson-label" id="derja-choix">La derja de la famille</p>
        <div className="chips" role="group" aria-labelledby="derja-choix">
          {COUNTRIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={derja === c.id}
              onClick={() => setDerja(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <p className="lesson-label" id="objectifs">Ce qu'on veut apprendre</p>
        <div className="chips" role="group" aria-labelledby="objectifs">
          {GOALS.map((g) => (
            <button
              key={g.id}
              type="button"
              className="chip"
              aria-pressed={goals.includes(g.id)}
              onClick={() => toggleGoal(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <label className="consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          Je suis le parent ou le responsable légal de l'enfant. J'accepte que ce qu'il dit pendant
          les conversations (son enregistrement vocal et le texte reconnu) soit envoyé à nos
          prestataires de voix et d'IA pour produire les réponses du tuteur, sans son prénom.
        </span>
      </label>

      <button type="submit" className="btn-next" disabled={!valid}>C'est parti</button>
    </form>
  );
}
