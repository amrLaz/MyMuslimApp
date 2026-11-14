"use client";

import { LETTERS } from "@/lib/alphabet";
import { letterName } from "@/lib/ecriture";

// L'alphabet dans l'ordre qu'on apprend, puis les formes particulières.
const KEYS = [...LETTERS.map((l) => l.glyph), "ة", "ى", "ء", "أ", "إ", "آ", "ؤ", "ئ"];

/** Clavier arabe à l'écran : tout le monde n'a pas un clavier arabe sur son téléphone. */
export default function ArabicKeyboard({
  onKey,
  onBackspace,
  disabled,
}: {
  onKey: (c: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="keyboard" role="group" aria-label="Clavier arabe">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          className="key"
          disabled={disabled}
          aria-label={letterName(k)}
          onClick={() => onKey(k)}
        >
          <span lang="ar" dir="rtl">{k}</span>
        </button>
      ))}
      <button
        type="button"
        className="key key-wide"
        disabled={disabled}
        aria-label="Effacer la dernière lettre"
        onClick={onBackspace}
      >
        Effacer
      </button>
    </div>
  );
}
