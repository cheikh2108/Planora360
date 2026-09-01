# Documentation Composants UI

Système de composants réutilisables pour PLANORA360 avec design tokens, accessibilité et dark mode.

## Design Tokens

Les tokens sont définis dans `src/app/globals.css` et accessibles via CSS variables :

```css
/* Colors */
var(--color-brand)
var(--color-brand-hover)
var(--gray-50) à var(--gray-900)
var(--color-success, --color-warning, --color-error, --color-info)

/* Spacing */
var(--spacing-1) à var(--spacing-16)

/* Border Radius */
var(--radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full)

/* Shadows */
var(--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl)

/* Z-Index */
var(--z-dropdown, --z-modal, --z-tooltip, etc.)
```

## Composants

### Button

Bouton accessible avec variants, loading state, et icônes.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Valider
</Button>

<Button variant="outline" isLoading leftIcon={<PlusIcon />}>
  Ajouter
</Button>
```

**Variants:** `primary | secondary | outline | ghost | danger`  
**Sizes:** `sm | md | lg`

### Card

Conteneur de contenu avec variantes et sous-composants.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
  </CardHeader>
  <CardContent>
    Contenu...
  </CardContent>
</Card>
```

**Variants:** `default | bordered | elevated`  
**Padding:** `none | sm | md | lg`

### Badge

Étiquette de statut colorée.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Actif</Badge>
<Badge variant="warning" size="lg">En attente</Badge>
```

**Variants:** `default | success | warning | error | info`  
**Sizes:** `sm | md | lg`

### EmptyState

État vide illustré avec CTA.

```tsx
import { EmptyState } from '@/components/ui';

<EmptyState
  illustration="inbox"
  title="Aucun projet"
  description="Créez votre premier projet pour commencer."
  action={{
    label: 'Créer un projet',
    onClick: handleCreate,
    leftIcon: <PlusIcon />,
  }}
/>
```

**Illustrations:** `inbox | search | data | document | users`

### LoadingState & Skeleton

États de chargement animés.

```tsx
import { LoadingState, Skeleton, SkeletonCard } from '@/components/ui';

// Spinner
<LoadingState variant="spinner" size="lg" text="Chargement..." />

// Skeleton
<Skeleton variant="text" lines={3} />
<SkeletonCard />
<SkeletonTable rows={5} />
```

### Tooltip

Info-bulle accessible avec délai.

```tsx
import { Tooltip } from '@/components/ui';

<Tooltip content="Cliquez pour modifier" position="top">
  <button>Modifier</button>
</Tooltip>
```

**Positions:** `top | bottom | left | right`

### ErrorBoundary

Gestion d'erreurs React globale.

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary onError={(error, info) => logError(error)}>
  <App />
</ErrorBoundary>
```

### OnboardingTour

Tour guidé interactif pour nouveaux utilisateurs.

```tsx
import { OnboardingTour } from '@/components/Onboarding/OnboardingTour';

const steps = [
  {
    target: '#dashboard',
    title: 'Tableau de bord',
    content: 'Voici votre tableau de bord principal.',
    position: 'bottom',
  },
  // ...
];

<OnboardingTour
  steps={steps}
  storageKey="dashboard-tour"
  onComplete={() => console.log('Tour terminé')}
  onSkip={() => console.log('Tour passé')}
/>
```

### SkipLinks

Liens de navigation rapide pour clavier.

```tsx
import { SkipLinks } from '@/components/SkipLinks';

<SkipLinks />
```

Ajouter `id="main-content"` et `id="navigation"` aux éléments cibles.

## Accessibilité

Tous les composants respectent WCAG 2.1 AA :

- ✅ Navigation clavier complète
- ✅ Focus visible (`:focus-visible`)
- ✅ Aria-labels appropriés
- ✅ Contrastes respectés
- ✅ Reduced motion support
- ✅ Screen reader friendly

## Dark Mode

Support automatique via `prefers-color-scheme` ou classe `.dark` :

```tsx
// Auto (système)
<html>

// Manuel
<html className="dark">
```

## Bonnes Pratiques

1. **Utiliser les tokens** : Toujours préférer les tokens CSS aux valeurs hardcodées
2. **Composants composables** : Card + CardHeader + CardTitle au lieu de props multiples
3. **Accessibilité first** : aria-label, role, tabindex
4. **Loading states** : Toujours afficher un état de chargement
5. **Empty states** : Guider l'utilisateur avec des CTA clairs
6. **Error handling** : ErrorBoundary au niveau layout

## Exemple Complet

```tsx
'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  EmptyState,
  LoadingState,
} from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function ProjectsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  if (isLoading) {
    return <LoadingState variant="spinner" text="Chargement des projets..." />;
  }

  if (!projects.length) {
    return (
      <EmptyState
        illustration="inbox"
        title="Aucun projet"
        description="Créez votre premier projet pour commencer."
        action={{
          label: 'Nouveau projet',
          onClick: () => {},
        }}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} variant="bordered">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <Badge variant="success">Actif</Badge>
            </CardHeader>
            <CardContent>
              <p>{project.description}</p>
              <Button variant="outline" size="sm">
                Voir détails
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </ErrorBoundary>
  );
}
```
