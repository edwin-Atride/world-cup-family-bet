
# Paris Coupe du Monde 2026 Famille

Application complète Next.js + Supabase + API-Football pour faire des pronostics en famille.

## Fonctions
- Connexion / inscription avec Supabase Auth
- Rôle admin et utilisateurs
- Affichage des 3 prochains matchs de la Coupe du Monde 2026
- Pronostic obligatoire : victoire domicile, nul, victoire extérieur
- Score facultatif
- Paris non modifiables
- 2 points si le résultat est correct
- 4 points si le score exact est correct
- Classement général
- Design mobile style Coupe du Monde / FIFA
- Synchronisation automatique API-Football via route `/api/sync`

## Installation locale
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase
1. Crée un projet Supabase.
2. Va dans SQL Editor.
3. Exécute `supabase/schema.sql`.
4. Dans Authentication > Providers, active Email.
5. Crée ton compte admin dans l'app.
6. Dans SQL Editor, exécute :
```sql
update profiles set role='admin' where email='ton-email-admin@example.com';
```

## Variables Vercel / .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FOOTBALL_API_KEY=
FOOTBALL_API_HOST=v3.football.api-sports.io
FOOTBALL_LEAGUE_ID=1
FOOTBALL_SEASON=2026
ADMIN_EMAIL=ton-email-admin@example.com
CRON_SECRET=un-secret-long
```

## API-Football
Crée une clé gratuite sur API-Sports / API-Football et mets-la dans `FOOTBALL_API_KEY`.

## Synchroniser les matchs
Admin > Synchroniser API-Football.
Ou appelle :
`/api/sync?manual=1`

## Calculer les points
Admin > Calculer les points.
Ou appelle :
`/api/score?manual=1`

## GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/world-cup-family-bet.git
git push -u origin main
```

## Vercel
1. Import Project depuis GitHub.
2. Ajoute toutes les variables d'environnement.
3. Deploy.

## Note importante
Dans `vercel.json`, remplace `change-moi` par la même valeur que `CRON_SECRET`.
=======

