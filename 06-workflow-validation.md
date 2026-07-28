# Circuit de validation — moteur d'états

## Étapes du circuit

```
[Responsable d'activité]
        │  soumission
        ▼
1. SOUMISSION
        │
        ▼
2. VERIFICATION_HIERARCHIQUE  ──rejet──▶ retour à SOUMISSION (avec commentaire)
        │ approuvé
        ▼
3. VALIDATION_TECHNIQUE  ──rejet──▶ retour à SOUMISSION (avec commentaire)
        │ approuvé
        ▼
4. VALIDATION_ADMINISTRATIVE  ──rejet──▶ retour à SOUMISSION (avec commentaire)
        │ approuvé
        ▼
5. CLOTURE (définitive)
```

## Règles métier

- Une activité ne peut être soumise que si son taux d'exécution de check-list atteint un seuil configurable (ex. 100% des tâches obligatoires) — **à confirmer avec le client**.
- Chaque étape ne peut être traitée que par un utilisateur ayant le rôle/la permission correspondante (voir `05-rbac-roles.md`).
- Un rejet à n'importe quelle étape renvoie l'activité en `SOUMISSION` avec le commentaire du rejet visible par le responsable.
- La **clôture définitive** change le statut de l'activité en `VALIDEE` et verrouille les modifications (lecture seule, sauf pour le super admin en cas d'incident).
- Chaque transition d'étape crée une entrée dans `Validation` (décision, commentaire, validateur, horodatage) — jamais de modification/suppression de ces entrées (append-only, cf. `AuditLog`).

## Implémentation technique recommandée

- Modéliser le workflow comme une **machine à états finis** explicite (pas de logique conditionnelle éparpillée) — ex. via une table de transitions autorisées :

```ts
const ALLOWED_TRANSITIONS: Record<ValidationStep, ValidationStep[]> = {
  SOUMISSION: ['VERIFICATION_HIERARCHIQUE'],
  VERIFICATION_HIERARCHIQUE: ['VALIDATION_TECHNIQUE', 'SOUMISSION'], // rejet
  VALIDATION_TECHNIQUE: ['VALIDATION_ADMINISTRATIVE', 'SOUMISSION'],
  VALIDATION_ADMINISTRATIVE: ['CLOTURE', 'SOUMISSION'],
  CLOTURE: [], // état terminal
};
```

- Chaque transition passe par un seul service (`ValidationService.transition(activityId, fromStep, toStep, decision, comment, userId)`) qui :
  1. vérifie la permission de l'utilisateur pour l'étape concernée
  2. vérifie que la transition est autorisée (`ALLOWED_TRANSITIONS`)
  3. enregistre la `Validation` et met à jour le statut de l'`Activity`
  4. écrit une entrée dans `AuditLog`
  5. déclenche une notification au responsable et au validateur suivant

- Ne jamais permettre de sauter une étape, même pour un rôle élevé — si un besoin de raccourci existe (ex. urgence), le formaliser comme une transition explicite documentée, pas comme un contournement silencieux.
