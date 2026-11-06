**PLANORA360**

CAHIER DES CHARGES  
Module de gestion géographique des projets

Pilotage multi-projets, multi-sites et multi-zones géographiques

| **Solution**     | Planora360                             |
|------------------|----------------------------------------|
| **Module**       | Gestion géographique des projets       |
| **Version**      | Spécification fonctionnelle consolidée |
| **Priorisation** | 3 niveaux de développement intégrés    |

*Document de référence pour la conception, le développement, la démonstration et la validation du module.*

# Synthèse exécutive

**Objectif.** Permettre aux utilisateurs de Planora360 de planifier, suivre, analyser et présenter la mise en œuvre des projets selon leurs zones géographiques d’intervention, avec une lecture croisée des activités, indicateurs, budgets, bénéficiaires, risques, recommandations et résultats.

**Principe de conception.** La zone géographique doit être une dimension transversale de Planora360 et non un simple champ de la fiche projet. Elle doit pouvoir filtrer et agréger l’ensemble des données opérationnelles et financières.

## Matrice des 3 priorités de développement

| **Niveau**     | **Finalité**                        | **Fonctionnalités clés**                                                                                                   | **Usage**            |
|----------------|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------|----------------------|
| **PRIORITÉ 1** | Indispensable / présentation FHI360 | Hiérarchie géographique; zones du projet; activités; indicateurs; budget; filtres; tableau de bord; rapports territoriaux. | À livrer en premier  |
| **PRIORITÉ 2** | Forte valeur ajoutée                | Carte interactive; bénéficiaires; risques; recommandations; alertes; comparaison des zones.                                | Renforce la décision |
| **PRIORITÉ 3** | Avancée / extension                 | GPS terrain; mode hors connexion; notifications SMS/WhatsApp; analyses prédictives; IA.                                    | Évolution            |

# 1. Contexte et justification

Planora360 est une plateforme de gestion, de suivi et de pilotage de projets destinée à centraliser les projets, activités, budgets, indicateurs, documents, recommandations, risques et rapports. Pour les organisations intervenant sur plusieurs territoires, la dimension géographique doit être intégrée au cœur du modèle de données et du pilotage.

Le présent cahier des charges définit les exigences fonctionnelles et techniques du module de gestion géographique afin de prendre en compte la zone réelle de mise en œuvre des projets et de permettre un suivi territorial consolidé ou détaillé.

# 2. Objectifs du module

**Objectif général :**

Permettre de planifier, suivre, analyser et présenter la mise en œuvre d’un projet selon ses différentes zones géographiques d’intervention.

## 2.1 Objectifs spécifiques

1.  définir les zones couvertes par un projet et leur hiérarchie;

2.  gérer des projets couvrant plusieurs zones, régions ou pays;

3.  rattacher les activités, indicateurs, budgets et résultats aux territoires concernés;

4.  suivre les bénéficiaires, risques, incidents et recommandations par zone;

5.  comparer automatiquement les performances entre territoires;

6.  visualiser les interventions sur une carte;

7.  générer des alertes et rapports territoriaux;

8.  limiter, si nécessaire, les droits des utilisateurs à leur périmètre géographique.

# 3. Principes fonctionnels et architecture géographique

La structure géographique doit être paramétrable selon le pays et l’organisation. Pour le Sénégal, la hiérarchie par défaut recommandée est :

**Pays → Région → Département → Commune → Localité / Quartier / Village → Site d’intervention**

La zone géographique doit être transversale. Elle devra pouvoir être utilisée comme axe de rattachement, de filtrage et d’agrégation dans les modules Activités, MEAL, Finances, Bénéficiaires, Risques, Recommandations, Missions, Documents et Tableaux de bord.

# 4. Paramétrage de la hiérarchie géographique

- Créer, modifier, activer ou désactiver un niveau géographique.

- Définir l’ordre hiérarchique des niveaux.

- Créer des zones et les rattacher à une zone mère.

- Importer en masse les référentiels géographiques via Excel/CSV.

- Adapter la nomenclature selon les pays : province, district, county, région, commune, etc.

- Conserver un identifiant unique pour chaque zone.

