import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import {
  LAST_TURN,
  MAX_CHILD_TURNS,
  OPENING,
  TutorReply,
  childTurns,
  parseTutorRequest,
  systemPrompt,
} from "@/lib/tuteur";

const MODEL = process.env.TUTOR_MODEL || "claude-opus-5-5";

// Garde-fou contre l'abus de la clé API : 40 messages par tranche de 10 minutes
// et par adresse. En mémoire, donc par instance de serveur.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 40;
const hits = new Map<string, number[]>();

function allowed(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return false;
  }
  hits.set(ip, [...recent, now]);
  if (hits.size > 5000) hits.clear();
  return true;
}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Requête invalide.");
  }
  const parsed = parseTutorRequest(body);
  if (!parsed.ok) return fail(400, parsed.error);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allowed(ip)) return fail(429, "Lissan a besoin d'une petite pause. Réessaie dans quelques minutes.");

  const { turns, ...context } = parsed.request;
  const last = childTurns(turns) >= MAX_CHILD_TURNS;

  // Le prénom de l'enfant n'est jamais envoyé : seulement son âge, sa derja et ce qu'il dit.
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: OPENING }];
  turns.forEach((t, i) => {
    if (t.role === "tutor") {
      messages.push({ role: "assistant", content: `${t.ar}\n${t.fr}` });
    } else {
      const isLast = last && i === turns.length - 1;
      messages.push({ role: "user", content: t.text + (isLast ? LAST_TURN : "") });
    }
  });

  try {
    const client = new Anthropic({ timeout: 45_000, maxRetries: 1 });
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      // Si le modèle décline une demande, l'API la rejoue sur un modèle de secours.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // Effort bas : l'enfant attend la réponse à voix haute.
      output_config: { effort: "low", format: zodOutputFormat(TutorReply) },
      system: systemPrompt(context),
      messages,
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return fail(502, "Lissan n'a pas su répondre. Essaie de le dire autrement.");
    }
    return NextResponse.json({ ...response.parsed_output, fin: response.parsed_output.fin || last });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("Tuteur : clé API absente ou invalide (ANTHROPIC_API_KEY).");
      return fail(503, "Le tuteur n'est pas encore configuré sur ce serveur.");
    }
    if (err instanceof Anthropic.RateLimitError) {
      return fail(429, "Lissan est très demandé. Réessaie dans un instant.");
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Tuteur : erreur de l'API", err.status, err.message);
      return fail(502, "Lissan a eu un souci. Réessaie dans un instant.");
    }
    // Sans clé API, le SDK refuse de construire le client.
    console.error("Tuteur : erreur inattendue", err);
    return fail(503, "Le tuteur n'est pas encore configuré sur ce serveur.");
  }
}
