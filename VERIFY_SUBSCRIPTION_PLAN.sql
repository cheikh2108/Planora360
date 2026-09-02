-- Script SQL pour vérifier les formules d'abonnement
-- À exécuter dans Neon Console : https://console.neon.tech/

-- 1. Voir toutes les organisations avec leur formule
SELECT
  id,
  name,
  "subscriptionPlan",
  status,
  "createdAt"
FROM organizations
ORDER BY "createdAt" DESC;

-- 2. Compter les utilisateurs par organisation
SELECT
  o.name AS "Organisation",
  o."subscriptionPlan" AS "Formule",
  COUNT(u.id) AS "Nombre d'utilisateurs"
FROM organizations o
LEFT JOIN users u ON u."organizationId" = o.id AND u."deletedAt" IS NULL
GROUP BY o.id, o.name, o."subscriptionPlan"
ORDER BY COUNT(u.id) DESC;

-- 3. Vérifier une organisation spécifique (remplace NOM_ORG)
SELECT
  id,
  name,
  "subscriptionPlan",
  status,
  (SELECT COUNT(*) FROM users WHERE "organizationId" = o.id AND "deletedAt" IS NULL) as "nb_users"
FROM organizations o
WHERE name ILIKE '%NOM_ORG%';

-- 4. Voir les limites de chaque formule
/*
INDIVIDUEL   : max 1 utilisateur, 3 plans
PRO          : max 3 utilisateurs, 10 plans
EQUIPE       : max 10 utilisateurs, 25 plans
ORGANISATION : max 25 utilisateurs, 50 plans
ENTERPRISE   : illimité
*/