# 5. Gestion des zones d’intervention du projet

Lors de la création ou de la modification d’un projet, l’utilisateur doit pouvoir sélectionner une ou plusieurs zones géographiques et définir le périmètre opérationnel.

- Pays

- Région

- Département

- Commune

- Arrondissement

- Village / localité / quartier

- District / district sanitaire

- Site d’intervention

- Adresse

- Latitude / longitude

- Responsable de zone

- Partenaire responsable

- Période d’intervention

- Statut de la zone : planifiée, active, suspendue ou clôturée

Un projet peut couvrir une seule zone, plusieurs communes, plusieurs régions ou plusieurs pays.

# 6. Gestion des sites d’intervention

Les sites représentent les points opérationnels de mise en œuvre : structures de santé, écoles, centres communautaires, bureaux régionaux, villages, structures partenaires, points de prestation ou autres sites terrain.

## 6.1 Données minimales de la fiche site

- Nom et type de site

- Projet et zone de rattachement

- Adresse et coordonnées GPS

- Responsable / point focal

- Téléphone et adresse électronique

- Partenaire associé

- Population ou bénéficiaires estimatifs

- Statut

- Observations

# 7. Affectation géographique des activités

Chaque activité et sous-activité doit pouvoir être rattachée à une ou plusieurs zones. L’utilisateur pourra préciser la période, le responsable, le budget, les bénéficiaires attendus, le niveau d’avancement et les résultats par zone.

Exemple : une formation nationale peut être planifiée dans les régions de Thiès, Fatick et Kaolack avec un suivi distinct de l’exécution dans chacune de ces régions.

# 8. Suivi de l’avancement par zone

Le système doit calculer et afficher, pour chaque zone :

- Nombre d’activités prévues, démarrées, terminées, reportées ou annulées

- Nombre d’activités en retard

- Taux d’avancement physique

- Taux d’exécution global

- Responsables et échéances critiques

# 9. Suivi géographique des indicateurs

Les indicateurs doivent pouvoir être ventilés par territoire avec cible, réalisation, écart, taux de réalisation, source de vérification et date de collecte.

| **Zone** | **Cible** | **Réalisation** | **Taux** |
|----------|-----------|-----------------|----------|
| Dakar    | 1 500     | 1 320           | 88 %     |
| Thiès    | 1 000     | 760             | 76 %     |
| Fatick   | 800       | 520             | 65 %     |

# 10. Désagrégation des données et bénéficiaires

Selon les besoins du projet, les résultats et bénéficiaires pourront être désagrégés par sexe, âge, type de bénéficiaire, groupe cible, catégorie socio-professionnelle, statut, type de structure et autres variables paramétrables.

Les bénéficiaires prévus et atteints devront être consultables suivant la hiérarchie : Projet → Région → Département → Commune → Site.

# 11. Suivi budgétaire géographique

Le module devra être connecté aux fonctions financières de Planora360. Chaque budget, engagement, dépense ou paiement pourra être associé à une zone.

- Budget prévu et budget révisé

- Montant engagé

- Montant dépensé / payé

- Solde

- Taux d’exécution budgétaire

- Taux d’avancement physique

- Écart financier

## 11.1 Contrôle croisé physique / financier

Le système doit détecter les situations incohérentes, par exemple une consommation budgétaire élevée avec un faible niveau d’avancement physique, et générer une alerte.

# 12. Tableau de bord géographique

Un tableau de bord dédié doit permettre un pilotage territorial dynamique.

## 12.1 Filtres obligatoires

- Portefeuille

- Programme

- Projet

- Pays

- Région

- Département

- Commune

- Localité

- Site

- Période

- Partenaire

- Responsable

## 12.2 Indicateurs affichés

- Nombre de projets et sites

- Activités réalisées et en retard

- Taux d’avancement

- Budget et dépenses

- Indicateurs et bénéficiaires

- Risques et incidents

- Recommandations

- Alertes

Lorsqu’une zone est sélectionnée, l’ensemble du tableau de bord doit se recalculer automatiquement.

# 13. Cartographie interactive

