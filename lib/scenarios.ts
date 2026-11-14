export type Scenario = {
  id: string;
  /** Niveau de difficulté, de 1 à 3. */
  level: number;
  title: string;
  /** Mot arabe affiché sur la carte. */
  ar: string;
  description: string;
  /** Consigne donnée au tuteur : son rôle et où mener la conversation. */
  brief: string;
};

export const SCENARIOS: Scenario[] = [
  {
    id: "bonjour",
    level: 1,
    title: "Dire bonjour",
    ar: "سلام",
    description: "Saluer, demander « ça va ? », dire son âge et ce qu'on aime.",
    brief:
      "Tu rencontres l'enfant. Fais-lui pratiquer les salutations, « ça va ? », son âge, puis ce qu'il aime (jeux, sport, plats).",
  },
  {
    id: "journee",
    level: 2,
    title: "Raconter sa journée",
    ar: "اليوم",
    description: "L'école, les copains, ce qu'on a mangé, ce qu'on a fait.",
    brief:
      "Demande à l'enfant ce qu'il a fait aujourd'hui : l'école, les amis, le repas, les jeux. Fais-lui utiliser le passé.",
  },
  {
    id: "mamie",
    level: 3,
    title: "Appeler mamie",
    ar: "جدة",
    description: "Lissan joue la grand-mère au téléphone. À toi de lui répondre !",
    brief:
      "Tu joues la grand-mère de l'enfant au téléphone, tendre et joyeuse. Demande-lui des nouvelles, s'il mange bien, quand il viendra en vacances.",
  },
  {
    id: "table",
    level: 2,
    title: "À table",
    ar: "ماكلة",
    description: "Demander du pain ou de l'eau, dire que c'est bon, remercier.",
    brief:
      "Vous êtes à table en famille. Fais pratiquer : demander du pain, de l'eau, dire que c'est bon, qu'on a assez mangé, remercier.",
  },
  {
    id: "souk",
    level: 3,
    title: "Au souk",
    ar: "سوق",
    description: "Acheter des fruits, compter, demander le prix.",
    brief:
      "Tu joues un marchand de fruits au souk. Fais pratiquer : demander un fruit, les nombres de 1 à 10, « combien ça coûte ? », merci et au revoir.",
  },
  {
    id: "famille",
    level: 1,
    title: "La famille",
    ar: "عائلة",
    description: "Papa, maman, frères et sœurs, cousins : qui est qui ?",
    brief:
      "Fais parler l'enfant de sa famille avec les mots papa, maman, frère, sœur, grand-père, tante, cousin. Demande combien de frères et sœurs il a, pas leurs noms.",
  },
];

export const getScenario = (id: string) => SCENARIOS.find((s) => s.id === id);

export const SCENARIO_LEVELS = [
  {
    n: 1,
    title: "Premiers mots",
    guide:
      "Niveau 1, débutant : parle par mots isolés et par phrases de deux à quatre mots. Pose des questions auxquelles on répond par un mot ou par oui/non, et donne toujours un modèle de réponse dans « aide ». Accueille avec enthousiasme une réponse en français.",
  },
  {
    n: 2,
    title: "Petites phrases",
    guide:
      "Niveau 2 : phrases courtes de quatre à sept mots. Pose des questions simples (qui, quoi, où) et attends une phrase complète. Donne l'aide, mais laisse l'enfant essayer d'abord.",
  },
  {
    n: 3,
    title: "Vraies conversations",
    guide:
      "Niveau 3 : parle naturellement mais lentement, relance avec « pourquoi » et « et ensuite ? », et attends deux phrases par réponse. Ne propose l'aide que si l'enfant est vraiment bloqué.",
  },
];

/** Un niveau s'ouvre quand toutes les situations du niveau précédent ont été terminées. */
export function scenarioUnlocked(level: number, doneIds: string[]): boolean {
  if (level <= 1) return true;
  return SCENARIOS.filter((s) => s.level === level - 1).every((s) => doneIds.includes(s.id));
}
