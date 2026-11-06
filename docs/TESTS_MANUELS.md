# 🧪 Tests manuels à effectuer

## ✅ Checklist avant merge

### 1. 🔌 Connexion Frontend-Backend

- [ ] Backend démarre sans erreur sur port 3001
- [ ] Frontend démarre sans erreur sur port 3000
- [ ] `curl http://localhost:3001/auth/csrf` retourne un token
- [ ] `curl http://localhost:3000/api/auth/csrf` retourne un token (proxy)
- [ ] Console frontend ne montre pas d'erreur CORS

### 2. 📝 Inscription Plan INDIVIDUEL

- [ ] Landing → clic "Commencer" redirige vers `/auth/register`
- [ ] Formulaire Step 1 : nom organisation + couleur + plan INDIVIDUEL
- [ ] Toggle Mensuel/Annuel fonctionne
- [ ] Badge "2 MOIS OFFERTS" apparaît en mode annuel
- [ ] Formulaire Step 2 : prénom, nom, email (pas de mot de passe !)
- [ ] Récapitulatif affiche bon tarif (10k/mois ou 100k/an)
- [ ] Clic "S'inscrire et payer" → redirection DexPay
- [ ] (Avec DexPay test) Paiement → webhook reçu côté backend
- [ ] Email vérification envoyé (check logs backend)
- [ ] Clic lien email → `/verify-email/[token]`
- [ ] Page affiche "Compte activé !"
- [ ] Email credentials envoyé (check logs backend)
- [ ] Redirection auto vers `/auth/login` après 5 secondes

### 3. 📨 Demande de devis (autres plans)

- [ ] Sélectionner plan **PRO** → bouton devient "Demander un devis"
- [ ] Clic "Demander un devis" → modal s'ouvre
- [ ] Modal affiche : nombre users estimés + message perso
- [ ] Récapitulatif dans modal correct (plan + cycle)
- [ ] Clic "Envoyer la demande" → loading
- [ ] Modal affiche "Demande envoyée !"
- [ ] 2 emails envoyés :
  - [ ] Email support (contact@planora360.org) avec détails complets
  - [ ] Email client (confirmation) avec récap
- [ ] Redirection vers `/auth/login` après 3 secondes

### 4. 📱 Landing Page Responsive

- [ ] Ouvrir sur mobile (ou DevTools responsive mode)
- [ ] Pas de débordement horizontal
- [ ] Menu hamburger s'ouvre au clic
- [ ] Liens du menu fonctionnent
- [ ] Fermeture menu par overlay fonctionne
- [ ] Fermeture menu par bouton X fonctionne
- [ ] Fermeture menu par touche Escape fonctionne
- [ ] Section tarifs affiche correctement
- [ ] Toggle Mensuel/Annuel fonctionne
- [ ] Tarifs changent (10k ↔ 100k pour INDIVIDUEL)
- [ ] Autres plans affichent "Sur devis"
- [ ] Badge "2 mois offerts" apparaît/disparaît

### 5. 🔒 Restrictions par plan

#### User avec plan INDIVIDUEL (3 projets max, 1 user)

- [ ] Peut créer 3 projets
- [ ] 4ème projet → erreur "Limite atteinte"
- [ ] Peut voir activités de base
- [ ] Accès Budgets → 403 "Nécessite formule Pro"
- [ ] Accès Documents → 403 "Nécessite formule Équipe"
- [ ] Accès Passation marchés → 403 "Nécessite formule Organisation"
- [ ] Tentative ajouter 2ème user → erreur "Maximum 1 utilisateur"

#### User avec plan PRO (10 projets, 3 users)

- [ ] Peut créer 10 projets
- [ ] Peut ajouter 3 utilisateurs max
- [ ] Accès Budgets → ✅
- [ ] Accès Participants → ✅
- [ ] Accès Planning → ✅
- [ ] Accès Rapports → ✅
- [ ] Accès Documents → 403 "Nécessite formule Équipe"

#### User avec plan EQUIPE (25 projets, 10 users)

- [ ] Accès Budgets → ✅
- [ ] Accès Documents → ✅
- [ ] Accès Messagerie → ✅
- [ ] Accès Indicateurs → ✅
- [ ] Accès Recommandations → ✅
- [ ] Accès Validations → ✅
- [ ] Accès Zones géo → 403 "Nécessite formule Organisation"

#### User avec plan ORGANISATION (50 projets, 25 users)

- [ ] Accès tous modules sauf ENTERPRISE-only
- [ ] Accès Zones géographiques → ✅
- [ ] Accès Audit → ✅
- [ ] Accès Passation marchés complète → ✅

### 6. 📧 Emails (si Resend configuré)

- [ ] Email vérification reçu avec bon template
- [ ] Lien de vérification valide 24h
- [ ] Email credentials reçu avec mot de passe temporaire
- [ ] Email demande devis reçu (support)
- [ ] Email confirmation devis reçu (client)

### 7. 🔐 Sécurité

- [ ] Mot de passe pas demandé à l'inscription (généré auto)
- [ ] Token vérification expire après 24h
- [ ] Token vérification unique (pas de réutilisation)
- [ ] Webhook DexPay signature vérifiée (HMAC-SHA256)
- [ ] Plan vérifié côté backend (pas juste frontend)
- [ ] Limites projets/users strictement appliquées

---

## ⚠️ Tests critiques (obligatoires)

Les tests **1, 2 et 5** sont **CRITIQUES** et doivent absolument passer avant le merge.

Les autres peuvent être testés en staging.

---

## 🐛 Logs à surveiller

### Backend (npm run start:dev)
```bash
✅ DexPay configuré
✅ Checkout session créée: DXP_xxx
✅ Webhook reçu: checkout.completed
✅ Email vérification envoyé
✅ Organisation activée
```

### Frontend (console navigateur)
```bash
# Pas d'erreurs CORS
# Pas d'erreurs 404 sur /api/*
# Redirections DexPay fonctionnent
```

---

## 📝 Notes

- En dev local, webhooks DexPay ne fonctionneront pas sans **ngrok**
- Pour tester webhooks : utiliser l'onglet "Test" du dashboard DexPay
- Clés de test : remplacer `pk_live_` par `pk_test_` dans `.env`
