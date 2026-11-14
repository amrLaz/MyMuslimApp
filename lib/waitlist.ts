import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { COUNTRIES, type CountryId } from "./countries";

export type Signup = { email: string; country: CountryId };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseSignup(
  input: unknown,
): { ok: true; signup: Signup } | { ok: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Requête invalide." };
  }
  const { email, country } = input as Record<string, unknown>;
  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return { ok: false, error: "Cette adresse e-mail ne semble pas valide." };
  }
  if (!COUNTRIES.some((c) => c.id === country)) {
    return { ok: false, error: "Choisissez la derja de votre famille." };
  }
  return {
    ok: true,
    signup: { email: email.trim().toLowerCase(), country: country as CountryId },
  };
}

// Le chemin vient de la configuration : les commentaires turbopackIgnore plus bas
// évitent que le build embarque tout le projet pour le retrouver.
function waitlistFile(): string {
  return process.env.WAITLIST_FILE || path.join(process.cwd(), "data", "waitlist.jsonl");
}

// Les écritures passent l'une après l'autre, pour que deux inscriptions
// simultanées de la même adresse ne créent pas de doublon.
let queue: Promise<unknown> = Promise.resolve();

/** Enregistre l'inscription. Renvoie false si l'adresse était déjà inscrite. */
export function saveSignup(signup: Signup): Promise<boolean> {
  const run = queue.then(async () => {
    const file = waitlistFile();
    let existing = "";
    try {
      existing = await readFile(/* turbopackIgnore: true */ file, "utf8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
    const known = existing
      .split("\n")
      .filter(Boolean)
      .some((line) => (JSON.parse(line) as Signup).email === signup.email);
    if (known) return false;
    await mkdir(/* turbopackIgnore: true */ path.dirname(file), { recursive: true });
    await appendFile(
      /* turbopackIgnore: true */ file,
      JSON.stringify({ ...signup, createdAt: new Date().toISOString() }) + "\n",
    );
    return true;
  });
  queue = run.catch(() => {});
  return run;
}
