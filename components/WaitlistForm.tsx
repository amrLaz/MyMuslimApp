"use client";

import { useState, type FormEvent } from "react";
import { COUNTRIES, type CountryId } from "@/lib/countries";

type Status = "idle" | "sending" | "done";

export default function WaitlistForm() {
  const [country, setCountry] = useState<CountryId>("ma");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, country }),
      });
      if (res.ok) {
        setStatus("done");
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant.");
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
    }
    setStatus("idle");
  }

  if (status === "done") {
    const chosen = COUNTRIES.find((c) => c.id === country);
    return (
      <div className="waitlist" id="inscription" role="status">
        <p className="waitlist-thanks">Merci, c'est noté.</p>
        <p className="muted">
          Nous vous écrirons dès que les premiers essais ouvrent pour la derja {chosen?.adjective}.
        </p>
      </div>
    );
  }

  return (
    <form className="waitlist" id="inscription" onSubmit={submit}>
      <p className="waitlist-label" id="derja-label">Quelle derja parle votre famille ?</p>
      <div className="chips" role="group" aria-labelledby="derja-label">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className="chip"
            aria-pressed={country === c.id}
            onClick={() => setCountry(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <label className="waitlist-label" htmlFor="email">Votre e-mail</label>
      <div className="waitlist-row">
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="prenom@exemple.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={error ? "waitlist-error" : undefined}
        />
        <button type="submit" className="btn-accent" disabled={status === "sending"}>
          {status === "sending" ? "Envoi…" : "Rejoindre la liste"}
        </button>
      </div>
      {error && <p className="waitlist-error" id="waitlist-error" role="alert">{error}</p>}
      <p className="waitlist-note">
        Pas de spam. Vous serez prévenu(e) du lancement et des essais gratuits.
      </p>
    </form>
  );
}
