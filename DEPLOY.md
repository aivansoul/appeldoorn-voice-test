# Déploiement GitHub Pages

L'app est 100 % statique → GitHub Pages convient parfaitement (gratuit, HTTPS auto, pas de build).

## Option 1 — Repo dédié (le plus simple)

```bash
cd /Users/svetlanatotolina/Desktop/Appeldoorn/feedback-app

# 1. Initialiser un repo Git
git init
git add .
git commit -m "Initial commit"

# 2. Créer un repo GitHub vide (depuis github.com/new), nom : appeldoorn-voice-test
# 3. Pousser
git branch -M main
git remote add origin https://github.com/<TON_USER>/appeldoorn-voice-test.git
git push -u origin main

# 4. Activer Pages : repo Settings → Pages → Source : main / root → Save
```

URL après ~1 min : `https://<TON_USER>.github.io/appeldoorn-voice-test/`

## Option 2 — `gh` CLI (en une ligne)

```bash
cd /Users/svetlanatotolina/Desktop/Appeldoorn/feedback-app
git init && git add . && git commit -m "Initial commit"
gh repo create appeldoorn-voice-test --public --source=. --remote=origin --push
gh api -X POST repos/{owner}/appeldoorn-voice-test/pages \
  -f source[branch]=main -f source[path]=/
```

## Option 3 — Sous-dossier d'un repo existant

Si tu as déjà un repo (`Appeldoorn` par exemple) sur GitHub :
- pousse `feedback-app/` comme sous-dossier ;
- dans Pages, choisis `main` + `/feedback-app` comme path.

## Avant de partager le lien

1. Active le **mode partagé Supabase** (voir `README.md`) sinon chaque testeur a son propre dashboard.
2. Vérifie que l'agent ElevenLabs est bien live et accessible (widget ou tel).
3. Test rapide : ouvre l'URL sur mobile + desktop, clique sur 3 questions, vérifie que les KPIs bougent.

## Modifications post-déploiement

```bash
git add -A && git commit -m "Update questions" && git push
```

GitHub Pages se met à jour automatiquement en ~30 s.

## Custom domain (optionnel)

Tu peux brancher `test.appeldoorn-associes.be` sur la page :
1. Repo Settings → Pages → Custom domain → entrer le sous-domaine.
2. Côté DNS : ajouter un `CNAME` qui pointe vers `<TON_USER>.github.io`.
