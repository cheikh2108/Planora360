# 📚 Centre d'Aide - PLANORA 360

## Vue d'ensemble

Le **Centre d'aide** affiche une aide contextuelle sur chaque page de l'application.

### Architecture simple

✅ **Pas de base de données**  
✅ **Pas de formulaire d'administration**  
✅ **Contenu hardcodé** dans le code source  

C'est comme les centres d'aide modernes : Intercom, Notion, Crisp, etc.

---

## 🎯 Composants

### 1. Fichier de contenu
**[`frontend/src/lib/help-content.ts`](frontend/src/lib/help-content.ts)**

Contient **tout le contenu de l'aide** organisé par page :

```typescript
export const HELP_CONTENT: HelpPage[] = [
  {
    page: 'dashboard',
    articles: [
      {
        id: 'dash-1',
        title: 'Vue d\'ensemble du tableau de bord',
        content: `<p>Le tableau de bord...</p>`,
      },
    ],
  },
  // ... autres pages
];
```

### 2. Composants React

- **`<HelpButton page="dashboard" />`** — Bouton à placer sur chaque page
- **`<HelpSidebar />`** — Sidebar qui s'ouvre à droite
- **`HelpContext`** — Contexte React pour gérer l'état

---

## 🚀 Utilisation

### Ajouter l'aide sur une page

```tsx
import { HelpButton } from '@/components/help/help-button';

export default function MaPage() {
  return (
    <Header 
      title="Ma Page"
      actions={<HelpButton page="ma-page" />}
    />
  );
}
```

### Identifiants de pages disponibles

`dashboard`, `plans`, `activities`, `validations`, `indicators`, `participants`, `capitalisation`, `planification`, `budgets`, `documents`, `reports`, `settings`

---

## ✏️ Modifier le contenu de l'aide

### 1. Ouvrir le fichier
```bash
frontend/src/lib/help-content.ts
```

### 2. Trouver la page concernée
```typescript
{
  page: 'dashboard',  // ← Identifiant de la page
  articles: [ ... ]
}
```

### 3. Ajouter/modifier un article
```typescript
{
  id: 'dash-3',  // ← ID unique
  title: 'Mon nouveau titre',
  content: `
    <p>Contenu en <strong>HTML</strong></p>
    <ul>
      <li>Point 1</li>
      <li>Point 2</li>
    </ul>
  `,
}
```

### 4. Redéployer
```bash
npm run build
# Le contenu sera mis à jour
```

---

## 📋 Format du contenu

Le contenu supporte le **HTML** :

```html
<p>Paragraphe simple</p>

<p><strong>Texte en gras</strong></p>

<ul>
  <li>Liste à puces</li>
</ul>

<ol>
  <li>Liste numérotée</li>
</ol>

<code>Code inline</code>
```

---

## 🎨 Apparence

- **Sidebar droite** : 480px sur desktop, pleine largeur sur mobile
- **Overlay noir** semi-transparent
- **Animation** : slide-in depuis la droite
- **Responsive** : adapté mobile/tablette/desktop

---

## ✅ Avantages de cette approche

1. ✅ **Simple** : Pas de DB, pas de backend
2. ✅ **Rapide** : Pas d'appel API, contenu instantané
3. ✅ **Sécurisé** : Aucun formulaire admin à protéger
4. ✅ **Versionné** : Le contenu est dans Git
5. ✅ **Prévisible** : Contrôle total sur le contenu

---

## 📊 Structure des fichiers

```
frontend/
  src/
    lib/
      help-content.ts           ← Contenu de l'aide (hardcodé)
    contexts/
      help-context.tsx          ← Contexte React
    components/
      help/
        help-button.tsx         ← Bouton "Aide"
        help-sidebar.tsx        ← Sidebar droite
```

---

## 💡 Workflow de mise à jour

1. **Développeur** modifie `help-content.ts`
2. Commit + push
3. Déploiement
4. **Utilisateurs** voient le nouveau contenu

**C'est tout !** Aucune interface d'administration nécessaire.

---

## 🎉 Prêt à l'emploi !

Le module est **opérationnel**.  
Démarrez les serveurs et testez le bouton "Aide" sur le Dashboard ! 🚀
