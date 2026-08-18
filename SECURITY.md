# 🔒 Rapport de Sécurité - PLANORA 360

**Date** : 17 août 2026  
**Version** : 1.0  
**Score global** : 70% (17/20 points conformes)

---

## ✅ MESURES DE SÉCURITÉ IMPLÉMENTÉES

### 1. **Protection des secrets**
- ✅ Tous les secrets (JWT, DATABASE_URL, B2, etc.) dans `.env`
- ✅ `.env` présent dans `.gitignore`
- ✅ Aucun secret en dur dans le code

### 2. **Protection contre la force brute**
- ✅ **Rate limiting sur `/auth/login`** : 5 tentatives/minute
- ✅ **Rate limiting sur `/auth/register`** : 3 inscriptions/minute
- ✅ **Rate limiting global** : 10 requêtes/minute par défaut
- 📦 Module : `@nestjs/throttler`

### 3. **Hashage des mots de passe**
- ✅ Bcrypt avec 12 rounds (très fort)
- ✅ Jamais stockés en clair
- 📍 Fichiers : `auth.service.ts:55`, `users.service.ts:55`

### 4. **Autorisation côté backend**
- ✅ Guards NestJS sur tous les endpoints sensibles
- ✅ `@Roles()` decorator pour contrôle des rôles
- ✅ `@RequiresPlan()` decorator pour limites d'abonnement
- 📍 Fichiers : `roles.guard.ts`, `subscription.guard.ts`, `jwt-auth.guard.ts`

### 5. **Gestion des sessions**
- ✅ Access token : 45 minutes
- ✅ Refresh token : 7 jours, révocable
- ✅ Stockage sécurisé en base (PostgreSQL via Prisma)

### 6. **Validation des données**
- ✅ `ValidationPipe` global avec `whitelist: true`
- ✅ `forbidNonWhitelisted: true` (rejette les champs non déclarés)
- ✅ DTOs avec `class-validator`
- 📍 Fichier : `main.ts:19-25`

### 7. **Protection des uploads**
- ✅ **Limite de taille** :
  - Documents : 20 MB
  - Médias (capitalization) : 10 MB  
  - Imports Excel : 5 MB
- ✅ **Validation du type réel** (magic bytes) : JPEG, PNG, PDF, Office
- ✅ **Vérification extension ↔ contenu** : empêche fichiers déguisés
- 📍 Fichier : `documents/file-validator.ts`

### 8. **Filtrage des erreurs**
- ✅ **Filtre global** : masque stack traces en production
- ✅ **Logs sécurisés** : erreurs complètes loguées côté serveur uniquement
- ✅ Messages d'erreur génériques exposés au client
- 📍 Fichier : `common/filters/http-exception.filter.ts`

### 9. **Messages de connexion génériques**
- ✅ Même message pour email inexistant / mot de passe incorrect
- ✅ "Identifiants invalides" dans tous les cas
- 📍 Fichier : `auth.service.ts:77-89`

### 10. **CORS configuré**
- ✅ Code supporte le filtrage par domaine
- ⚠️ À vérifier sur Hostinger : `FRONTEND_URL` ne doit PAS être `*`

### 11. **HTTPS**
- ✅ Géré par Hostinger (terminaison TLS)
- ℹ️ Pas de redirection HTTP → HTTPS dans le code (géré upstream)

### 12. **Isolation des données**
- ✅ **Audit complet effectué le 18/08/2026** — 100% conforme
- ✅ 18 services audités : 0 vulnérabilité trouvée
- ✅ 17 controllers audités : tous passent correctement `organizationId`
- 📄 Voir [AUDIT-ORGANIZATIONID.md](AUDIT-ORGANIZATIONID.md) pour détails complets

---

## ⚠️ VULNÉRABILITÉS CONNUES (À SURVEILLER)

### 1. **Dépendances npm**
| Package | Vulnérabilité | Severité | Action |
| --- | --- | --- | --- |
| `xlsx` | Prototype Pollution, ReDoS | **HIGH** | ✅ **Corrigé** : Remplacé par `exceljs` |
| `prisma` / `deepmerge-ts` | Stack exhaustion | **HIGH** | ⏳ Nécessite downgrade 7.x → 6.x (breaking) |
| `exceljs` / `uuid` | Buffer overflow | **MODERATE** | ⏳ Nécessite downgrade 4.4 → 3.4 (breaking) |