L’interface cartographique devra permettre de localiser les zones et sites d’intervention. Chaque point ou zone pourra afficher, au clic, les projets actifs, activités, bénéficiaires, budget, taux d’avancement, indicateurs clés, responsable, risques et alertes.

- Zoom et recherche

- Regroupement de points

- Filtres par projet, période et catégorie

- Affichage par niveau de performance

- Navigation entre niveaux géographiques

- Compatibilité avec OpenStreetMap, Leaflet ou technologie équivalente

# 14. Code visuel de performance

- Vert : situation satisfaisante

- Orange : vigilance

- Rouge : retard, sous-performance ou problème critique

- Gris : donnée non disponible

Les seuils doivent être configurables par l’administrateur.

# 15. Risques, incidents et recommandations géographiques

## 15.1 Risques

Chaque risque pourra être associé au projet, à une ou plusieurs zones, à une activité et/ou à un site, avec probabilité, impact, criticité, mesure d’atténuation, responsable, échéance et statut.

## 15.2 Incidents

Les incidents terrain pourront être localisés et suivis : retard d’activité, problème logistique, rupture de stock, incident sécuritaire, problème d’accès, difficulté avec un partenaire ou catastrophe naturelle.

## 15.3 Recommandations

Toute recommandation issue d’une mission, supervision, audit ou revue pourra être rattachée à une zone, avec responsable, échéance, état d’avancement, preuve et statut.

# 16. Missions et supervisions terrain

Le module géographique doit être interconnecté avec la gestion des missions et supervisions. L’utilisateur pourra définir les régions, départements, communes et sites à visiter, les membres de mission, dates, objectifs, constats, recommandations, photos, documents et coordonnées GPS.

# 17. Gestion documentaire géographique

Les documents pourront être classés et retrouvés par Projet + Région + Commune + Site + Période + Type de document.

- Rapports régionaux

- Listes de présence

- Comptes rendus

- Photos

- Rapports de supervision

- Rapports d’activité

- Pièces financières

# 18. Rapports territoriaux automatiques

Planora360 doit générer des rapports globaux, pays, régionaux, départementaux, communaux, par site et comparatifs entre zones ou partenaires.

- Formats : Word, PDF, Excel

- Identification du projet et de la zone

- Période

- Activités réalisées et en retard

- Indicateurs

- Bénéficiaires

- Situation budgétaire

- Risques et incidents

- Recommandations

- Graphiques et tableaux

- Pièces justificatives disponibles

# 19. Comparaison des performances entre zones

| **Région** | **Avancement** | **Budget exécuté** | **Indicateurs atteints** |
|------------|----------------|--------------------|--------------------------|
| Dakar      | 88 %           | 83 %               | 91 %                     |
| Thiès      | 82 %           | 77 %               | 84 %                     |
| Kaolack    | 71 %           | 69 %               | 73 %                     |
| Fatick     | 59 %           | 74 %               | 62 %                     |

Le classement comparatif doit permettre d’identifier les meilleures performances, les zones en difficulté et celles nécessitant un appui prioritaire.

# 20. Alertes et notifications

Le système doit générer automatiquement des alertes territoriales sur les retards, contre-performances, anomalies financières, absence de données ou risques critiques.

- « 4 activités sont en retard dans la région de Fatick. »

- « Le taux de réalisation de l’indicateur X est inférieur à 50 % dans la commune Y. »

- « Le site Z n’a enregistré aucune donnée depuis 30 jours. »

- « La consommation budgétaire dépasse 80 % alors que l’avancement physique reste inférieur à 60 %. »

Les alertes pourront être diffusées dans Planora360, par e-mail et, en évolution, via SMS ou WhatsApp API. Les responsables territoriaux pourront recevoir uniquement les alertes de leur périmètre.

# 21. Gestion multi-projets et partenaires

La dimension géographique doit fonctionner au niveau portefeuille afin de consolider les différents projets actifs dans un même territoire. Les partenaires d’exécution pourront également être associés à leurs zones, activités, budgets, indicateurs et performances.

# 22. Gestion des utilisateurs et droits territoriaux

