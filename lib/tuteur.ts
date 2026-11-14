import { z } from "zod";
import { COUNTRIES, type CountryId } from "./countries";
import { getScenario, type Scenario } from "./scenarios";

/** Nombre de réponses de l'enfant avant que le tuteur conclue (séance de 5 à 10 minutes). */
export const MAX_CHILD_TURNS = 8;
const MAX_TEXT = 300;

const Phrase = z.object({
  ar: z.string().describe("La phrase en derja, en écriture arabe"),
  translit: z.string().describe("La même phrase en lettres latines, façon « arabizi » (3, 7, 9)"),
  fr: z.string().describe("La traduction en français"),
});

export const TutorReply = Phrase.extend({
  correction: Phrase.extend({
    astuce: z.string().describe("Une phrase d'explication en français, simple et encourageante"),
  })
    .nullable()
    .describe("La bonne façon de dire ce que l'enfant vient d'essayer de dire, ou null s'il n'y a rien à corriger"),
  aide: Phrase.nullable().describe(
    "Une réponse possible que l'enfant peut répéter s'il est bloqué, ou null en fin de séance",
  ),
  mots: z.array(Phrase).describe("Les mots ou expressions nouveaux de ce tour (0 à 3)"),
  fin: z.boolean().describe("true si ce message conclut la séance"),
});
export type TutorReply = z.infer<typeof TutorReply>;

export type Turn = { role: "child"; text: string } | { role: "tutor"; ar: string; fr: string };

export type TutorRequest = { derja: CountryId; age: number; scenario: Scenario; turns: Turn[] };

export function parseTutorRequest(
  input: unknown,
): { ok: true; request: TutorRequest } | { ok: false; error: string } {
  const bad = { ok: false as const, error: "Requête invalide." };
  if (typeof input !== "object" || input === null) return bad;
  const { derja, age, scenario, turns } = input as Record<string, unknown>;
  if (!COUNTRIES.some((c) => c.id === derja)) return bad;
  if (typeof age !== "number" || !Number.isInteger(age) || age < 6 || age > 14) return bad;
  const found = typeof scenario === "string" ? getScenario(scenario) : undefined;
  if (!found) return bad;
  if (!Array.isArray(turns) || turns.length > MAX_CHILD_TURNS * 2 + 2) return bad;

  const clean: Turn[] = [];
  for (const [i, t] of turns.entries()) {
    if (typeof t !== "object" || t === null) return bad;
    const { role, text, ar, fr } = t as Record<string, unknown>;
    // La conversation alterne toujours : le tuteur ouvre, l'enfant répond.
    if (role !== (i % 2 === 0 ? "tutor" : "child")) return bad;
    const ok = (s: unknown): s is string =>
      typeof s === "string" && s.trim().length > 0 && s.length <= MAX_TEXT;
    if (role === "child") {
      if (!ok(text)) return bad;
      clean.push({ role: "child", text: text.trim() });
    } else {
      if (!ok(ar) || !ok(fr)) return bad;
      clean.push({ role: "tutor", ar, fr });
    }
  }
  if (clean.length > 0 && clean[clean.length - 1].role !== "child") return bad;
  return { ok: true, request: { derja: derja as CountryId, age, scenario: found, turns: clean } };
}

export function childTurns(turns: Turn[]): number {
  return turns.filter((t) => t.role === "child").length;
}

export function systemPrompt({ derja, age, scenario }: Omit<TutorRequest, "turns">): string {
  const adjective = COUNTRIES.find((c) => c.id === derja)!.adjective;
  return `Tu es Lissan, un tuteur d'arabe pour les enfants de familles maghrébines qui grandissent en France. Ces enfants comprennent souvent la derja de la maison mais n'osent pas la parler. Ton but : que l'enfant parle, se sente capable, et ait envie de revenir demain.

Tu parles avec un enfant de ${age} ans, en derja ${adjective} (l'arabe dialectal parlé à la maison, pas l'arabe littéraire).

La situation du jour : « ${scenario.title} ». ${scenario.brief}

Comment mener la séance :
- Tes messages sont lus à voix haute à l'enfant : une ou deux phrases très courtes, une seule question à la fois, avec des mots adaptés à son âge.
- Les messages que tu reçois sont ce que l'enfant a dit, souvent transcrit par reconnaissance vocale : il peut y avoir des fautes de transcription, de l'écriture arabe, de l'arabizi, du français, ou un mélange. Devine ce qu'il a voulu dire avec bienveillance et ne te moque jamais.
- S'il répond en français, c'est normal : félicite l'idée, puis donne-lui dans « aide » la phrase en derja à répéter.
- Ne remplis « correction » que pour une vraie erreur de langue qui gênerait la compréhension, et toujours sur un ton encourageant. Une réponse correcte ou presque correcte n'a pas besoin de correction.
- « aide » propose une réponse possible à ta question, que l'enfant peut répéter s'il est bloqué.
- « mots » liste les mots nouveaux ou utiles de ton message (trois au plus), pour le résumé envoyé aux parents.
- La séance est courte. Quand on te signale le dernier échange, félicite l'enfant pour un progrès précis, dis au revoir, et mets « fin » à true.

Ce que tu ne fais pas, parce que les parents nous confient leur enfant :
- Tu ne demandes aucune information personnelle (nom de famille, adresse, école, téléphone, photo). Si l'enfant en donne, n'y reviens pas.
- Tu restes dans la situation du jour. Si l'enfant part sur un autre sujet, ramène-le gentiment.
- Tu ne réponds pas aux questions de religion et tu ne cites ni Coran ni hadith : ce sont de très bonnes questions pour ses parents ou son enseignant, dis-le-lui simplement. Les formules de politesse courantes (salam, hamdoullah, inchallah, bismillah) font partie de la langue et sont les bienvenues.
- Si l'enfant dit quelque chose d'inquiétant (il a peur, il a mal, quelqu'un lui fait du mal), réponds avec douceur en français qu'il doit en parler tout de suite à un parent ou à un adulte de confiance, et mets « fin » à true.`;
}

/** Ce que le tuteur reçoit à la place d'un message d'enfant pour ouvrir la séance. */
export const OPENING = "(La séance commence. Salue l'enfant et pose ta première question.)";
export const LAST_TURN = "\n\n(C'est le dernier échange de la séance : conclus maintenant.)";
