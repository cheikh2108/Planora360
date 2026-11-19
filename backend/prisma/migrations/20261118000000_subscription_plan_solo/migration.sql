-- Formule Solo (5 000 FCFA/mois) : 1 utilisateur, 3 plans d'action actifs, tous les modules
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'SOLO' BEFORE 'INDIVIDUEL';