Les permissions devront pouvoir être définies selon la zone géographique. Un coordinateur régional pourra, par exemple, consulter ou modifier uniquement les données de sa région.

- Consultation

- Saisie

- Modification

- Validation

- Administration

- Téléchargement

- Rapportage

# 23. Workflow de validation

Les données territoriales pourront suivre un circuit configurable, par exemple :

**Agent / Site → Responsable de zone → Coordinateur projet → MEAL → Administrateur**

# 24. Import, export et recherche

## 24.1 Import

Import en masse via Excel/CSV des zones, sites, bénéficiaires, indicateurs, activités et résultats. Les contrôles doivent signaler les doublons, zones inconnues, erreurs de format et données obligatoires manquantes.

## 24.2 Export

- Excel

- CSV

- PDF

- Word

## 24.3 Recherche multicritère

Le moteur de recherche doit pouvoir combiner Projet + Région + Commune + Site + Responsable + Activité + Période.

# 25. GPS, mobilité et mode hors connexion

Le système pourra enregistrer latitude, longitude, précision GPS, date de capture et utilisateur ayant enregistré la position. La consultation et la saisie devront être adaptées aux ordinateurs, tablettes et smartphones.

Une évolution avancée permettra la saisie hors connexion, le stockage local temporaire et la synchronisation lorsque la connexion est rétablie.

# 26. Sécurité, traçabilité et audit

- Authentification sécurisée

- Contrôle des droits

- Chiffrement des échanges

- Sauvegardes

- Gestion des sessions

- Journalisation

- Historique des modifications

- Contrôle des téléchargements

Le journal d’audit conservera notamment l’utilisateur, la date, l’heure, l’ancienne valeur, la nouvelle valeur, la zone concernée et le type d’opération.

# 27. Interopérabilité avec les autres modules de Planora360

| **Module**           | **Intégration géographique**                             |
|----------------------|----------------------------------------------------------|
| Gestion des projets  | Rattachement du projet à son territoire.                 |
| Planification        | Localisation des activités et sous-activités.            |
| MEAL                 | Désagrégation territoriale des indicateurs et résultats. |
| Finances             | Budget, engagements, dépenses et écarts par zone.        |
| Passation de marchés | Marchés, fournisseurs ou contrats liés à des zones.      |
| Gestion documentaire | Classement des preuves et rapports par territoire.       |
| Recommandations      | Suivi territorial des mesures correctives.               |
| Risques              | Analyse des risques territoriaux.                        |
| Messagerie           | Échanges entre équipes centrales, régionales et sites.   |
| Tableaux de bord     | Consolidation, comparaison et filtres géographiques.     |

# 28. Cas d’utilisation de référence

Un responsable sélectionne Projet X → Région de Fatick. Planora360 affiche automatiquement :

- Taux d’avancement : 59 %

- Activités prévues : 32

- Activités terminées : 19

- Activités en retard : 5

- Budget consommé : 74 %

- Indicateurs atteints : 62 %

- Bénéficiaires : 4 850

- Recommandations ouvertes : 6

- Risques critiques : 2

Le responsable peut ensuite descendre au niveau commune ou site pour consulter les activités, indicateurs, responsables, budgets et pièces justificatives associés.

# 29. Critères d’acceptation fonctionnelle

☐ Un projet peut être affecté à plusieurs zones.

☐ Une hiérarchie géographique peut être configurée.

☐ Les activités peuvent être affectées à une ou plusieurs zones.

☐ Les indicateurs peuvent être ventilés par territoire.

☐ Les budgets et dépenses peuvent être analysés par zone.

☐ Les bénéficiaires peuvent être ventilés géographiquement.

☐ Les risques et incidents peuvent être localisés.

☐ Les recommandations peuvent être suivies par zone.

☐ Les tableaux de bord disposent de filtres géographiques.

☐ Les données se recalculent automatiquement après filtrage.

☐ Les zones peuvent être visualisées sur une carte.

☐ Les performances peuvent être comparées entre territoires.

☐ Les rapports territoriaux peuvent être générés.

☐ Les droits utilisateurs peuvent être limités par territoire.

☐ Toutes les opérations sont traçables.

