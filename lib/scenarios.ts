export type Scenario = {
  id: string;
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
    title: "Dire bonjour",
    ar: "سلام",
    description: "Saluer, demander « ça va ? », dire son âge et ce qu'on aime.",
    brief:
      "Tu rencontres l'enfant. Fais-lui pratiquer les salutations, « ça va ? », son âge, puis ce qu'il aime (jeux, sport, plats).",
  },
  {
    id: "journee",
    title: "Raconter sa journée",
    ar: "اليوم",
    description: "L'école, les copains, ce qu'on a mangé, ce qu'on a fait.",
    brief:
      "Demande à l'enfant ce qu'il a fait aujourd'hui : l'école, les amis, le repas, les jeux. Fais-lui utiliser le passé.",
  },
  {
    id: "mamie",
    title: "Appeler mamie",
    ar: "جدة",
    description: "Lissan joue la grand-mère au téléphone. À toi de lui répondre !",
    brief:
      "Tu joues la grand-mère de l'enfant au téléphone, tendre et joyeuse. Demande-lui des nouvelles, s'il mange bien, quand il viendra en vacances.",
  },
  {
    id: "table",
    title: "À table",
    ar: "ماكلة",
    description: "Demander du pain ou de l'eau, dire que c'est bon, remercier.",
    brief:
      "Vous êtes à table en famille. Fais pratiquer : demander du pain, de l'eau, dire que c'est bon, qu'on a assez mangé, remercier.",
  },
  {
    id: "souk",
    title: "Au souk",
    ar: "سوق",
    description: "Acheter des fruits, compter, demander le prix.",
    brief:
      "Tu joues un marchand de fruits au souk. Fais pratiquer : demander un fruit, les nombres de 1 à 10, « combien ça coûte ? », merci et au revoir.",
  },
  {
    id: "famille",
    title: "La famille",
    ar: "عائلة",
    description: "Papa, maman, frères et sœurs, cousins : qui est qui ?",
    brief:
      "Fais parler l'enfant de sa famille avec les mots papa, maman, frère, sœur, grand-père, tante, cousin. Demande combien de frères et sœurs il a, pas leurs noms.",
  },
];

export const getScenario = (id: string) => SCENARIOS.find((s) => s.id === id);
