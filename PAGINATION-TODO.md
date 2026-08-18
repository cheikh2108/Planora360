# Pagination - TODO List

## ✅ FAIT

### `/notifications` - Journal d'activité
- **Frontend** : Design premium avec cards, timeline améliorée
- **Backend** : API paginée (limit + page)
- **Composant** : Pagination component déjà existant et utilisé
- **UX** : Stats en haut, légende des types, groupement par jour

---

## ⚠️ À FAIRE (Pages qui affichent des listes)

### Priorité HAUTE

#### 1. `/recommendations` - Liste des recommandations
**Problème** : Charge TOUTES les recommandations en mémoire  
**Backend** :
```typescript
// recommendations.service.ts
async findAll(organizationId: string, filters?: any, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  const where: any = { organizationId, ...filters };
  
  const [recommendations, total] = await Promise.all([
    this.prisma.recommendation.findMany({
      where,
      include: RECOMMENDATION_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    this.prisma.recommendation.count({ where }),
  ]);
  
  return { recommendations, total, page, limit };
}
```

**Frontend** :
```typescript
const [page, setPage] = useState(1);
const limit = 20;

const { data, isLoading } = useQuery({
  queryKey: ['recommendations', filters, page],
  queryFn: async () => {
    const res = await recommendationsApi.getAll({ ...filters, limit, page });
    return res.data;
  },
});

const recommendations = data?.recommendations ?? [];
const total = data?.total ?? 0;

// Ajouter après la grid:
{!isLoading && total > limit && (
  <Pagination page={page} total={total} limit={limit} onChange={setPage} />
)}
```

#### 2. `/activities` - Liste des activités
**Même pattern que recommendations**
- Backend : activities.service.ts → findAll avec limit/skip/count
- Frontend : ajouter state page + Pagination component
- Limit suggéré : 20 par page

#### 3. `/plans` - Liste des plans d'action
- Backend : action-plans.service.ts
- Frontend : plans/page.tsx
- Limit suggéré : 15 par page

### Priorité MOYENNE

#### 4. `/users` (Super Admin) - Liste des utilisateurs
**Backend** :
```typescript
// users.service.ts
async findAll(organizationId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = { organizationId };
  
  const [users, total] = await Promise.all([
    this.prisma.user.findMany({
      where,
      include: { role: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    this.prisma.user.count({ where }),
  ]);
  
  return { data: users, total, page, limit };
}
```

#### 5. `/validations` - Liste des validations en attente
- Backend : validations.service.ts
- Frontend : validations/page.tsx
- Limit suggéré : 30 par page

#### 6. `/indicators` - Liste des indicateurs
- Backend : indicators.service.ts
- Frontend : indicators/page.tsx
- Limit suggéré : 25 par page

### Priorité BASSE (Moins critique car moins de données)

#### 7. `/participants` - Liste des participants
- Généralement moins de participants par activité
- Peut attendre, mais utile pour grandes formations

#### 8. `/capitalisation` - Fiches de capitalisation
- Généralement peu de fiches
- Peut attendre

#### 9. `/planification` - Plans de travail
- Généralement 1-2 par an
- Pagination moins urgente

---

## 📐 Pattern standard à suivre

### Backend Service
```typescript
async findAll(organizationId: string, options?: {
  filters?: any;
  limit?: number;
  page?: number;
}) {
  const limit = options?.limit ?? 20;
  const page = options?.page ?? 1;
  const skip = (page - 1) * limit;
  
  const where = { organizationId, ...options?.filters };
  
  const [items, total] = await Promise.all([
    this.prisma.XXX.findMany({
      where,
      include: { /* relations */ },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    this.prisma.XXX.count({ where }),
  ]);
  
  return { items, total, page, limit };
}
```

### Backend Controller
```typescript
@Get()
findAll(
  @CurrentUser() user: any,
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query() filters?: any,
) {
  return this.service.findAll(user.organizationId, {
    filters,
    limit: limit ? parseInt(limit) : 20,
    page: page ? parseInt(page) : 1,
  });
}
```

### Frontend Page
```typescript
const [page, setPage] = useState(1);
const limit = 20;

const { data, isLoading } = useQuery({
  queryKey: ['items', filters, page],
  queryFn: async () => {
    const res = await api.getAll({ ...filters, limit, page });
    return res.data;
  },
});

const items = data?.items ?? [];
const total = data?.total ?? 0;

// Dans le JSX après la liste:
{!isLoading && total > limit && (
  <div className="bg-white rounded-2xl border border-slate-200 p-4">
    <Pagination
      page={page}
      total={total}
      limit={limit}
      onChange={setPage}
    />
  </div>
)}
```

---

## 🎯 Limits recommandés par type

| Page | Limit | Raison |
|------|-------|--------|
| Notifications | 50 | Petits items, timeline |
| Recommendations | 20 | Cards moyennes avec détails |
| Activities | 20 | Cards complexes avec stats |
| Plans | 15 | Cards larges avec beaucoup d'infos |
| Users | 20 | Liste simple |
| Validations | 30 | Liste compacte |
| Indicators | 25 | Liste avec graphiques |

---

## ✅ Checklist par page

Avant de considérer une page "terminée" :

- [ ] Backend : méthode findAll retourne `{ items, total, page, limit }`
- [ ] Backend : paramètres `page` et `limit` dans controller
- [ ] Frontend : state `page` initialisé à 1
- [ ] Frontend : queryKey inclut `page`
- [ ] Frontend : Pagination component affiché si `total > limit`
- [ ] Frontend : onChange appelle setPage
- [ ] Test : charger page 1, 2, 3
- [ ] Test : vérifier que les filtres fonctionnent avec la pagination
- [ ] Test : vérifier que setPage réinitialise à 1 quand on change les filtres

---

## 💡 Tips

- **Reset page on filter change** : `useEffect(() => setPage(1), [filters])`
- **Scroll to top on page change** : `useEffect(() => window.scrollTo(0, 0), [page])`
- **Loading state** : le composant Pagination gère déjà le disabled pendant loading
- **Empty state** : n'afficher Pagination que si `!isLoading && total > limit`
- **Performance** : toujours utiliser `skip` + `take` + `count()` en parallèle avec `Promise.all()`

---

**Une fois toutes ces pages paginées, PLANORA 360 pourra gérer des milliers d'enregistrements sans problème de performance !**
