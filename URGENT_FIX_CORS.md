# 🚨 URGENT : Erreur CORS - Impossible de se Connecter

## ❌ Problème Actuel

```
Access to XMLHttpRequest blocked by CORS policy
No 'Access-Control-Allow-Origin' header
```

**Tu ne peux plus te connecter à cause d'une erreur CORS.**

---

## 🔍 Cause Racine

Le backend NestJS sur Hostinger utilise cette configuration CORS :

```typescript
// backend/src/main.ts ligne 22-34
const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3001')
  .split(',')
  .map(o => o.trim());

app.enableCors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
});
```

**Le problème :** La variable `FRONTEND_URL` n'est **PAS configurée** sur Hostinger, donc le backend autorise seulement `http://localhost:3001` au lieu de `https://orangered-okapi-421028.hostingersite.com`.

---

## ✅ Solution IMMÉDIATE : Configurer FRONTEND_URL sur Hostinger

### Étape 1 : Se Connecter à Hostinger

1. Va sur **https://hostinger.com**
2. Connexion
3. Va dans **"Websites"**

### Étape 2 : Ouvrir le Projet Backend

Trouve le projet :
```
firebrick-lyrebird-183958.hostingersite.com
```

### Étape 3 : Ajouter la Variable d'Environnement

Cherche une section :
- **"Environment Variables"** (Variables d'environnement)
- **"Configuration"**
- **"Settings"** → **"Variables"**

Ajoute cette variable :

| Nom | Valeur |
|-----|--------|
| `FRONTEND_URL` | `https://orangered-okapi-421028.hostingersite.com` |

### Étape 4 : Redémarrer le Backend

Après avoir ajouté la variable :
- Clique sur **"Restart"** ou **"Redeploy"**
- Attends 1-2 minutes

### Étape 5 : Tester

Actualise la page de connexion et réessaie de te connecter.

✅ **L'erreur CORS devrait disparaître !**

---

## 🔧 Solution Alternative : Autoriser Toutes les Origines (Temporaire)

Si tu ne trouves pas où configurer les variables d'environnement, tu peux temporairement autoriser toutes les origines :

**Sur Hostinger, modifie la variable :**

| Nom | Valeur |
|-----|--------|
| `FRONTEND_URL` | `*` |

⚠️ **ATTENTION** : Ceci désactive la protection CORS. À utiliser **UNIQUEMENT en développement**.

---

## 📋 Toutes les Variables d'Environnement Requises

Assure-toi que ces variables sont configurées sur Hostinger :

```env
DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET=ton-secret-super-long-ici
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://orangered-okapi-421028.hostingersite.com
RESEND_API_KEY=re_...
PORT=3000
```

---

## 🧪 Vérifier que la Config Est Prise en Compte

Après avoir ajouté `FRONTEND_URL` et redémarré :

1. Ouvre la console DevTools (F12)
2. Va dans l'onglet **Network**
3. Essaie de te connecter
4. Clique sur la requête `login`
5. Vérifie dans **Response Headers** :
   ```
   Access-Control-Allow-Origin: https://orangered-okapi-421028.hostingersite.com
   ```

Si tu vois ce header, **c'est bon !** ✅

---

## 📞 Si Ça Ne Marche Toujours Pas

1. **Vérifie les logs backend** sur Hostinger pour voir si la variable est bien chargée
2. **Contacte le support Hostinger** : "Comment ajouter des variables d'environnement Node.js ?"
3. **Ou utilise le SSH** pour vérifier :
   ```bash
   echo $FRONTEND_URL
   ```

---

**C'EST ÇA LE BLOCAGE, PAS MES COMMITS ! La variable FRONTEND_URL manque sur Hostinger. 🚨**
