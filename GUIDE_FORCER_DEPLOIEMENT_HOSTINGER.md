# 🚀 GUIDE : Forcer le Redéploiement sur Hostinger

## 📋 Résumé des Problèmes

1. ✅ **Code corrigé localement** (participants, filtres, selects)
2. ✅ **Code pusé sur GitHub** (commit 097e5cd + nouveau)
3. ❌ **Hostinger n'a PAS déployé** les derniers commits

---

## 🔧 Solution : Forcer le Redéploiement Manuel

### Étape 1 : Se Connecter à Hostinger

1. Va sur **https://hostinger.com**
2. **Connexion** avec tes identifiants
3. Va dans **"Websites"** ou **"Mes sites"**

### Étape 2 : Trouver Ton Projet Backend

Cherche le projet avec l'URL :
```
firebrick-lyrebird-183958.hostingersite.com
```

C'est ton **backend API NestJS**.

### Étape 3 : Forcer le Redéploiement

Selon le type d'hébergement Hostinger, cherche :

**Option A - GitHub Integration**
1. Clique sur **"Git"** ou **"GitHub"** dans le menu
2. Cherche **"Deploy"** ou **"Redeploy"**
3. Clique sur **"Deploy Now"** ou **"Redeploy from main"**

**Option B - Build & Deploy**
1. Va dans **"Build & Deploy"** ou **"Deployments"**
2. Clique sur **"Trigger Deployment"**
3. Sélectionne la branche **"main"**

**Option C - SSH Manuel**
```bash
# Se connecter en SSH
ssh username@firebrick-lyrebird-183958.hostingersite.com

# Aller dans le répertoire du projet
cd domains/firebrick-lyrebird-183958.hostingersite.com/backend

# Pull les derniers commits
git pull origin main

# Rebuild
npm install
npm run build

# Redémarrer le serveur
pm2 restart backend
# OU
npm run start
```

### Étape 4 : Vérifier le Déploiement

Attends 2-3 minutes puis teste :

```bash
curl https://firebrick-lyrebird-183958.hostingersite.com/api/
# Devrait retourner du JSON NestJS
```

---

## 🧪 Tester les Corrections

### 1. Création Participant

1. Va sur `/participants/new`
2. Remplis le formulaire (laisse "Montant" vide)
3. Clique "Enregistrer"
4. ✅ **Devrait fonctionner sans erreur**

### 2. Filtres Dashboard

1. Va sur `/dashboard`
2. Change "Tous les plans" → Sélectionne un plan
3. Change "Toute la période" → "Ce mois"
4. ✅ **Les données doivent se rafraîchir**

### 3. Selects Améliorés

1. Ouvre n'importe quel select
2. ✅ **Design moderne : rounded-xl, bleu, animations**

---

## 📊 Vérifier les Logs Backend

Sur Hostinger, va dans :
- **"Logs"** ou **"Error Logs"**
- Cherche des erreurs récentes
- Vérifie que le serveur a bien démarré

Logs attendus :
```
[Nest] Application successfully started
Listening on port 3000
```

---

## ⚠️ Si Ça Ne Marche Toujours Pas

### Cas 1 : Le Backend Ne Démarre Pas

Vérifie les **variables d'environnement** sur Hostinger :

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=ton-secret-super-long
JWT_EXPIRES_IN=7d
PORT=3000
```

### Cas 2 : Erreur de Build

Le build Hostinger a peut-être échoué. Vérifie :
- Les logs de build
- Que `package.json` a les bonnes dépendances
- Que Prisma est bien configuré

### Cas 3 : Erreur Database

Si le backend démarre mais crash au runtime :
- Vérifie `DATABASE_URL`
- Lance les migrations Prisma : `npx prisma migrate deploy`

---

## 🎯 Résumé des Commits Récents

| Commit | Description |
|--------|-------------|
| `097e5cd` | ✅ Fix participants + filtres + selects |
| `159428f` | ✅ Fix colonne 2FA |
| `95207fd` | ✅ Fix compteur 2FA |

**Tous ces commits doivent être déployés sur Hostinger !**

---

## 📞 Support Hostinger

Si rien ne fonctionne, contacte le **Support Hostinger** :
- Chat en direct sur hostinger.com
- Ou crée un ticket : **"Mon backend Node.js ne se redéploie pas"**

---

**Une fois le backend redéployé, tout devrait fonctionner ! 🎉**
