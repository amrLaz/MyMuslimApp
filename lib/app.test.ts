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

describe("écriture", () => {
  it("accepte la bonne réponse avec ou sans chakl, et signale la hamza oubliée", async () => {
    const { check } = await import("./ecriture");
    expect(check("قِطّ", "قط")).toMatchObject({ ok: true, exact: true });
    expect(check("قِطّ", "قِطّ")).toMatchObject({ ok: true, exact: true });
    expect(check("أَسَد", "اسد")).toMatchObject({ ok: true, exact: false });
    expect(check("بَاب", "bab").nonArabic).toBe(true);
    expect(check("بَاب", "").nonArabic).toBe(true);
  });

  it("repère les lettres qui ne diffèrent que par les points", async () => {
    const { check, advice } = await import("./ecriture");
    const r = check("بَيْت", "تيت");
    expect(r.ok).toBe(false);
    expect(r.ops[0]).toMatchObject({ type: "sub", want: "ب", got: "ت" });
    expect(advice(r.ops, false)[0]).toContain("ressemble");
    expect(advice(r.ops, false)[0]).not.toContain("Ba");
    expect(advice(r.ops, true)[0]).toContain("Il fallait Ba");
  });

  it("repère une lettre manquante ou en trop", async () => {
    const { check, advice } = await import("./ecriture");
    const missing = check("كِتَاب", "كتب");
    expect(missing.ops.filter((o) => o.type === "del")).toEqual([{ type: "del", want: "ا" }]);
    expect(advice(missing.ops, false)).toEqual(["Il manque une lettre."]);
    expect(advice(missing.ops, true)).toEqual(["Il manque la lettre Alif."]);
    const extra = check("بَاب", "بااب");
    expect(extra.ops.filter((o) => o.type === "ins")).toHaveLength(1);
    expect(advice(extra.ops, false)[0]).toContain("en trop");
  });

  it("a des mots complets : chakl présent, lettres arabes, pas de doublon", async () => {
    const { ALL_WORDS, chaklQuestion, clusters } = await import("./mots");
    const { stripMarks } = await import("./ecriture");
    const skeletons = ALL_WORDS.map((w) => stripMarks(w.ar));
    expect(new Set(skeletons).size).toBe(ALL_WORDS.length);
    expect(new Set(ALL_WORDS.map((w) => w.fr)).size).toBe(ALL_WORDS.length);
    for (const w of ALL_WORDS) {
      expect(stripMarks(w.ar), w.fr).toMatch(/^[ء-ي]+$/);
      expect(w.ar.length, w.fr).toBeGreaterThan(stripMarks(w.ar).length);
      expect(chaklQuestion(w.ar), w.fr).not.toBeNull();
      expect(w.translit && w.fr).toBeTruthy();
    }
    expect(clusters("قِطّ").map((c) => c.base)).toEqual(["ق", "ط"]);
    expect(chaklQuestion("كَلْب")).toEqual({ base: "ك", answer: "َ" });
  });

  it("donne les voyelles de chaque lettre", async () => {
    const { LETTERS, letterVowels } = await import("./alphabet");
    expect(letterVowels(LETTERS.find((l) => l.id === "ba")!).map((v) => v.say)).toEqual(["ba", "bou", "bi", "b"]);
    expect(letterVowels(LETTERS.find((l) => l.id === "alif")!).map((v) => v.say)).toEqual(["a", "ou", "i"]);
    for (const l of LETTERS) expect(letterVowels(l).length).toBeGreaterThanOrEqual(3);
  });
});

