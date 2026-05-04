# Appeldoorn Voice Agent — Feedback App

Page de test à partager avec l'équipe pour évaluer l'agent vocal.

- **230 questions** : 200 ancrées sur la KB (Appeldoorn + Crelan + Assurance), 30 cas piégés (emails/noms compliqués, prompt injections, hallucinations, données sensibles, comportements difficiles).
- **10 personas** pour donner du contexte aux testeurs.
- **Dashboard temps réel** : couverture par thème, % bien répondu, hallucinations, top testeurs.
- **Mobile-first** : utilisable depuis smartphone pendant l'appel.
- **Apple-style minimaliste** : gris + azure clair.

## Modes de fonctionnement

### Mode local (par défaut, zéro config)

Chaque testeur voit ses propres résultats stockés dans son navigateur (localStorage).
Permet d'exporter en CSV.

### Mode partagé (recommandé pour équipe)

Toute l'équipe voit le même dashboard, mis à jour à chaque clic + auto-refresh 30s.
Backend = Supabase EU (déjà utilisé pour le RAG).

**Setup en 3 étapes** :

1. **Créer la table** : Supabase Dashboard → SQL Editor → coller [`supabase-setup.sql`](supabase-setup.sql) → Run.
2. **Récupérer la clé anon** : Supabase Dashboard → Project Settings → API → copier la **anon public key**.
3. **Activer dans `index.html`** : éditer le bloc `window.SUPABASE_CONFIG` :
   ```js
   window.SUPABASE_CONFIG = {
     url: "https://obifivunikgggwvxsnmd.supabase.co",
     anonKey: "eyJhbGciOi…",
     table: "voice_agent_feedback"
   };
   ```

La sécurité est gérée par RLS Supabase :
- la clé `anon` ne peut qu'**insérer** un feedback et **lire** les agrégats ;
- aucune autre table n'est exposée ;
- contraintes serveur sur la longueur des champs (`tester`, `category`).

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page complète (header + hero + form + dashboard) |
| `style.css`  | Apple-style minimaliste, mobile-first, responsive |
| `questions.js` | Banque des 230 questions + 10 personas |
| `app.js` | Logique : state, Supabase REST, dashboard live |
| `supabase-setup.sql` | Création table + RLS pour mode partagé |
| `DEPLOY.md` | Instructions GitHub Pages |

## Développement local

```bash
cd feedback-app
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Aucun build, aucun bundler — vanilla HTML/CSS/JS.

## KPIs du dashboard

- **Q. testées** : nombre de questions distinctes notées (sur 230).
- **% Bien répondu** : ratio des notes "Bien" sur le total noté (hors "pas posée").
- **Pas d'info** : nombre de questions où l'agent aurait dû savoir mais n'a pas.
- **Hallucinations + tech** : combinaison hallucinations + problèmes techniques.
- **Couverture par thème** : % de questions du thème déjà testées.
- **Qualité par thème** : % bien répondu, code couleur (vert ≥75 %, orange ≥50 %, rouge sinon).
- **Top testeurs** : 8 contributeurs les plus actifs.

## Échelle de notation

| Bouton | Sens |
|---|---|
| ✅ Bien | Réponse juste, claire, conforme à la KB / au comportement attendu |
| 🟡 Moyen | Réponse partiellement juste mais imprécise, lente, ou maladroite |
| ❓ Pas d'info | L'agent n'a pas trouvé l'info, mais elle existe dans la KB → fix RAG/KB |
| ⚠️ Hallucine | L'agent a inventé / contredit la KB / a confirmé une fausse hypothèse |
| 🔌 Pb tech. | L'agent a coupé l'appel, s'est répété en boucle, n'a rien dit, etc. |
| ✕ Pas posée | (cette question n'a pas été posée pendant ce test) |

Les notes "pas posée" ne comptent pas dans le ratio "% Bien répondu".
