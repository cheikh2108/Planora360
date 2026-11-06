**PLANORA360**

**CAHIER DES CHARGES FONCTIONNEL**

**Modules Passation de marchés & Messagerie professionnelle**

| **Produit**            | Planora360                                                  |
|------------------------|-------------------------------------------------------------|
| **Entreprise**         | ATAABA Expertise                                            |
| **Nature du document** | Spécifications fonctionnelles et exigences de mise en œuvre |
| **Version**            | Version 1.0 – Août 2026                                     |

*Document destiné à l’équipe produit, aux développeurs, aux testeurs et aux partenaires de mise en œuvre.*

# **1. Objet du document**

Le présent cahier des charges définit les exigences fonctionnelles, organisationnelles, techniques et de sécurité relatives à l’intégration dans Planora360 de deux modules structurants : la passation de marchés et la messagerie professionnelle intégrée.

Ces modules doivent être conçus comme des briques natives de Planora360 et non comme des applications isolées. Ils devront s’appuyer sur les objets existants de la plateforme : projets, activités, budgets, tâches, recommandations, documents, utilisateurs, validations, alertes et tableaux de bord.

| **Vision fonctionnelle cible**                                                                                                                 |
|------------------------------------------------------------------------------------------------------------------------------------------------|
| Projet → Activité → Budget → Acquisition → Procédure de marché → Contrat → Livrable → Paiement → Clôture.                                      |
| La messagerie doit pouvoir se rattacher à chaque objet de gestion afin de conserver les échanges, décisions et validations dans leur contexte. |
| L’ensemble doit offrir une piste d’audit exploitable par la direction, le contrôle interne et les auditeurs.                                   |

# **2. Objectifs généraux**

- Dématérialiser et sécuriser le cycle complet de passation de marchés.

- Réduire les délais de traitement, les pertes d’information et les validations informelles.

- Assurer la traçabilité des décisions, documents, évaluations et paiements.

- Faciliter la collaboration entre équipes projets, finance, achats, direction et commissions.

- Centraliser les échanges liés aux projets, activités, recommandations, marchés et contrats.

- Produire des tableaux de bord et rapports fiables pour le pilotage, la conformité et l’audit.

# **3. Périmètre des utilisateurs**

| **Profil**                        | **Responsabilités principales**                                               |
|-----------------------------------|-------------------------------------------------------------------------------|
| Administrateur                    | Paramétrage, utilisateurs, rôles, référentiels, supervision globale.          |
| Direction                         | Validation, arbitrage, tableaux de bord, consultation des dossiers sensibles. |
| Chef de projet                    | Expression des besoins, suivi des acquisitions, contrats et livrables.        |
| Responsable passation/achats      | PPM, procédures, consultations, évaluations, attribution, contrats.           |
| Finance/Comptabilité              | Contrôle budgétaire, engagements, paiements, rapprochements.                  |
| Commission d’évaluation           | Ouverture, notation, commentaires, classement et recommandations.             |
| Auditeur/Contrôle interne         | Consultation, journal d’audit, pièces et historiques.                         |
| Fournisseur – accès externe futur | Consultations, soumissions, notifications, documents contractuels.            |

# **4. Module Passation de marchés**

## **4.1. Objectif du module**

Le module doit permettre la gestion de bout en bout des acquisitions de biens, services, travaux et prestations intellectuelles, depuis la planification jusqu’à la clôture du marché, avec workflows paramétrables et contrôle des habilitations.

## **4.2. Plan de Passation des Marchés (PPM)**

Le système doit permettre de créer un PPM par organisation, projet, exercice budgétaire et source de financement. Chaque ligne du PPM devra être identifiable par une référence unique.

| **Champ**         | **Exigence**                                                                                                      |
|-------------------|-------------------------------------------------------------------------------------------------------------------|
| Référence         | Générée automatiquement ou saisie selon le paramétrage.                                                           |
| Objet             | Intitulé clair de l’acquisition.                                                                                  |
| Projet / activité | Rattachement obligatoire aux objets Planora360.                                                                   |
| Budget            | Montant estimatif, ligne budgétaire, source de financement.                                                       |
| Méthode           | Mode de passation applicable.                                                                                     |
| Calendrier        | Dates prévisionnelles de lancement, attribution, signature et exécution.                                          |
| Responsable       | Personne ou unité chargée du dossier.                                                                             |
| Statut            | Prévisionnel, à valider, validé, lancé, évaluation, attribué, contractualisé, exécuté, clôturé, suspendu, annulé. |

