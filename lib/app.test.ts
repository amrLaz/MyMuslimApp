import { describe, expect, it } from "vitest";
import { BASMALA, SURAHS, getSurah, verseAudio } from "./coran";
import { SCENARIOS } from "./scenarios";
import { lastWeek, type Activity } from "./store";
import { MAX_CHILD_TURNS, TutorReply, childTurns, parseTutorRequest, systemPrompt } from "./tuteur";

describe("tuteur", () => {
  const base = { derja: "ma", age: 8, scenario: "journee" };
  const tutor = { role: "tutor", ar: "شنو درتي اليوم؟", fr: "Qu'as-tu fait aujourd'hui ?" };
  const child = { role: "child", text: " mchit l-lmedrasa " };

  it("accepte l'ouverture de séance et une conversation qui alterne", () => {
    expect(parseTutorRequest({ ...base, turns: [] }).ok).toBe(true);
    const parsed = parseTutorRequest({ ...base, turns: [tutor, child] });
    expect(parsed.ok && parsed.request.turns[1]).toEqual({ role: "child", text: "mchit l-lmedrasa" });
    expect(parsed.ok && parsed.request.scenario.id).toBe("journee");
  });

  it("refuse ce qui sort du cadre", () => {
    const bad = (extra: object) => parseTutorRequest({ ...base, turns: [tutor, child], ...extra }).ok;
    expect(bad({ age: 5 })).toBe(false);
    expect(bad({ age: 15 })).toBe(false);
    expect(bad({ derja: "eg" })).toBe(false);
    expect(bad({ scenario: "autre" })).toBe(false);
    expect(bad({ turns: [child] })).toBe(false); // l'enfant ne parle pas en premier
    expect(bad({ turns: [tutor] })).toBe(false); // on attend une réponse de l'enfant
    expect(bad({ turns: [tutor, { role: "child", text: "x".repeat(301) }] })).toBe(false);
    const long = Array.from({ length: MAX_CHILD_TURNS + 2 }, () => [tutor, child]).flat();
    expect(bad({ turns: long })).toBe(false);
  });

  it("compte les réponses de l'enfant", () => {
    const parsed = parseTutorRequest({ ...base, turns: [tutor, child, tutor, child] });
    expect(parsed.ok && childTurns(parsed.request.turns)).toBe(2);
  });

  it("adapte la consigne à la derja, à l'âge et à la situation, sans prénom", () => {
    const prompt = systemPrompt({ derja: "dz", age: 11, scenario: SCENARIOS[2] });
    expect(prompt).toContain("derja algérienne");
    expect(prompt).toContain("11 ans");
    expect(prompt).toContain(SCENARIOS[2].brief);
  });

  it("valide la forme d'une réponse du tuteur", () => {
    const phrase = { ar: "مزيان", translit: "mezyan", fr: "bien" };
    expect(TutorReply.safeParse({ ...phrase, correction: null, aide: phrase, mots: [phrase], fin: false }).success).toBe(true);
    expect(TutorReply.safeParse({ ...phrase, mots: [] }).success).toBe(false);
  });
});

describe("coran", () => {
  it("contient les sourates attendues avec tous leurs versets", () => {
    const counts = Object.fromEntries(SURAHS.map((s) => [s.id, s.verses.length]));
    expect(counts).toEqual({ 1: 7, 103: 3, 108: 3, 109: 6, 110: 3, 111: 5, 112: 4, 113: 5, 114: 6 });
    for (const s of SURAHS) {
      expect(s.verses.length).toBe(s.total_verses);
      for (const v of s.verses) expect(v.text.length).toBeGreaterThan(0);
    }
  });

  it("prend la basmala dans la Fatiha et construit l'adresse de la récitation", () => {
    expect(BASMALA).toBe(getSurah(1)!.verses[0]);
    expect(verseAudio(112, 4)).toBe("https://everyayah.com/data/Husary_128kbps/112004.mp3");
  });
});

describe("suivi parents", () => {
  it("ne garde que les 7 derniers jours", () => {
    const now = new Date("2026-11-14T12:00:00Z");
    const at = (d: string): Activity => ({ at: d, kind: "lettre", id: "ba", label: "Ba" });
    const week = lastWeek([at("2026-11-01T10:00:00Z"), at("2026-11-07T10:00:00Z"), at("2026-11-14T09:00:00Z")], now);
    expect(week.map((a) => a.at)).toEqual(["2026-11-14T09:00:00Z"]);
  });
});

describe("voix", () => {
  it("choisit la voix du pays et échappe le texte", async () => {
    const { buildSsml, parseSpeechRequest, VOICES } = await import("./voix");
    expect(VOICES.dz.name).toBe("ar-DZ-AminaNeural");
    const ssml = buildSsml("ma", 'a < b & "c"');
    expect(ssml).toContain('name="ar-MA-MounaNeural"');
    expect(ssml).toContain("a &lt; b &amp; &quot;c&quot;");
    expect(parseSpeechRequest({ derja: "tn", text: " مرحبا " })).toEqual({ ok: true, derja: "tn", text: "مرحبا" });
    expect(parseSpeechRequest({ derja: "eg", text: "x" }).ok).toBe(false);
    expect(parseSpeechRequest({ derja: "ma", text: "x".repeat(301) }).ok).toBe(false);
    expect(parseSpeechRequest({ derja: "ma", text: "  " }).ok).toBe(false);
  });
});

describe("wav", () => {
  it("écrit un en-tête WAV 16 bits mono valide", async () => {
    const { pcm16Wav } = await import("./wav");
    const blob = pcm16Wav(new Float32Array([0, 1, -1, 2]), 16000);
    const view = new DataView(await blob.arrayBuffer());
    const tag = (o: number) => String.fromCharCode(...[0, 1, 2, 3].map((i) => view.getUint8(o + i)));
    expect([tag(0), tag(8), tag(36)]).toEqual(["RIFF", "WAVE", "data"]);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint32(40, true)).toBe(8);
    expect(blob.size).toBe(44 + 8);
    expect([view.getInt16(46, true), view.getInt16(48, true), view.getInt16(50, true)]).toEqual([32767, -32768, 32767]);
  });
});