# 30. Plan de développement en 3 priorités

Les trois priorités ci-dessous font partie intégrante du présent cahier des charges. Elles définissent l’ordre recommandé de mise en œuvre technique, sans exclure les fonctionnalités des niveaux suivants de la cible fonctionnelle finale.

**PRIORITÉ 1 — INDISPENSABLE / VERSION À PRÉSENTER À FHI360**

Socle fonctionnel à livrer en premier pour répondre immédiatement au besoin de prise en compte de la zone géographique de mise en œuvre.

- Paramétrage Pays / Région / Département / Commune / Localité / Site

- Rattachement d’un projet à une ou plusieurs zones

- Rattachement des activités et sous-activités aux zones

- Suivi des indicateurs par zone

- Suivi du budget et des dépenses par zone

- Filtres géographiques sur les écrans et tableaux de bord

- Tableau de bord territorial avec recalcul automatique

- Génération de rapports par zone et comparaison simple

**Critère de validation : l’utilisateur sélectionne une zone et obtient instantanément les activités, indicateurs, budgets, résultats et alertes qui lui sont associés.**

**PRIORITÉ 2 — FORTE VALEUR AJOUTÉE**

Fonctionnalités renforçant la visualisation, la supervision et la prise de décision territoriale.

- Carte interactive des zones et sites

- Suivi des bénéficiaires par zone

- Gestion géographique des risques et incidents

- Suivi des recommandations par zone

- Alertes territoriales automatiques

- Comparaison et classement des performances entre régions / communes / sites

**Critère de validation : le décideur peut identifier visuellement et rapidement les zones performantes, les zones en difficulté et les actions correctives attendues.**

**PRIORITÉ 3 — FONCTIONNALITÉS AVANCÉES / EXTENSION**

Fonctionnalités de collecte terrain avancée, mobilité et assistance intelligente.

- Capture et contrôle des coordonnées GPS

- Mode hors connexion et synchronisation différée

- Notifications SMS / WhatsApp via API

- Analyses prédictives des risques de retard ou sous-performance

- Recommandations et synthèses territoriales assistées par IA

**Critère de validation : Planora360 peut soutenir des opérations terrain faiblement connectées et produire des analyses proactives à partir des données territoriales.**

## 30.4 Ordre recommandé de livraison

| **Lot** | **Priorité** | **Livrable principal**          | **Validation**                     |
|---------|--------------|---------------------------------|------------------------------------|
| Lot 1   | P1           | Socle géographique opérationnel | Démonstration fonctionnelle FHI360 |
| Lot 2   | P2           | Pilotage territorial enrichi    | Carte, alertes, comparaison        |
| Lot 3   | P3           | Terrain et intelligence avancée | GPS, offline, notifications, IA    |

# 31. Exigences non fonctionnelles

- Performance : les filtres territoriaux doivent recalculer les tableaux de bord sans délai excessif.

- Scalabilité : le modèle doit supporter un grand nombre de projets, sites, zones et enregistrements.

- Sécurité : contrôle d’accès par rôle et, si nécessaire, par périmètre géographique.

- Traçabilité : historique des modifications et journal d’audit.

- Ergonomie : navigation simple entre niveaux géographiques et conservation des filtres actifs.

- Compatibilité : web responsive et prise en charge des navigateurs modernes.

- Interopérabilité : capacité d’import/export et possibilité d’intégration API future.

# 32. Résultat attendu et positionnement

À terme, Planora360 doit permettre à une direction de programme, un chef de projet, un responsable MEAL ou un responsable régional de répondre instantanément aux questions suivantes : où intervenons-nous, quelles activités sont réalisées dans chaque territoire, quelles zones sont en retard, quel budget est consommé par zone, quels indicateurs sont sous leurs cibles, combien de bénéficiaires sont atteints et quelles recommandations ou alertes restent ouvertes ?

**Positionnement recommandé**

*« Planora360 — plateforme intégrée de pilotage multi-projets, multi-sites et multi-zones géographiques, permettant de suivre en temps réel les activités, résultats, indicateurs, budgets, bénéficiaires, risques et performances de chaque territoire d’intervention. »*