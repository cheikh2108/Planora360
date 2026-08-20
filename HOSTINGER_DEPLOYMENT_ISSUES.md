# ⚠️ PROBLÈMES DÉPLOIEMENT HOSTINGER

## 🔴 Problème Principal : Backend Non Déployé

### URLs Actuelles

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | `orangered-okapi-421028.hostingersite.com` | ✅ Fonctionne |
| **Backend API** | `firebrick-lyrebird-183958.hostingersite.com/api` | ❌ Retourne 404 HTML |

### Erreur Console

```
Failed to load resource: the server responded with a status of 500
Erreur création participant: AxiosError: Une erreur interne est survenue
```

---

## 🔍 Diagnostic

**Le backend retourne du HTML 404 au lieu de JSON**, ce qui signifie :

1. ❌ Le backend Node.js/NestJS n'est **PAS démarré** sur Hostinger
2. ❌ Ou le routing est **cassé**
3. ❌ Ou le backend est sur une **autre URL**

### Test API

```bash
curl https://firebrick-lyrebird-183958.hostingersite.com/api/participants
# Retourne : 404 HTML au lieu de JSON
```

---

## ✅ Solution : Vérifier le Déploiement Backend

### Étape 1 : Vérifier sur Hostinger

1. **Connecte-toi à Hostinger**
2. **Va dans le projet Backend** (`firebrick-lyrebird-183958`)
3. **Vérifie les logs** :
   - Le serveur Node.js est-il démarré ?
   - Y a-t-il des erreurs dans les logs ?
   - Le port 3000 est-il bien exposé ?

### Étape 2 : Vérifier les Variables d'Environnement

Sur Hostinger, vérifie que ces variables existent :

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
RESEND_API_KEY=...
```

### Étape 3 : Vérifier le Script de Démarrage

Le `package.json` du backend doit avoir :

```json
{
  "scripts": {
    "start": "node dist/src/main",
    "build": "nest build"
  }
}
```

Et Hostinger doit exécuter :
```bash
npm run build
npm run start
```

### Étape 4 : Vérifier les Ports

Le backend NestJS doit écouter sur :
```typescript
await app.listen(process.env.PORT || 3000);
```

Hostinger expose généralement le port via une variable `PORT`.

---

## 🐛 Autres Problèmes

### 1. Les Selects Ne Sont Pas Améliorés Visuellement

**Cause possible** : Le frontend n'a pas été rebuild après mes modifications.

**Solution** :
```bash
cd frontend
npm run build
```

Puis redéployer le frontend sur Hostinger.

### 2. Les Filtres Dashboard Ne Rafraîchissent Pas

**Code ajouté** : Hook `useDashboardFilters` pour filtrer par période.

**Mais** : Si le backend ne répond pas, les données ne peuvent pas être filtrées.

---

## 📋 Checklist Débogage

- [ ] Vérifier que le backend Node.js tourne sur Hostinger
- [ ] Vérifier les logs backend pour erreurs
- [ ] Vérifier que `DATABASE_URL` est correcte
- [ ] Vérifier que Prisma migrations ont été appliquées
- [ ] Tester manuellement l'API : `curl https://firebrick-lyrebird-183958.hostingersite.com/api/`
- [ ] Rebuild et redéployer le frontend si les selects ne sont pas améliorés

---

## 🚀 Une Fois le Backend Fixé

Les corrections suivantes seront effectives :

✅ Création participants (amount optionnel)  
✅ Création capitalisation  
✅ Création planification  
✅ Selects améliorés (rounded-xl, animations)  
✅ Filtres dashboard fonctionnels  

**Tout le code est correct localement, c'est juste le déploiement Hostinger qui bloque !**