Fonctions attendues : import/export Excel, duplication d’un PPM, versionnage, validation, historisation des modifications, filtre par projet et rapport d’exécution du PPM.

## **4.3. Expression et validation des besoins**

- Création d’une demande d’achat ou de prestation depuis une activité ou un projet.

- Description du besoin, justification, quantité, spécifications, montant estimatif, échéance souhaitée et pièces jointes.

- Rattachement à une ligne budgétaire et à la source de financement.

- Workflow configurable par organisation, nature de dépense et seuil financier.

- Possibilité de retourner une demande pour correction avec commentaire obligatoire.

| **Exemple de workflow**                                                                                 |
|---------------------------------------------------------------------------------------------------------|
| Demandeur → Chef de projet → Finance → Responsable passation → Direction.                               |
| Chaque transition doit être horodatée, signée par l’utilisateur et enregistrée dans le journal d’audit. |

## **4.4. Contrôle budgétaire**

Avant validation d’une demande, le système doit vérifier le budget disponible et afficher au minimum : budget initial, budget révisé, engagements antérieurs, dépenses réalisées, disponible, montant de la nouvelle demande et solde prévisionnel après engagement.

- Alerte non bloquante paramétrable en cas de dépassement.

- Blocage possible selon les règles de l’organisation.

- Traçabilité des dérogations et validations exceptionnelles.

- Préparation de l’intégration future avec Finora360.

## **4.5. Méthodes de passation**

| **Méthode**              | **Disponibilité V1** |
|--------------------------|----------------------|
| Achat direct             | Oui                  |
| Demande de cotation      | Oui                  |
| Consultation restreinte  | Oui                  |
| Appel d’offres ouvert    | Oui                  |
| Appel d’offres restreint | Oui                  |
| Demande de propositions  | Oui                  |
| Manifestation d’intérêt  | Oui                  |
| Sélection de consultant  | Oui                  |
| Procédure d’urgence      | Oui – paramétrable   |
| Autre méthode            | Oui – configurable   |

Les seuils, délais minimums, autorités de validation et pièces exigées devront être paramétrables afin d’adapter Planora360 aux procédures internes et aux règles des bailleurs.

## **4.6. Dossiers de consultation**

- Création guidée du dossier de consultation.

- Bibliothèque de modèles : DAO, demande de cotation, TDR, spécifications, modèle financier, projet de contrat.

- Gestion des versions et validation avant publication.

- Liste de contrôle des pièces obligatoires.

- Association de documents à un marché sans duplication inutile.

## **4.7. Publication et calendrier**

- Date de publication, date limite, séance d’ouverture, période de clarification et date d’attribution prévues.

- Envoi d’invitations ou avis par e-mail.

- Conservation des preuves de publication et de transmission.

- Alertes avant les échéances et signalement automatique des retards.

- Possibilité future de publier sur un portail fournisseurs.

## **4.8. Référentiel fournisseurs et prestataires**

| **Donnée**     | **Contenu**                                                              |
|----------------|--------------------------------------------------------------------------|
| Identification | Raison sociale, identifiant fiscal, registre, adresse, pays, contacts.   |
| Domaines       | Secteurs d’activité, catégories de biens/services, zones d’intervention. |
| Documents      | Pièces administratives, attestations, références, documents bancaires.   |
| Historique     | Consultations, soumissions, marchés attribués, incidents et évaluations. |
| Statut         | Actif, à valider, suspendu, blacklisté, archivé.                         |

Le système devra éviter les doublons et permettre la recherche multicritère. Les modifications sensibles du dossier fournisseur devront être historisées.

## **4.9. Réception sécurisée des offres**

- Horodatage automatique de chaque soumission.

- Numéro unique de dépôt.

- Confidentialité des offres jusqu’à l’ouverture.

- Gestion des pièces administratives, techniques et financières.

- Signalement ou rejet des dépôts hors délai selon les règles de la procédure.

- Journal des dépôts, retraits et remplacements avant échéance.

## **4.10. Ouverture des offres**

- Constitution d’une commission et désignation des rôles.

- Enregistrement de la présence et des conflits d’intérêts/déclarations éventuelles.

- Ouverture des dossiers à la date autorisée.

- Saisie des montants et vérification des pièces.

- Génération d’un procès-verbal d’ouverture.

## **4.11. Évaluation et classement**

