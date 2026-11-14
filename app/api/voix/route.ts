import { NextResponse } from "next/server";
import { clientIp, createLimiter } from "@/lib/ratelimit";
import { buildSsml, parseSpeechRequest } from "@/lib/voix";

const allowed = createLimiter(120);

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  // Sans configuration, l'app retombe sur la voix du navigateur.
  if (!key || !region) return fail(503, "Voix non configurée.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Requête invalide.");
  }
  const parsed = parseSpeechRequest(body);
  if (!parsed.ok) return fail(400, "Requête invalide.");
  if (!allowed(clientIp(request))) return fail(429, "Trop de demandes. Réessaie dans quelques minutes.");

  const endpoint =
    process.env.AZURE_SPEECH_ENDPOINT ?? `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "lissan",
      },
      body: buildSsml(parsed.derja, parsed.text),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok || !res.body) {
      console.error("Voix : erreur Azure Speech", res.status);
      return fail(502, "La voix n'est pas disponible.");
    }
    return new Response(res.body, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=86400" },
    });
  } catch (err) {
    console.error("Voix : appel Azure Speech impossible", err);
    return fail(502, "La voix n'est pas disponible.");
  }
}
