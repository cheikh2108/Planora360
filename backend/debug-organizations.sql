-- 1. Voir l'organisation du super admin
SELECT
  u.email,
  u."organizationId" as admin_org_id,
  o.name as admin_org_name,
  o."deletedAt" as admin_org_deleted
FROM users u
LEFT JOIN organizations o ON u."organizationId" = o.id
WHERE u.email = 'admin@ataaba.com';

-- 2. Voir toutes les organisations récemment supprimées
SELECT
  id,
  name,
  status,
  "deletedAt",
  "createdAt"
FROM organizations
WHERE "deletedAt" IS NOT NULL
ORDER BY "deletedAt" DESC
LIMIT 5;

-- 3. Voir tous les users récemment soft deleted
SELECT
  u.id,
  u.email,
  u."firstName",
  u."lastName",
  u."organizationId",
  o.name as org_name,
  u."deletedAt"
FROM users u
LEFT JOIN organizations o ON u."organizationId" = o.id
WHERE u."deletedAt" IS NOT NULL
ORDER BY u."deletedAt" DESC
LIMIT 10;
