import { NextResponse } from "next/server";
import { clientIp, createLimiter } from "@/lib/ratelimit";
import { VOICES } from "@/lib/voix";

// 12 secondes de WAV mono 16 kHz pèsent environ 400 Ko.
const MAX_BYTES = 600_000;
const allowed = createLimiter(80);

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/** Dit à l'app si la reconnaissance vocale du serveur est configurée. */
export async function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) });
}

export async function POST(request: Request) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return fail(503, "Reconnaissance vocale non configurée.");

  const derja = new URL(request.url).searchParams.get("derja") ?? "";
  if (!(derja in VOICES)) return fail(400, "Requête invalide.");
  if (!allowed(clientIp(request))) return fail(429, "Trop de demandes. Réessaie dans quelques minutes.");

  const audio = await request.arrayBuffer();
  if (audio.byteLength < 1000 || audio.byteLength > MAX_BYTES) return fail(400, "Enregistrement invalide.");

  const base =
    process.env.AZURE_STT_ENDPOINT ??
    `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;
  const url = `${base}?language=${VOICES[derja as keyof typeof VOICES].locale}&format=simple`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        Accept: "application/json",
      },
      body: audio,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      console.error("Écoute : erreur Azure Speech", res.status);
      return fail(502, "La reconnaissance vocale n'est pas disponible.");
    }
    const data = (await res.json()) as { RecognitionStatus?: string; DisplayText?: string };
    // « NoMatch » et « InitialSilenceTimeout » : rien d'intelligible n'a été dit.
    const text = data.RecognitionStatus === "Success" ? (data.DisplayText ?? "").trim() : "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Écoute : appel Azure Speech impossible", err);
    return fail(502, "La reconnaissance vocale n'est pas disponible.");
  }
}
