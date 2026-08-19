-- Restaurer le compte super admin
UPDATE users
SET "deletedAt" = NULL, "isActive" = true
WHERE email = 'admin@ataaba.com';

-- Vérifier la restauration
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