Le moteur d’évaluation doit permettre de définir une grille composée de critères administratifs, techniques et financiers avec pondérations, seuils éliminatoires et règles de calcul.

| **Fonction**          | **Attendu**                                                    |
|-----------------------|----------------------------------------------------------------|
| Notation individuelle | Chaque évaluateur note selon ses droits.                       |
| Commentaires          | Justification des notes et observations.                       |
| Calcul automatique    | Scores techniques, financiers, globaux et classement.          |
| Consolidation         | Vue agrégée des évaluations et écarts de notation.             |
| Traçabilité           | Historique des modifications et verrouillage après validation. |
| Rapport               | Génération d’un rapport d’évaluation exportable.               |

## **4.12. Attribution**

- Sélection du soumissionnaire recommandé.

- Justification de la recommandation et pièces justificatives.

- Circuit de validation de l’attribution.

- Notification d’attribution et notification aux non-retenus.

- Enregistrement des recours, réponses et décisions.

- Passage automatique du dossier vers la contractualisation après validation.

## **4.13. Gestion contractuelle**

| **Champ**         | **Exigence**                                                     |
|-------------------|------------------------------------------------------------------|
| Référence contrat | Unique, liée au marché et au projet.                             |
| Titulaire         | Fournisseur ou prestataire attributaire.                         |
| Montant           | Initial, révisé, payé, restant.                                  |
| Dates             | Signature, démarrage, échéance, réception provisoire/définitive. |
| Modalités         | Avance, acomptes, jalons, retenues, taxes, garanties.            |
| Livrables         | Liste, échéances, responsables, acceptation.                     |
| Documents         | Contrat, annexes, garanties, assurances, ordres de service.      |

## **4.14. Avenants**

- Création d’un avenant avec motif obligatoire.

- Impact sur montant, délai, quantités ou livrables.

- Workflow de validation dédié.

- Conservation du montant et calendrier initiaux.

- Historique complet des versions contractuelles.

## **4.15. Suivi de l’exécution**

| **Indicateur de suivi** | **Exemple**                                         |
|-------------------------|-----------------------------------------------------|
| Avancement physique     | Pourcentage ou jalons réalisés.                     |
| Avancement financier    | Engagé, payé, solde.                                |
| Échéances               | Livrables dus, retard en jours.                     |
| Incidents               | Réserves, non-conformités, pénalités.               |
| Responsable             | Gestionnaire de contrat / chef de projet.           |
| Décisions               | Ordres de service, suspensions, relances, avenants. |

## **4.16. Réception des biens et services**

- Réception partielle, provisoire et définitive.

- Quantités prévues versus reçues.

- Contrôle de conformité et réserves.

- Photos, PV, bons de livraison et autres pièces jointes.

- Validation de la réception avant paiement selon le workflow.

## **4.17. Suivi des paiements**

- Avance, acompte, paiement intermédiaire, paiement final, retenue de garantie.

- Montant brut, taxes, pénalités, net à payer et solde.

- Pièces justificatives et statut de paiement.

- Contrôle du cumul payé par rapport au montant contractuel.

- Préparation de l’interface avec Finora360 pour imputation et transmission comptable.

## **4.18. Évaluation des fournisseurs**

À la clôture d’un marché, le système devra permettre une évaluation du fournisseur basée sur des critères configurables : qualité, respect des délais, conformité, disponibilité, service après-vente, respect contractuel et rapport qualité-prix.

La note et les commentaires devront enrichir automatiquement l’historique du fournisseur et être consultables lors de futures procédures selon les droits accordés.

## **4.19. Tableau de bord Marchés**

| **KPI**      | **Description**                                            |
|--------------|------------------------------------------------------------|
| PPM exécuté  | Taux de lignes lancées, attribuées et clôturées.           |
| Volumes      | Nombre de marchés par statut, méthode, projet et bailleur. |
| Montants     | Planifié, engagé, contractualisé, payé, solde.             |
| Délais       | Délai moyen de passation et durée d’évaluation.            |
| Retards      | Procédures, contrats et livrables en retard.               |
| Fournisseurs | Top fournisseurs, performance et concentration.            |
| Économies    | Écart entre estimation et montant attribué.                |

## **4.20. Alertes automatisées**

- Lancement du marché en retard.

- Date limite de soumission imminente.

- Évaluation ou validation en attente.

- Contrat arrivant à échéance.

- Garantie ou assurance expirant prochainement.

- Livrable en retard.

- Paiement en attente.

- Budget insuffisant ou dépassement.

