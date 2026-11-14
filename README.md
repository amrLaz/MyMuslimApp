# Lissan (nom provisoire)

Tuteur d'arabe pour les enfants de la diaspora maghrébine : page d'accueil avec
liste d'attente, et premières leçons interactives sur l'alphabet arabe.

## Ce que contient le site

- `/` : page d'accueil et inscription à la liste d'attente.
- `/app` : l'app de l'enfant. Au premier passage, un parent crée le profil
  (prénom, âge, derja, objectifs).
- `/app/parler` : conversation à voix haute avec le tuteur IA, en derja, autour
  d'une situation (raconter sa journée, appeler mamie, au souk…).
- `/alphabet` : les 28 lettres, une leçon en quatre étapes pour chacune.
- `/app/coran` : courtes sourates, écoute verset par verset et répétition.
- `/app/parents` : résumé des 7 derniers jours et effacement des données.

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # tests unitaires
npm run build && npm start   # version de production
```

## Liste d'attente

Les inscriptions sont ajoutées à `data/waitlist.jsonl` (une ligne JSON par
famille : e-mail, pays, date). Le chemin se change avec la variable
`WAITLIST_FILE`. Ce fichier contient des données personnelles : il est exclu de git.

Ce stockage suppose un serveur avec un disque persistant. Sur un hébergement
sans disque (Vercel, Netlify…), remplacez `saveSignup` dans `lib/waitlist.ts`
par une écriture en base de données.

## Tuteur IA

Le tuteur appelle l'API Anthropic depuis le serveur (`app/api/tuteur/route.ts`).
Il lui faut une clé dans la variable `ANTHROPIC_API_KEY` ; sans elle, l'écran
de conversation affiche que le tuteur n'est pas configuré. Le modèle se change
avec `TUTOR_MODEL`. La consigne du tuteur et ses garde-fous sont dans
`lib/tuteur.ts`, les situations dans `lib/scenarios.ts`.

Le micro et la voix du tuteur utilisent la reconnaissance et la synthèse
vocales du navigateur : leur qualité en derja dépend de l'appareil.

## Coran

Le texte n'est ni saisi à la main ni généré : il vient du paquet `quran-json`
(version figée), qui reprend le texte othmani de l'Encyclopédie du Noble Coran
(quranenc.com), lecture Hafs. La récitation (Mahmoud Khalil Al-Husary) est lue
depuis everyayah.com. La lecture Warsh n'est pas encore proposée.

## Données de l'enfant

Le profil et la progression restent dans le navigateur (`localStorage`) : aucun
compte, rien n'est enregistré sur le serveur. Seul ce que l'enfant dit en
conversation est envoyé à l'API d'IA, avec son âge et sa derja, sans son prénom.

## Contenu des leçons

Tout le contenu de l'alphabet est dans `lib/alphabet.ts`.

## À compléter avant le lancement

- Le prix (`[VOTRE PRIX]` dans la FAQ, `app/page.tsx`).
- Les mentions légales et la politique de confidentialité (pied de page).
- Une relecture du contenu des 28 lettres par un enseignant d'arabe.
- Des essais du tuteur avec de vrais enfants, dans les trois derjas.
- La lecture Warsh, annoncée sur la page d'accueil.
