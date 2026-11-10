-- Notifications : lecture côté serveur (remplace le localStorage) et préférences d'e-mails réelles
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notificationsReadAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notificationPreferences" JSONB;