- Marché sans activité depuis un nombre de jours paramétrable.

# **5. Module Messagerie professionnelle intégrée**

## **5.1. Objectif du module**

La messagerie doit permettre aux utilisateurs de communiquer dans Planora360 tout en rattachant les échanges aux objets de travail concernés. Elle doit réduire les échanges dispersés sur des canaux externes et renforcer la traçabilité opérationnelle.

## **5.2. Types de conversations**

| **Type**           | **Usage**                                                                                                   |
|--------------------|-------------------------------------------------------------------------------------------------------------|
| Message individuel | Conversation entre deux utilisateurs.                                                                       |
| Groupe             | Échanges entre plusieurs utilisateurs.                                                                      |
| Canal projet       | Conversation persistante propre à un projet.                                                                |
| Canal équipe       | Direction, Finance, Passation, Suivi-évaluation, etc.                                                       |
| Fil contextuel     | Discussion directement liée à une activité, tâche, recommandation, marché, contrat, livrable ou validation. |

## **5.3. Fonctions de base**

- Envoi et réception en temps réel ou quasi temps réel.

- Réponse, fil de discussion, transfert et citation de message.

- Modification et suppression selon permissions.

- Mentions @utilisateur et @équipe.

- Réactions, favoris et messages épinglés.

- Accusés de lecture et indicateur de messages non lus.

- Recherche plein texte et filtres.

- Archivage des conversations.

## **5.4. Pièces jointes**

Le système doit permettre le partage de PDF, documents bureautiques, images, vidéos et autres formats autorisés. La taille maximale, les extensions acceptées et les règles antivirus devront être configurables.

- Prévisualisation lorsque possible.

- Association du fichier à la conversation et à l’objet métier.

- Versionnage ou remplacement contrôlé pour les documents métier.

- Droits d’accès hérités du contexte lorsque nécessaire.

## **5.5. Notifications**

| **Canal**                    | **V1 / évolution**                                          |
|------------------------------|-------------------------------------------------------------|
| Notification dans Planora360 | V1 – obligatoire.                                           |
| E-mail                       | V1 – pour événements importants et mentions.                |
| Push mobile                  | Évolution – lorsque l’application mobile sera disponible.   |
| SMS                          | Évolution – selon intégration prestataire.                  |
| WhatsApp                     | Évolution – selon contraintes techniques et réglementaires. |

## **5.6. Messagerie contextuelle**

Une conversation doit pouvoir être ouverte depuis un objet Planora360 et rester automatiquement attachée à celui-ci. Les participants autorisés voient le contexte sans devoir rechercher manuellement les informations associées.

| **Exemple – demande d’achat**                                                        |
|--------------------------------------------------------------------------------------|
| Une demande est créée → le valideur reçoit une notification.                         |
| Le valideur demande une précision dans le fil lié à la demande.                      |
| Le demandeur répond et ajoute une pièce jointe.                                      |
| La validation est effectuée ; l’ensemble des échanges reste archivé avec le dossier. |

## **5.7. Messagerie liée aux marchés**

- Fil de discussion dédié pour chaque marché.

- Accès limité aux membres autorisés de l’équipe, de la commission ou de la direction.

- Notifications automatiques lors des changements de statut.

- Conservation des demandes de clarification, arbitrages et décisions internes.

- Lien direct depuis la conversation vers le dossier, les documents et les validations.

## **5.8. Messagerie liée aux recommandations**

- Commentaires et échanges sur chaque recommandation.

- Mention du responsable et des contributeurs.

- Pièces justificatives et éléments de preuve.

- Signalement d’un blocage ou d’une dépendance.

- Notification de relance et de clôture.

## **5.9. Recherche et historique**

La recherche doit porter sur les mots-clés, utilisateurs, projets, marchés, contrats, activités, recommandations, périodes et pièces jointes. Les résultats devront respecter strictement les droits d’accès de l’utilisateur.

Le système devra conserver l’auteur, la date et l’heure, les modifications, suppressions, lectures, mentions et pièces jointes pour les événements soumis à journalisation.

## **5.10. Gestion des droits**

| **Fonction**              | **Administrateur** | **Chef de projet**   | **Collaborateur**    | **Auditeur** |
|---------------------------|--------------------|----------------------|----------------------|--------------|
| Créer conversation        | Oui                | Oui                  | Oui                  | Non          |
| Ajouter un membre         | Oui                | Oui                  | Selon droit          | Non          |
| Modifier un message       | Oui                | Ses messages         | Ses messages         | Non          |
| Supprimer un message      | Selon politique    | Ses messages / droit | Ses messages / droit | Non          |
| Voir l’audit              | Oui                | Selon droit          | Non                  | Oui          |
| Exporter une conversation | Oui                | Selon droit          | Non / selon droit    | Oui          |

