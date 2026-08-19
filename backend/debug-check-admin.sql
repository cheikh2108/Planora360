-- Vérifier l'état du compte super admin
SELECT
  id,
  email,
  "firstName",
  "lastName",
  "isActive",
  "deletedAt",
  "organizationId"
FROM users
WHERE email = 'admin@ataaba.com';

-- Vérifier l'état de toutes les organisations
SELECT
  id,
  name,
  status,
  "deletedAt",
  (SELECT COUNT(*) FROM users WHERE "organizationId" = organizations.id AND "deletedAt" IS NULL) as active_users
FROM organizations
ORDER BY "createdAt" DESC
LIMIT 10;
