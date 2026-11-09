# 🚀 Configuration locale (Dev)

## ⚙️ Configuration requise

### Backend (`.env`)
```bash
# Base de données
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="votre_secret_jwt"
JWT_EXPIRES_IN="2h"
JWT_REFRESH_SECRET="votre_refresh_secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Frontend (liens des e-mails, retours de paiement). Plusieurs origines possibles, séparées par des virgules.
FRONTEND_URL="http://localhost:3001"

# DexPay : en local, utilisez des clés de TEST (aucun argent réel)
DEXPAY_PUBLIC_KEY=pk_test_...
DEXPAY_SECRET_KEY=sk_test_...
# URL publique de l'API pour les webhooks (en local : un tunnel, ex. ngrok ; sinon laisser vide,
# la formule est activée au retour sur la page de succès, qui vérifie le paiement auprès de DexPay)
API_PUBLIC_URL=

# Prix : grille tarifaire par défaut, en FCFA entiers (voir backend/.env.example pour les surcharger)

# Emails (Resend)
RESEND_API_KEY=re_...
```

### Frontend (`frontend/.env.local`)
```bash
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001  # ⚠️ Port du backend

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

---

## 🎯 Démarrage

### 1. Backend (port 3001)
```bash
cd backend
npm install
npm run start:dev
```

### 2. Frontend (port 3000)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 URLs en développement

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:3001 |
| **Landing** | http://localhost:3000/landing.html |
| **Inscription** | http://localhost:3000/auth/register |

---

## ✅ Tester la connexion

### Test API backend
```bash
curl http://localhost:3001/auth/csrf
```

### Test proxy frontend
```bash
curl http://localhost:3000/api/auth/csrf
```

Les deux doivent retourner un token CSRF.

---

## 🐛 Problèmes courants

### "Cannot connect to backend"
- ✅ Vérifier que le backend tourne sur port **3001**
- ✅ Vérifier `NEXT_PUBLIC_API_URL=http://localhost:3001` dans `frontend/.env.local`

### "CORS error"
- ✅ Utiliser `/api/*` (proxy Next.js) au lieu de `http://localhost:3001` direct
- ✅ Vérifier `withCredentials: true` dans les appels API

### "Webhook DexPay ne fonctionne pas"
- ✅ En local, utiliser **ngrok** : `ngrok http 3000`
- ✅ Mettre l'URL ngrok dans `FRONTEND_URL` backend
- ⚠️ DexPay ne peut pas appeler `localhost` (pas accessible depuis Internet)

---

## 🧪 Tester le flux complet

### 1. Plan INDIVIDUEL (paiement)
1. Aller sur http://localhost:3000/auth/register
2. Choisir plan **INDIVIDUEL**
3. Remplir formulaire
4. Cliquer "S'inscrire et payer"
5. Redirection vers DexPay (test avec carte test)
6. Après paiement → email de vérification
7. Clic sur lien → compte activé

### 2. Autres plans (devis)
1. Choisir plan **PRO**, **EQUIPE**, **ORGANISATION** ou **ENTERPRISE**
2. Cliquer "Demander un devis"
3. Modal s'ouvre avec formulaire
4. Cliquer "Envoyer la demande"
5. 2 emails envoyés (support + client)

---

## 📧 Test emails (sans Resend configuré)

Si `RESEND_API_KEY` n'est pas configuré, les emails s'affichent dans les **logs backend** :

```bash
┌─ CREDENTIALS ──────────────────────────┐
│ Org      : Mon Organisation
│ Email    : user@example.com
│ Password : abc12345
└────────────────────────────────────────┘
```

---

## 🔐 Clés de test DexPay

Pour tester les paiements sans vraies transactions :

```bash
DEXPAY_API_KEY=pk_test_...  # Clé test (sandbox)
DEXPAY_WEBHOOK_SECRET=sk_test_...
```

Carte de test (voir docs DexPay).