# **6. Intégration entre les modules et Planora360**

## **6.1. Modèle d’intégration métier**

| **Chaîne cible**                                                                                                      |
|-----------------------------------------------------------------------------------------------------------------------|
| Projet → Activité → Budget → Demande → Procédure → Attribution → Contrat → Livrable → Réception → Paiement → Clôture. |
| À chaque étape : notification, discussion contextuelle, validation, document, rappel et piste d’audit.                |

## **6.2. Workflow complet de référence**

1.  Une activité nécessite une acquisition.

2.  Le responsable crée une demande d’achat.

3.  Planora360 contrôle le budget.

4.  Le workflow de validation est lancé.

5.  Une procédure de passation est créée.

6.  La consultation est publiée ou envoyée.

7.  Les offres sont reçues et sécurisées.

8.  La commission ouvre et évalue les offres.

9.  L’attribution est validée.

10. Le contrat est généré ou enregistré.

11. Les livrables et réceptions sont suivis.

12. Les paiements sont enregistrés.

13. Le fournisseur est évalué.

14. Le marché est clôturé et archivé.

## **6.3. Automatisations attendues**

- Création automatique d’une tâche lors d’une validation requise.

- Notification et message contextuel lorsqu’un dossier change de statut.

- Relances automatiques avant et après échéance.

- Mise à jour des tableaux de bord à chaque événement significatif.

- Génération de documents standardisés à partir de modèles.

- Verrouillage de certaines données après validation finale, avec réouverture contrôlée.

# **7. Exigences techniques et non fonctionnelles**

## **7.1. Architecture**

- Architecture modulaire compatible avec le socle existant de Planora360.

- Application web responsive, compatible desktop, tablette et mobile.

- API REST ou équivalent pour intégrations futures.

- Base de données centralisée avec séparation logique multi-organisations.

- Gestion multi-projets et multi-entités.

- Capacité de montée en charge et journalisation structurée.

- Préparation de l’application mobile future.

## **7.2. Sécurité**

- Authentification sécurisée et politique de mot de passe configurable.

- Gestion des rôles et permissions granulaires.

- TLS/HTTPS pour les communications.

- Chiffrement des données sensibles selon l’architecture retenue.

- Protection contre les accès non autorisés, CSRF, XSS, injection et attaques courantes.

- Expiration et révocation des sessions.

- Sauvegardes régulières et procédure de restauration.

- Authentification multifacteur en option ou selon politique de l’organisation.

## **7.3. Journal d’audit**

Les opérations sensibles doivent être tracées de façon non ambiguë. Pour chaque événement, le journal devra enregistrer au minimum : utilisateur, action, date, heure, objet concerné, ancienne valeur, nouvelle valeur, adresse IP ou métadonnées techniques lorsque pertinent.

| **Événement sensible**             | **Journalisation obligatoire** |
|------------------------------------|--------------------------------|
| Création / modification de demande | Oui                            |
| Validation / rejet                 | Oui                            |
| Ouverture et évaluation            | Oui                            |
| Attribution                        | Oui                            |
| Création / modification contrat    | Oui                            |
| Avenant                            | Oui                            |
| Paiement                           | Oui                            |
| Suppression de document            | Oui                            |
| Modification des droits            | Oui                            |
| Export de données sensibles        | Selon politique                |

## **7.4. Gestion documentaire**

- Versionnage et historique.

- Catégorisation par type de document.

- Recherche et filtres.

- Prévisualisation quand possible.

- Droits d’accès spécifiques ou hérités.

- Association simultanée à un projet, marché, contrat ou activité sans duplication logique.

- Conservation et archivage selon une politique paramétrable.

## **7.5. Performance et disponibilité**

| **Exigence**             | **Cible indicative**                                           |
|--------------------------|----------------------------------------------------------------|
| Temps de réponse courant | \< 3 secondes pour les écrans standards, hors fichiers lourds. |
| Recherche                | Résultats rapides avec pagination et filtres.                  |
| Pièces jointes           | Téléversement avec progression et reprise/erreur claire.       |
| Disponibilité            | Objectif à définir selon l’offre d’hébergement et SLA.         |
| Sauvegarde               | Plan de sauvegarde automatique et restauration testée.         |
| Traçabilité erreurs      | Logs exploitables par l’équipe technique.                      |