**Recommandation** : Surveiller les mises à jour de Prisma 7.x et exceljs 4.x qui corrigeront ces vulnérabilités.

---

## 📋 ACTIONS RECOMMANDÉES (P2)

### Court terme (ce mois-ci)
1. ~~**Audit de l'isolation `organizationId`**~~ ✅ **TERMINÉ le 18/08/2026**
   - ✅ 37 fichiers vérifiés systématiquement
   - ✅ Aucun endpoint n'oublie ce filtre
   - 📄 Rapport : [AUDIT-ORGANIZATIONID.md](AUDIT-ORGANIZATIONID.md)

2. **Vérification/confirmation de l'email**
   - Implémenter un token de vérification à l'inscription
   - Envoyer un email via Resend
   - Bloquer la connexion tant que l'email n'est pas vérifié

3. **Signature des webhooks**
   - À implémenter quand les webhooks de paiement seront ajoutés
   - Vérifier signature HMAC avant traitement

### Moyen terme (prochain trimestre)
4. **Sauvegardes automatiques**
   - Vérifier que Neon fait des backups automatiques
   - **CRITIQUE** : Tester une restauration
   - Créer un script de backup manuel en secours (GitHub Actions)

5. **Monitoring de sécurité**
   - Alertes sur tentatives de brute force
   - Logs d'accès suspects (changements de rôle, suppressions massives)
   - Dashboard de sécurité pour les super admins

---

## 📊 CHECKLIST DE DÉPLOIEMENT

Avant chaque déploiement en production, vérifier :

- [ ] `FRONTEND_URL` sur Hostinger backend n'est PAS `*`
- [ ] `JWT_SECRET` et `JWT_REFRESH_SECRET` sont forts (32+ caractères aléatoires)
- [ ] `NODE_ENV=production` est bien défini
- [ ] Les logs ne contiennent pas de données sensibles
- [ ] `npm audit` ne montre aucune vulnérabilité **CRITICAL**
- [ ] Les limites de taille d'upload sont configurées
- [ ] HTTPS est forcé sur tous les domaines
- [ ] Les backups de base de données sont actifs

---

## 🔧 COMMANDES UTILES

### Audit de sécurité
```bash
cd backend
npm audit                    # Voir les vulnérabilités
npm audit fix               # Corriger automatiquement
npm audit fix --force       # Corriger avec breaking changes (à tester !)
```

### Test des limites
```bash
# Tester rate limiting (doit bloquer après 5 tentatives)
for i in {1..10}; do curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'; done

# Tester upload > 20 MB (doit rejeter)
curl -X POST http://localhost:3000/api/activities/xxx/documents \
  -F "file=@large-file.pdf" \
  -H "Authorization: Bearer <token>"
```

### Vérifier les secrets
```bash
# S'assurer qu'aucun secret n'est commité
git log --all -- '*env*' '*secret*'  # Doit être vide
grep -r "JWT_SECRET\|DATABASE_URL" backend/src/  # Ne doit trouver que des process.env
```

---

## 👥 RESPONSABILITÉS

| Domaine | Responsable | Fréquence |
| --- | --- | --- |
| Audit `npm audit` | DevOps | Hebdomadaire |
| Revue des logs | Backend Lead | Quotidien (prod) |
| Test de restauration backup | DevOps | Mensuel |
| Audit code de sécurité | Lead Dev | Par sprint |
| Formation équipe sécurité | CTO | Trimestriel |

---

## 📞 CONTACT SÉCURITÉ

En cas de découverte de vulnérabilité :
1. **NE PAS** créer d'issue publique
2. Contacter directement : security@planora360.com
3. Délai de réponse : < 48h

---

**Dernière mise à jour** : 18 août 2026  
**Dernier audit organizationId** : 18 août 2026 (100% conforme)  
**Prochain audit prévu** : 18 février 2027
