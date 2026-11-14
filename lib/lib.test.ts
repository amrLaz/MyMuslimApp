import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { LETTERS, letterForms, letterNumber, nextLetter, quizOptions } from "./alphabet";
import { parseSignup, saveSignup } from "./waitlist";

describe("alphabet", () => {
  it("contient 28 lettres aux identifiants et glyphes uniques", () => {
    expect(LETTERS).toHaveLength(28);
    expect(new Set(LETTERS.map((l) => l.id)).size).toBe(28);
    expect(new Set(LETTERS.map((l) => l.glyph)).size).toBe(28);
  });

  it("propose au quiz la bonne lettre et deux autres lettres de l'alphabet", () => {
    const glyphs = LETTERS.map((l) => l.glyph);
    for (const letter of LETTERS) {
      const options = quizOptions(letter);
      expect(new Set(options).size).toBe(3);
      expect(options).toContain(letter.glyph);
      for (const o of options) expect(glyphs).toContain(o);
    }
  });

  it("commence chaque premier mot par sa lettre", () => {
    for (const letter of LETTERS) {
      // Le alif porte une hamza en début de mot.
      const first = letter.word.ar[0].replace("أ", "ا");
      expect(first, letter.id).toBe(letter.glyph);
    }
  });

  it("retrouve le rang et la lettre suivante à partir d'une copie de la lettre", () => {
    const copy = structuredClone(LETTERS.find((l) => l.id === "ba")!);
    expect(letterNumber(copy)).toBe(2);
    expect(nextLetter(copy)?.id).toBe("ta");
    expect(nextLetter(structuredClone(LETTERS[27]))).toBeUndefined();
  });

  it("n'attache pas à gauche les lettres qui ne se lient pas", () => {
    const dal = LETTERS.find((l) => l.id === "dal")!;
    expect(letterForms(dal).map((f) => f.glyph)).toEqual(["د", "د", "ـد", "ـد"]);
    const ba = LETTERS.find((l) => l.id === "ba")!;
    expect(letterForms(ba).map((f) => f.glyph)).toEqual(["ب", "بـ", "ـبـ", "ـب"]);
  });
});

describe("liste d'attente", () => {
  beforeEach(async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "lissan-"));
    process.env.WAITLIST_FILE = path.join(dir, "sub", "waitlist.jsonl");
  });

  it("normalise l'adresse et refuse les saisies invalides", () => {
    expect(parseSignup({ email: "  Nadia@Exemple.FR ", country: "dz" })).toEqual({
      ok: true,
      signup: { email: "nadia@exemple.fr", country: "dz" },
    });
    expect(parseSignup({ email: "nadia@", country: "dz" }).ok).toBe(false);
    expect(parseSignup({ email: "nadia@exemple.fr", country: "fr" }).ok).toBe(false);
    expect(parseSignup(null).ok).toBe(false);
  });

  it("enregistre une seule fois chaque adresse, même en parallèle", async () => {
    const a = { email: "a@exemple.fr", country: "ma" } as const;
    const results = await Promise.all([saveSignup(a), saveSignup(a)]);
    expect(results).toEqual([true, false]);
    expect(await saveSignup({ email: "b@exemple.fr", country: "tn" })).toBe(true);

    const lines = (await readFile(process.env.WAITLIST_FILE!, "utf8")).trim().split("\n");
    expect(lines.map((l) => JSON.parse(l).email)).toEqual(["a@exemple.fr", "b@exemple.fr"]);
  });
});
