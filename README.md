# Lissan (nom provisoire)

Tuteur d'arabe pour les enfants de la diaspora maghrébine : page d'accueil avec
liste d'attente, et premières leçons interactives sur l'alphabet arabe.

## Ce que contient le site

- `/` : page d'accueil et inscription à la liste d'attente (e-mail + derja de la famille).
- `/alphabet` : les 28 lettres, avec la progression de l'enfant.
- `/alphabet/<lettre>` : une leçon en quatre étapes (découvrir la lettre, la tracer
  au doigt, quiz, bravo). Exemple : `/alphabet/ba`.

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

## Contenu des leçons

Tout le contenu de l'alphabet est dans `lib/alphabet.ts`. La progression de
l'enfant reste dans son navigateur (`localStorage`) : aucun compte, rien n'est
envoyé au serveur. Le son des lettres utilise la synthèse vocale arabe de l'appareil.

## À compléter avant le lancement

- Le prix (`[VOTRE PRIX]` dans la FAQ, `app/page.tsx`).
- Les mentions légales et la politique de confidentialité (pied de page).
- Une relecture du contenu des 28 lettres par un enseignant d'arabe.