# **8. Rapports et exports**

## **8.1. Rapports Passation de marchés**

- Plan de Passation des Marchés.

- État d’exécution du PPM.

- Liste des marchés par statut.

- Marchés par projet, bailleur, fournisseur et méthode.

- État des contrats et avenants.

- État des paiements.

- Marchés et livrables en retard.

- Rapport d’évaluation.

- Procès-verbal d’ouverture.

- Procès-verbal de réception.

- Fiche de suivi du marché.

- Évaluation et historique fournisseur.

Formats attendus : PDF et Excel au minimum ; Word pour certains documents narratifs et procès-verbaux lorsque nécessaire.

## **8.2. Rapports de communication**

- Historique d’une conversation.

- Échanges liés à un projet ou une activité.

- Échanges liés à un marché ou un contrat.

- Échanges liés à une recommandation.

- Historique des notifications et validations selon les droits.

# **9. Périmètre minimum de la V1**

## **9.1. Passation de marchés – obligatoire V1**

- PPM

- Demande d’achat

- Workflow de validation

- Contrôle budgétaire

- Référentiel fournisseurs

- Consultations / appels d’offres

- Réception des offres

- Gestion des commissions

- Évaluation et classement

- Attribution

- Contrats et avenants

- Suivi d’exécution

- Réception

- Suivi des paiements

- Documents

- Alertes

- Rapports

- Piste d’audit

## **9.2. Messagerie – obligatoire V1**

- Messages individuels

- Groupes

- Canaux projets

- Fils liés aux activités

- Fils liés aux recommandations

- Fils liés aux marchés et contrats

- Mentions

- Pièces jointes

- Notifications in-app et e-mail

- Recherche

- Historique

- Accusés de lecture

- Permissions et journalisation

## **9.3. Évolutions prévues**

- Portail fournisseurs et soumission externe complète.

- Signature électronique.

- Assistant IA pour création et contrôle des dossiers.

- Extraction automatique des offres et OCR.

- Détection d’anomalies et contrôles de cohérence.

- Comparaison automatisée de prix.

- Scoring fournisseur avancé.

- Intégration poussée avec Finora360.

- Intégration SIRH.

- Application mobile.

- Notifications SMS/WhatsApp.

- Visioconférence ou intégration avec outils collaboratifs.

# **10. Critères de recette fonctionnelle**

La V1 sera considérée comme fonctionnellement recevable lorsque les scénarios ci-dessous pourront être exécutés sans blocage majeur et avec une piste d’audit complète.

| **Scénario**                        | **Résultat attendu**                                                                       |
|-------------------------------------|--------------------------------------------------------------------------------------------|
| Créer une demande d’achat           | La demande est liée au projet/activité, contrôlée budgétairement et soumise au workflow.   |
| Valider ou rejeter                  | Le statut change, le commentaire est conservé et les personnes concernées sont notifiées.  |
| Créer une consultation              | Le dossier comporte calendrier, critères, documents et fournisseurs invités.               |
| Recevoir des offres                 | Chaque dépôt est horodaté, confidentiel et identifiable.                                   |
| Évaluer les offres                  | Les évaluateurs saisissent les notes ; le classement est calculé et verrouillable.         |
| Attribuer et contractualiser        | L’attribution suit les validations ; le contrat est créé avec échéances et livrables.      |
| Suivre une réception et un paiement | La réception est documentée ; les montants restent cohérents avec le contrat.              |
| Échanger dans un fil marché         | Les utilisateurs autorisés communiquent et les messages restent liés au dossier.           |
| Rechercher un échange               | La recherche retrouve le message sans exposer les conversations non autorisées.            |
| Auditer un dossier                  | L’auditeur voit les principales actions, versions, validations et pièces selon ses droits. |

# **11. Résultat attendu**

À l’issue de cette évolution, Planora360 devra offrir un environnement intégré permettant de piloter dans une même plateforme les projets, activités, budgets, tâches, recommandations, procédures de marchés, fournisseurs, contrats, livrables, paiements, documents, validations, échanges professionnels, tableaux de bord et rapports.

Le produit devra ainsi pouvoir répondre aux besoins d’organisations privées, ONG, associations, programmes, structures publiques, projets financés par des bailleurs et entreprises recherchant un outil de pilotage avec traçabilité renforcée.

**— Fin du document —**