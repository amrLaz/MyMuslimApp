import { NextResponse } from "next/server";
import { parseSignup, saveSignup } from "@/lib/waitlist";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = parseSignup(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    // Même réponse pour une adresse déjà inscrite : on ne révèle pas qui est sur la liste.
    await saveSignup(parsed.signup);
  } catch (err) {
    console.error("Inscription à la liste d'attente impossible", err);
    return NextResponse.json(
      { error: "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
