# V3 Tableau final Coupe du Monde

Cette version garde les comptes Supabase existants et remplace la page Paris par un tableau final :

- 16èmes de finale → 8èmes → quarts → demis → finale
- Admin : initialisation du tableau, équipes, dates, scores officiels, tirs au but
- Utilisateurs : pronostics sur chaque match en cliquant sur la carte
- Verrouillage des pronostics 10 minutes avant le coup d'envoi
- Vainqueur qui avance automatiquement dans le match suivant
- Croix rouge sur l'équipe prédite si elle est éliminée
- Points : bon vainqueur = 1, score exact = +2, tirs au but juste = +2, tirs au but faux = -1

## À faire dans Supabase

Dans Supabase → SQL Editor, exécute :

```sql
-- fichier à copier/coller :
supabase/bracket_v3_migration.sql
```

## Utilisation admin

1. Va sur `/admin`.
2. Clique sur `Initialiser le tableau final`.
3. Remplis les équipes des 16èmes et les dates.
4. Après chaque match, mets le score officiel.
5. Si le match va aux tirs au but, coche l'option et choisis le vainqueur.
6. Le vainqueur remonte automatiquement au tour suivant.
7. Clique sur `Calculer les points` après avoir mis les résultats.

## GitHub / Vercel

```bash
git add .
git commit -m "Add V3 knockout bracket"
git push origin main
```

Vercel redéploiera automatiquement.