describe("niveaux", () => {
  it("a sept niveaux de huit mots qui existent tous", async () => {
    const { LEVELS } = await import("./niveaux");
    expect(LEVELS.map((l) => l.id)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    for (const l of LEVELS) {
      expect(l.words, l.title).toHaveLength(8);
      expect(new Set(l.words.map((w) => w.ar)).size, l.title).toBe(8);
    }
  });

  it("n'ouvre un niveau que si le précédent est réussi", async () => {
    const { LEVELS, isUnlocked } = await import("./niveaux");
    expect(isUnlocked(LEVELS[0], {})).toBe(true);
    expect(isUnlocked(LEVELS[1], {})).toBe(false);
    expect(isUnlocked(LEVELS[1], { "1": { passed: false, stars: 0 } })).toBe(false);
    expect(isUnlocked(LEVELS[1], { "1": { passed: true, stars: 1 } })).toBe(true);
    expect(isUnlocked(LEVELS[3], { "1": { passed: true, stars: 3 }, "2": { passed: true, stars: 3 } })).toBe(false);
  });

  it("donne les étoiles selon les mots écrits du premier coup, et aucune sans réussite", async () => {
    const { starsFor } = await import("./niveaux");
    expect([starsFor(5, 5), starsFor(6, 2), starsFor(6, 5), starsFor(8, 6), starsFor(8, 7), starsFor(8, 8)]).toEqual([0, 1, 2, 2, 3, 3]);
  });

  it("vérifie le chakl lettre par lettre", async () => {
    const { checkChakl, chaklAdvice } = await import("./ecriture");
    expect(checkChakl("كَلْب", "كَلْب").ok).toBe(true);
    expect(checkChakl("جَدَّة", "جَدَّة").ok).toBe(true);
    // chadda et voyelle dans l'autre ordre : même mot
    expect(checkChakl("جَدَّة", "جَدَّة".replace("َّ", "َّ")).ok).toBe(true);
    // lettres justes, chakl oublié
    const none = checkChakl("كَلْب", "كلب");
    expect(none.ok).toBe(false);
    expect(none.marks.filter((m) => !m.ok).map((m) => m.base)).toEqual(["ك", "ل"]);
    expect(chaklAdvice(none.marks, false)[0]).toBe("Vérifie le chakl sur la lettre Kaf.");
    expect(chaklAdvice(none.marks, true)[0]).toContain("il fallait : fatha");
    // mauvaise voyelle
    const wrong = checkChakl("كَلْب", "كُلْب");
    expect(wrong.marks.filter((m) => !m.ok).map((m) => m.base)).toEqual(["ك"]);
    // lettres fausses : on corrige d'abord les lettres
    const letters = checkChakl("كَلْب", "كَتْب");
    expect(letters.marks).toEqual([]);
    expect(letters.ops.some((o) => o.type === "sub")).toBe(true);
  });
});

describe("niveaux de l'alphabet et de la conversation", () => {
  it("répartit les 28 lettres en 4 niveaux, chacune une seule fois, dans l'ordre", async () => {
    const { ALPHABET_LEVELS, LETTERS } = await import("./alphabet");
    expect(ALPHABET_LEVELS.flatMap((l) => l.ids)).toEqual(LETTERS.map((l) => l.id));
    expect(ALPHABET_LEVELS.map((l) => l.ids.length)).toEqual([7, 7, 7, 7]);
  });

  it("ouvre un niveau de l'alphabet après 6 lettres apprises sur 7", async () => {
    const { ALPHABET_LEVELS, levelUnlocked } = await import("./alphabet");
    const ids = ALPHABET_LEVELS[0].ids;
    expect(levelUnlocked(1, [])).toBe(true);
    expect(levelUnlocked(2, ids.slice(0, 5))).toBe(false);
    expect(levelUnlocked(2, ids.slice(0, 6))).toBe(true);
    expect(levelUnlocked(3, ids.slice(0, 6))).toBe(false);
  });

  it("ouvre un niveau de conversation quand les deux situations précédentes sont terminées", async () => {
    const { SCENARIOS, SCENARIO_LEVELS, scenarioUnlocked } = await import("./scenarios");
    expect(SCENARIO_LEVELS).toHaveLength(3);
    for (const l of SCENARIO_LEVELS) expect(SCENARIOS.filter((s) => s.level === l.n)).toHaveLength(2);
    expect(scenarioUnlocked(1, [])).toBe(true);
    expect(scenarioUnlocked(2, ["bonjour"])).toBe(false);
    expect(scenarioUnlocked(2, ["bonjour", "famille"])).toBe(true);
    expect(scenarioUnlocked(3, ["bonjour", "famille", "table"])).toBe(false);
  });

  it("adapte la consigne du tuteur au niveau", async () => {
    const { SCENARIOS } = await import("./scenarios");
    const { systemPrompt } = await import("./tuteur");
    const at = (id: string) => systemPrompt({ derja: "ma", age: 8, scenario: SCENARIOS.find((s) => s.id === id)! });
    expect(at("bonjour")).toContain("Niveau 1, débutant");
    expect(at("table")).toContain("Niveau 2");
    expect(at("mamie")).toContain("Niveau 3");
  });
});

describe("niveaux du Coran", () => {
  it("répartit les neuf sourates en trois niveaux, chacune une seule fois", async () => {
    const { COURSE, SURAHS } = await import("./coran");
    expect(COURSE.flatMap((l) => l.ids).sort((a, b) => a - b)).toEqual(SURAHS.map((s) => s.id).sort((a, b) => a - b));
    expect(COURSE.map((l) => l.ids.length)).toEqual([3, 3, 3]);
  });

  it("ouvre un niveau quand deux sourates du précédent sont sues par cœur", async () => {
    const { courseUnlocked } = await import("./coran");
    expect(courseUnlocked(1, [])).toBe(true);
    expect(courseUnlocked(2, [1])).toBe(false);
    expect(courseUnlocked(2, [1, 112])).toBe(true);
    expect(courseUnlocked(3, [1, 112, 108])).toBe(false);
    expect(courseUnlocked(3, [113, 114])).toBe(true);
  });

  it("vérifie les mots des niveaux 6 et 7, y compris le chakl", async () => {
    const { LEVELS } = await import("./niveaux");
    const { checkChakl } = await import("./ecriture");
    for (const l of LEVELS.slice(5)) for (const w of l.words) expect(checkChakl(w.ar, w.ar).ok, w.fr).toBe(true);
    const deux = LEVELS[6].words.find((w) => w.fr === "Deux")!;
    expect(checkChakl(deux.ar, "اثنان").ok).toBe(false);
    expect(checkChakl(deux.ar, deux.ar).ok).toBe(true);
  });
});

describe("révision espacée", () => {
  const day = (s: string) => new Date(`${s}T10:00:00`);

  it("espace de plus en plus les révisions réussies et ramène un raté au lendemain", async () => {
    const { enroll, grade, dueKeys } = await import("./revision");
    let deck = enroll({}, "l:ba", day("2026-11-01"));
    expect(deck["l:ba"]).toEqual({ box: 1, due: "2026-11-02" });
    expect(dueKeys(deck, day("2026-11-01"))).toEqual([]);
    expect(dueKeys(deck, day("2026-11-02"))).toEqual(["l:ba"]);
    deck = grade(deck, "l:ba", true, day("2026-11-02"));
    expect(deck["l:ba"]).toEqual({ box: 2, due: "2026-11-05" });
    deck = grade(deck, "l:ba", true, day("2026-11-05"));
    expect(deck["l:ba"]).toEqual({ box: 3, due: "2026-11-12" });
    deck = grade(deck, "l:ba", false, day("2026-11-12"));
    expect(deck["l:ba"]).toEqual({ box: 1, due: "2026-11-13" });
    // un élément déjà inscrit garde sa place ; un mot raté est à revoir le jour même
    expect(enroll(deck, "l:ba", day("2026-12-01"))).toBe(deck);
    expect(enroll({}, "m:كلب", day("2026-11-01"), true)["m:كلب"].due).toBe("2026-11-01");
  });

  it("plafonne à la boîte 5 et compte les éléments acquis", async () => {
    const { grade, deckStats } = await import("./revision");
    let deck: Record<string, { box: number; due: string }> = { a: { box: 5, due: "2026-11-01" }, b: { box: 2, due: "2026-11-01" } };
    deck = grade(deck, "a", true, day("2026-11-01"));
    expect(deck.a).toEqual({ box: 5, due: "2026-12-01" });
    expect(deckStats(deck)).toEqual({ total: 2, mastered: 1 });
  });

  it("compte les jours de suite, en tolérant que la journée ne soit pas encore faite", async () => {
    const { streak } = await import("./revision");
    const now = day("2026-11-14");
    expect(streak([], now)).toBe(0);
    expect(streak(["2026-11-14", "2026-11-13", "2026-11-12"], now)).toBe(3);
    expect(streak(["2026-11-13", "2026-11-12"], now)).toBe(2);
    expect(streak(["2026-11-12", "2026-11-11"], now)).toBe(0);
    expect(streak(["2026-11-14", "2026-11-12"], now)).toBe(1);
  });

  it("fabrique un exercice valide pour chaque lettre et chaque mot", async () => {
    const { buildExercises, rngFrom } = await import("./exercices");
    const { LETTERS } = await import("./alphabet");
    const { ALL_WORDS } = await import("./mots");
    const { stripMarks } = await import("./ecriture");
    const keys = [...LETTERS.map((l) => `l:${l.id}`), ...ALL_WORDS.map((w) => `m:${stripMarks(w.ar)}`)];
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const list = buildExercises(keys, rngFrom(seed));
      expect(list).toHaveLength(keys.length);
      for (const ex of list) {
        if (ex.options) {
          expect(ex.options, ex.key).toHaveLength(3);
          expect(ex.options.filter((o) => o.correct), ex.key).toHaveLength(1);
          expect(new Set(ex.options.map((o) => o.label)).size, ex.key).toBe(3);
          expect(Boolean(ex.show) || Boolean(ex.audio), ex.key).toBe(true);
        } else {
          expect([...ex.tiles!].sort().join(""), ex.key).toBe([...ex.answer!].sort().join(""));
          expect(ex.tiles!.join(""), ex.key).not.toBe(ex.answer);
        }
      }
    }
    expect(buildExercises(["l:inconnu", "m:xyz"], rngFrom(1))).toEqual([]);
  });

  it("propose la suite selon les objectifs de la famille", async () => {
    const { nextStep } = await import("./suite");
    const none = { letters: [], levels: {}, talks: [], surahs: [] };
    expect(nextStep(["lire"], none)?.href).toBe("/alphabet/alif");
    expect(nextStep(["parler"], none)?.href).toBe("/app/parler/bonjour");
    expect(nextStep(["coran"], none)?.href).toBe("/app/coran/1");
    // après quatre lettres, on passe à l'écriture
    expect(nextStep(["lire"], { ...none, letters: ["alif", "ba", "ta", "tha"] })?.href).toBe("/app/ecrire/1");
    // la situation suivante du même niveau, puis le niveau 2 une fois les deux terminées
    expect(nextStep(["parler"], { ...none, talks: ["bonjour"] })?.href).toBe("/app/parler/famille");
    expect(nextStep(["parler"], { ...none, talks: ["bonjour", "famille"] })?.href).toBe("/app/parler/journee");
  });

  it("calcule les points à partir du journal", async () => {
    const { points } = await import("./store");
    const at = "2026-11-14T10:00:00Z";
    const w = { ar: "x", translit: "x", fr: "x" };
    expect(points([
      { at, kind: "lettre", id: "ba", label: "Ba" },
      { at, kind: "ecriture", id: "niveau-1", label: "", words: [w, w, w] },
      { at, kind: "conversation", id: "bonjour", label: "" },
      { at, kind: "sourate", id: "112", label: "" },
      { at, kind: "revision", id: "j", label: "", score: 7 },
    ])).toBe(20 + 30 + 30 + 15 + 35);
  });
});
