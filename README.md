# Lissan (nom provisoire)

Tuteur d'arabe pour les enfants de la diaspora maghrébine : page d'accueil avec
liste d'attente, et premières leçons interactives sur l'alphabet arabe.

## Ce que contient le site

- `/` : page d'accueil et inscription à la liste d'attente.
- `/app` : l'app de l'enfant. Au premier passage, un parent crée le profil
  (prénom, âge, derja, objectifs).
- `/app/parler` : conversation à voix haute avec le tuteur IA, en derja, autour
  d'une situation (raconter sa journée, appeler mamie, au souk…).
- `/app/lire` : « Lire et écrire », qui regroupe l'alphabet, l'écriture de mots et le chakl.
- `/alphabet` : les 28 lettres, une leçon en cinq étapes pour chacune (découvrir la lettre,
  ses voyelles avec le chakl, la tracer, quiz, bravo).
- `/app/ecrire` : exercice d'écriture. Un mot en français, l'enfant l'écrit en arabe avec
  un clavier arabe à l'écran, l'app corrige lettre par lettre, puis montre le mot avec son
  chakl et pose une question sur un signe. Cinq thèmes, 39 mots.
- `/app/chakl` : guide des signes (fatha, damma, kasra, soukoun, chadda, tanwin).
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

**Voix du tuteur.** Avec `AZURE_SPEECH_KEY` et `AZURE_SPEECH_REGION`, le tuteur
parle avec les voix neuronales d'Azure Speech propres à chaque pays (Mouna pour
le Maroc, Amina pour l'Algérie, Reem pour la Tunisie), via `app/api/voix`. Sans
ces variables, l'app utilise la voix du navigateur, nettement plus robotique.
**Micro de l'enfant.** Avec les mêmes variables Azure, la voix de l'enfant est
enregistrée dans le navigateur, convertie en WAV puis transcrite par Azure Speech
en marocain, algérien ou tunisien (`app/api/ecoute`). Sans Azure, l'app tente la
reconnaissance vocale du navigateur, peu fiable sur iPhone et en derja.

## Coran

Le texte n'est ni saisi à la main ni généré : il vient du paquet `quran-json`
(version figée), qui reprend le texte othmani de l'Encyclopédie du Noble Coran
(quranenc.com), lecture Hafs. La récitation (Mahmoud Khalil Al-Husary) est lue
depuis everyayah.com. La lecture Warsh n'est pas encore proposée.

## Données de l'enfant

Le profil et la progression restent dans le navigateur (`localStorage`) : aucun
compte, rien n'est enregistré sur le serveur. Ce que l'enfant dit en
conversation (son enregistrement vocal et le texte) est envoyé à Azure Speech et à
l'API d'IA, avec son âge et sa derja, sans son prénom.

## Contenu des leçons

Tout le contenu de l'alphabet est dans `lib/alphabet.ts`. Les mots de l'exercice
d'écriture, avec leur chakl, sont dans `lib/mots.ts` ; la correction (aucune IA, donc
gratuite et prévisible) est dans `lib/ecriture.ts`. Les mots sont en arabe littéraire,
l'arabe qui s'écrit.

## À compléter avant le lancement

- Le prix (`[VOTRE PRIX]` dans la FAQ, `app/page.tsx`).
- Les mentions légales et la politique de confidentialité (pied de page).
- Une relecture du contenu des 28 lettres et des 39 mots (chakl compris) par un enseignant d'arabe.
- Des essais du tuteur avec de vrais enfants, dans les trois derjas.
- La lecture Warsh, annoncée sur la page d'accueil.
