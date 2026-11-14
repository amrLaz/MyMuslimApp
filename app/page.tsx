import Link from "next/link";
import WaitlistForm from "@/components/WaitlistForm";

const MODULES = [
  {
    ar: "كلام",
    title: "Parler en famille",
    text: "La derja marocaine, algérienne ou tunisienne, pour répondre à mamie sans passer au français. L'enfant parle, Lissan répond et corrige la prononciation.",
  },
  {
    ar: "كتابة",
    title: "Lire et écrire",
    text: "On commence par l'alphabet : les 28 lettres, leurs sons, leurs formes et le tracé au doigt. Puis le vocabulaire du quotidien et de l'école, pour suivre l'option arabe au collège ou au lycée.",
    link: { href: "/alphabet/ba", label: "Essayer la première leçon" },
  },
  {
    ar: "قرآن",
    title: "Apprendre le Coran",
    text: "Qaida, tajwid et courtes sourates, en Hafs ou en Warsh. Le texte vient de sources vérifiées : l'IA ne le réécrit jamais.",
  },
];

const STEPS = [
  {
    title: "Vous choisissez",
    text: "La derja de la famille, l'âge de l'enfant et l'objectif : parler, lire, ou réciter.",
  },
  {
    title: "L'enfant parle",
    text: "Des séances de 5 à 10 minutes, en conversation vocale, avec des petits jeux plutôt que des leçons.",
  },
  {
    title: "Vous suivez",
    text: "Un résumé chaque semaine : mots appris, sourates révisées, points à travailler.",
  },
];

const PROMISES = [
  {
    title: "Un complément, pas un remplaçant",
    text: "L'IA entraîne chaque jour. Pour le tajwid, un enseignant reste indispensable, et nous le disons clairement.",
  },
  {
    title: "Un Coran jamais généré",
    text: "Le texte et les récitations viennent de sources vérifiées. L'IA ne répond pas librement aux questions de religion.",
  },
  {
    title: "Les données des enfants protégées",
    text: "Consentement parental, données minimales, conformité RGPD. Pas de publicité.",
  },
  {
    title: "Des séances courtes",
    text: "Quelques minutes par jour valent mieux qu'une longue leçon que l'enfant subit.",
  },
];

const FAQ = [
  {
    q: "Pour quel âge ?",
    a: "De 6 à 14 ans, avec un parcours adapté à chaque tranche d'âge.",
  },
  {
    q: "Quelle derja est proposée ?",
    a: "Nous commençons par la darija marocaine, puis l'algérienne et la tunisienne selon la demande. Votre choix ci-dessus nous aide à décider de l'ordre.",
  },
  {
    q: "Lissan remplace-t-il un professeur ?",
    a: "Non. C'est un entraînement quotidien à la maison. Pour le tajwid et la mémorisation du Coran, nous recommandons de continuer avec un enseignant.",
  },
  {
    q: "Combien ça coûte ?",
    a: "Tarif de lancement : [VOTRE PRIX] € par mois et par famille. Les premières familles inscrites auront un essai gratuit.",
  },
];

export default function Home() {
  return (
    <main className="landing">
      <header className="container nav">
        <div className="brand">
          <span className="brand-name">Lissan</span>
          <span className="brand-ar" lang="ar" dir="rtl">لسان</span>
        </div>
        <nav className="nav-links" aria-label="Navigation principale">
          <Link href="/alphabet" className="nav-link">L'alphabet</Link>
          <a href="#inscription" className="btn-outline">Liste d'attente</a>
        </nav>
      </header>

      <section className="hero">
        <svg className="hero-motif" aria-hidden="true" viewBox="0 0 400 400">
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="80" y="80" width="240" height="240" />
            <rect x="80" y="80" width="240" height="240" transform="rotate(45 200 200)" />
            <rect x="120" y="120" width="160" height="160" />
            <rect x="120" y="120" width="160" height="160" transform="rotate(45 200 200)" />
            <circle cx="200" cy="200" r="46" />
          </g>
        </svg>
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Maroc · Algérie · Tunisie</p>
            <h1>Vos enfants comprennent l'arabe de la maison. Aidez-les à le parler.</h1>
            <p className="lead">
              Lissan est un tuteur vocal par IA pour les enfants de 6 à 14 ans : la derja de votre
              famille, l'arabe littéraire et la lecture du Coran, en quelques minutes par jour.
            </p>
            <WaitlistForm />
          </div>

          <div className="chat">
            <p className="chat-caption">Exemple · derja marocaine</p>
            <div className="chat-thread">
              <div className="bubble bubble-tutor">
                <p className="bubble-who">LISSAN</p>
                <p className="bubble-ar" lang="ar" dir="rtl">شنو درتي اليوم؟</p>
                <p className="muted">Chno drti lyoum ? · Qu'as-tu fait aujourd'hui ?</p>
              </div>
              <div className="bubble bubble-child">
                <p className="bubble-who">L'ENFANT</p>
                <p className="bubble-ar" lang="ar" dir="rtl">مشيت للمدرسة</p>
                <p className="muted">Mchit l-lmedrasa · Je suis allé à l'école</p>
              </div>
              <div className="bubble bubble-tutor">
                <p className="bubble-who">LISSAN</p>
                <p>Bravo ! Essaie maintenant : « Mchit l-lmedrasa m3a sahbi. »</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container modules">
        <h2>Trois façons de garder le lien avec la langue</h2>
        <p className="section-lead">
          Chaque enfant avance à son rythme, avec des séances courtes et un retour immédiat à voix
          haute.
        </p>
        <div className="cards">
          {MODULES.map((m) => (
            <div className="card" key={m.title}>
              <p className="card-ar" lang="ar" dir="rtl">{m.ar}</p>
              <h3>{m.title}</h3>
              <p className="muted">{m.text}</p>
              {m.link && (
                <p className="card-link">
                  <Link href={m.link.href}>{m.link.label} →</Link>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="how">
        <div className="container">
          <h2>Comment ça marche</h2>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <p className="step-num" aria-hidden="true">{i + 1}</p>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="parents">
        <div className="container">
          <h2>Pensé pour les parents</h2>
          <p className="section-lead">Ce que nous nous engageons à respecter dès le premier jour.</p>
          <div className="promises">
            {PROMISES.map((p) => (
              <div key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="faq">
        <h2>Questions fréquentes</h2>
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p className="muted">{f.a}</p>
          </details>
        ))}
      </section>

      <section className="container cta-wrap">
        <div className="cta">
          <h2>Que la langue de la maison ne se perde pas</h2>
          <p>Inscrivez-vous pour être parmi les premières familles à essayer Lissan.</p>
          <a href="#inscription" className="btn-cream">Rejoindre la liste d'attente</a>
        </div>
      </section>

      <footer className="container footer">
        <span>© Lissan (nom provisoire)</span>
        <span>[Mentions légales et politique de confidentialité à compléter]</span>
      </footer>
    </main>
  );
}
