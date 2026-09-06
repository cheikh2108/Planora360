/**
 * Contenu du Centre d'Aide - PLANORA 360
 *
 * Ce fichier contient tout le contenu de l'aide contextuelle.
 * Pour modifier l'aide, éditez directement ce fichier et redéployez.
 */

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
}

export interface HelpPage {
  page: string;
  articles: HelpArticle[];
}

export const HELP_CONTENT: HelpPage[] = [
  {
    page: 'dashboard',
    articles: [
      {
        id: 'dash-1',
        title: 'Vue d\'ensemble du tableau de bord',
        content: `
          <p>Le tableau de bord vous offre une vue d'ensemble complète de vos plans d'action en cours.</p>
          <p>Vous y trouverez :</p>
          <ul>
            <li><strong>Les KPIs principaux</strong> : activités en cours, budgets, validations</li>
            <li><strong>Les graphiques</strong> : distribution des statuts et budgets</li>
            <li><strong>Les échéances à venir</strong> : pour ne rien manquer</li>
          </ul>
        `,
      },
      {
        id: 'dash-2',
        title: 'Filtrer vos données',
        content: `
          <p>Utilisez les filtres en haut de page pour :</p>
          <ul>
            <li>Sélectionner un plan d'action spécifique</li>
            <li>Filtrer par période (mois, trimestre, année)</li>
            <li>Afficher un statut particulier</li>
          </ul>
          <p><strong>Astuce :</strong> Les filtres s'appliquent à tous les widgets du tableau de bord.</p>
        `,
      },
    ],
  },
  {
    page: 'territorial',
    articles: [
      {
        id: 'terr-1',
        title: 'Vue d\'ensemble de Vue Territoriale',
        content: `
          <p>La <strong>Vue Territoriale</strong> vous permet de gérer le découpage géographique de vos activités.</p>
          <p>Cette page centralise :</p>
          <ul>
            <li><strong>Gestion des zones</strong> : Créer, modifier, supprimer la hiérarchie</li>
            <li><strong>Configuration de la nomenclature</strong> : Adapter les noms des niveaux à votre secteur</li>
            <li><strong>Statistiques par zone</strong> : Activités, budgets, taux d'exécution</li>
          </ul>
        `,
      },
      {
        id: 'terr-2',
        title: 'Configurer la nomenclature (Bouton "Configurer")',
        content: `
          <p>Par défaut, PLANORA 360 utilise la nomenclature <strong>STANDARD</strong> :</p>
          <ul>
            <li>Niveau 0 : <strong>Pays</strong></li>
            <li>Niveau 1 : <strong>Région</strong></li>
            <li>Niveau 2 : <strong>Département</strong></li>
            <li>Niveau 3 : <strong>Commune</strong></li>
          </ul>
          <p><strong>Comment adapter à votre secteur :</strong></p>
          <ol>
            <li>Cliquez sur le bouton <strong>"Configurer"</strong> ⚙️</li>
            <li>Sélectionnez un modèle pré-configuré (SANTÉ, ÉDUCATION, AGRICULTURE)</li>
            <li>Enregistrez pour appliquer immédiatement</li>
          </ol>
          <p class="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800 my-2">
            💡 <strong>Important :</strong> Les zones existantes conservent leur niveau numérique. Seul l'affichage des labels change.
          </p>
        `,
      },
      {
        id: 'terr-3',
        title: 'Les 5 modèles de nomenclature',
        content: `
          <p>PLANORA 360 propose 5 configurations adaptées aux différents secteurs :</p>
          <ul>
            <li><strong>STANDARD</strong> (par défaut) : Pays → Région → Département → Commune</li>
            <li><strong>SANTÉ</strong> : Pays → Région → <strong>District sanitaire</strong> → <strong>Structure de santé</strong></li>
            <li><strong>ÉDUCATION</strong> : Pays → Région → <strong>Inspection</strong> → <strong>École</strong></li>
            <li><strong>AGRICULTURE</strong> : Pays → Région → <strong>Zone agricole</strong> → <strong>Périmètre</strong></li>
            <li><strong>CUSTOM</strong> : Personnalisez chaque niveau selon vos besoins</li>
          </ul>
          <p><strong>Exemple d'utilisation :</strong> Un projet de santé communautaire utilisera le modèle SANTÉ pour suivre les activités par district sanitaire et centre de santé.</p>
        `,
      },
      {
        id: 'terr-4',
        title: 'Créer une zone géographique',
        content: `
          <p>Pour ajouter une nouvelle zone :</p>
          <ol>
            <li>Cliquez sur <strong>"Nouvelle zone"</strong></li>
            <li>Renseignez :
              <ul>
                <li><strong>Nom</strong> : Ex: "Dakar", "District de Thiès"</li>
                <li><strong>Code</strong> (optionnel) : Ex: "DK", "THIES-DS1"</li>
                <li><strong>Niveau</strong> : Sélectionnez selon votre nomenclature</li>
                <li><strong>Description</strong> (optionnelle)</li>
              </ul>
            </li>
            <li>Enregistrez</li>
          </ol>
          <p class="bg-amber-50 border border-amber-200 rounded p-2 text-sm text-amber-800 my-2">
            ⚠️ <strong>Attention :</strong> Les niveaux doivent suivre un ordre logique. Créez d'abord les pays, puis les régions, etc.
          </p>
        `,
      },
      {
        id: 'terr-5',
        title: 'Hiérarchie et navigation',
        content: `
          <p>Les zones s'organisent en <strong>arbre hiérarchique</strong> :</p>
          <ul>
            <li>Les zones de niveau supérieur (Pays, Régions) apparaissent en premier</li>
            <li>Cliquez sur <strong>▶</strong> pour déplier et voir les sous-zones</li>
            <li>Cliquez sur <strong>▼</strong> pour replier</li>
          </ul>
          <p><strong>Badge de niveau :</strong> Chaque zone affiche son niveau sous forme de badge coloré (Pays, Région, District, etc.)</p>
          <p><strong>Nombre d'activités :</strong> Le compteur "• X activité(s)" indique combien d'activités sont assignées à cette zone.</p>
        `,
      },
      {
        id: 'terr-6',
        title: 'Modifier ou supprimer une zone',
        content: `
          <p><strong>Pour modifier :</strong></p>
          <ol>
            <li>Passez la souris sur une zone → les boutons apparaissent</li>
            <li>Cliquez sur l'icône <strong>crayon</strong> ✏️</li>
            <li>Modifiez les informations et enregistrez</li>
          </ol>
          <p><strong>Pour supprimer :</strong></p>
          <ol>
            <li>Cliquez sur l'icône <strong>corbeille</strong> 🗑️</li>
            <li>Confirmez la suppression</li>
          </ol>
          <p class="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800 my-2">
            ⚠️ <strong>Restrictions :</strong>
            <ul class="mt-2">
              <li>Vous ne pouvez pas supprimer une zone qui contient des sous-zones</li>
              <li>Vous ne pouvez pas supprimer une zone assignée à des activités</li>
            </ul>
          </p>
        `,
      },
      {
        id: 'terr-7',
        title: 'Statistiques et performances',
        content: `
          <p>En bas de page, un tableau affiche les <strong>performances des zones de niveaux supérieurs</strong> (Pays, Régions) :</p>
          <ul>
            <li><strong>Activités</strong> : Nombre total d'activités dans la zone et ses sous-zones</li>
            <li><strong>Complétion</strong> : Pourcentage d'activités terminées
              <ul>
                <li class="text-green-700">≥ 80% = Vert (Excellent)</li>
                <li class="text-blue-700">≥ 50% = Bleu (Bien)</li>
                <li class="text-orange-700">< 50% = Orange (À améliorer)</li>
              </ul>
            </li>
            <li><strong>Budget Planifié</strong> : Somme des budgets de toutes les activités</li>
            <li><strong>Exécution</strong> : Pourcentage du budget effectivement dépensé (mêmes couleurs)</li>
          </ul>
          <p><strong>Les KPIs en haut de page</strong> agrègent les données de toutes vos zones pour une vue d'ensemble rapide.</p>
        `,
      },
      {
        id: 'terr-8',
        title: 'Cas d\'usage : Secteur Santé',
        content: `
          <p><strong>Exemple concret d'une organisation de santé au Sénégal :</strong></p>
          <ol>
            <li><strong>Étape 1 :</strong> Cliquer sur "Configurer" → Sélectionner <strong>SANTÉ</strong> → Enregistrer</li>
            <li><strong>Étape 2 :</strong> Créer les zones :
              <ul>
                <li>Niveau 0 (Pays) : "Sénégal"</li>
                <li>Niveau 1 (Région) : "Dakar", "Thiès", "Saint-Louis"</li>
                <li>Niveau 2 (District sanitaire) : "District Dakar Nord", "District Thiès Sud"</li>
                <li>Niveau 3 (Structure de santé) : "CS Yoff", "Hôpital Thiaroye", "CS Pikine"</li>
              </ul>
            </li>
            <li><strong>Étape 3 :</strong> Lors de la création d'activités, sélectionner le centre de santé concerné</li>
          </ol>
          <p><strong>Avantages :</strong> Le dashboard affichera automatiquement "District sanitaire" et "Structure de santé" au lieu de "Département" et "Commune".</p>
        `,
      },
    ],
  },
  {
    page: 'plans',
    articles: [
      {
        id: 'plan-1',
        title: 'Créer un plan d\'action',
        content: `
          <p>Pour créer un nouveau plan d'action :</p>
          <ol>
            <li>Cliquez sur le bouton <strong>"Nouveau plan"</strong></li>
            <li>Renseignez les informations : titre, période, objectifs</li>
            <li>Ajoutez vos axes stratégiques</li>
            <li>Sauvegardez en brouillon ou publiez directement</li>
          </ol>
        `,
      },
      {
        id: 'plan-2',
        title: 'Organiser en axes',
        content: `
          <p>Les <strong>axes</strong> permettent de structurer votre plan d'action en thématiques.</p>
          <p>Exemple : "Éducation", "Santé", "Infrastructures"</p>
          <p>Chaque axe contiendra ensuite vos activités.</p>
        `,
      },
    ],
  },
  {
    page: 'activities',
    articles: [
      {
        id: 'act-1',
        title: 'Créer une activité',
        content: `
          <p>Pour ajouter une activité :</p>
          <ol>
            <li>Sélectionnez un plan d'action et un axe</li>
            <li>Cliquez sur <strong>"Nouvelle activité"</strong></li>
            <li>Complétez : titre, responsable, dates, budget</li>
            <li>Ajoutez une checklist des tâches à réaliser</li>
          </ol>
        `,
      },
      {
        id: 'act-2',
        title: 'Suivre la progression',
        content: `
          <p>Le <strong>taux d'avancement</strong> se calcule automatiquement à partir :</p>
          <ul>
            <li>De la checklist des tâches</li>
            <li>Des documents joints</li>
            <li>Des indicateurs renseignés</li>
          </ul>
          <p>Mettez à jour régulièrement pour un suivi précis.</p>
        `,
      },
    ],
  },
  {
    page: 'validations',
    articles: [
      {
        id: 'val-1',
        title: 'Circuit de validation',
        content: `
          <p>Chaque activité passe par plusieurs étapes de validation :</p>
          <ol>
            <li><strong>Soumission</strong> : Le responsable soumet l'activité</li>
            <li><strong>Vérification hiérarchique</strong></li>
            <li><strong>Validation technique</strong></li>
            <li><strong>Validation administrative</strong></li>
            <li><strong>Clôture</strong></li>
          </ol>
        `,
      },
      {
        id: 'val-2',
        title: 'Approuver ou rejeter',
        content: `
          <p>En tant que validateur :</p>
          <ul>
            <li>Consultez les détails de l'activité</li>
            <li>Vérifiez les documents joints</li>
            <li>Approuvez ou rejetez avec un commentaire</li>
          </ul>
          <p><strong>Important :</strong> Un rejet renvoie l'activité au responsable pour corrections.</p>
        `,
      },
    ],
  },
  {
    page: 'budgets',
    articles: [
      {
        id: 'bud-1',
        title: 'Gérer les budgets',
        content: `
          <p>Chaque activité dispose de 4 niveaux budgétaires :</p>
          <ul>
            <li><strong>Planifié</strong> : Budget initial prévu</li>
            <li><strong>Engagé</strong> : Montants réservés</li>
            <li><strong>Décaissé</strong> : Fonds effectivement versés</li>
            <li><strong>Exécuté</strong> : Dépenses réalisées</li>
          </ul>
        `,
      },
      {
        id: 'bud-2',
        title: 'Suivre l\'exécution',
        content: `
          <p>Le <strong>taux d'exécution budgétaire</strong> se calcule ainsi :</p>
          <p><code>Taux = (Exécuté / Planifié) × 100</code></p>
          <p>Visez un taux proche de 100% en fin de période.</p>
        `,
      },
    ],
  },
  {
    page: 'participants',
    articles: [
      {
        id: 'part-1',
        title: 'Ajouter des participants',
        content: `
          <p>Pour enregistrer les participants d'une activité :</p>
          <ol>
            <li>Allez sur l'activité concernée</li>
            <li>Cliquez sur <strong>"Ajouter un participant"</strong></li>
            <li>Renseignez : nom, prénom, téléphone, mode de paiement</li>
          </ol>
        `,
      },
      {
        id: 'part-2',
        title: 'Importer depuis Excel',
        content: `
          <p>Vous pouvez importer une liste complète depuis un fichier Excel.</p>
          <p><strong>Format requis :</strong></p>
          <ul>
            <li>Colonnes : Prénom, Nom, Téléphone, Mode de paiement, Montant</li>
            <li>Modes acceptés : WAVE, ORANGE_MONEY</li>
          </ul>
        `,
      },
    ],
  },
  {
    page: 'capitalisation',
    articles: [
      {
        id: 'cap-1',
        title: 'Capitaliser les bonnes pratiques',
        content: `
          <p>La capitalisation vous permet de documenter :</p>
          <ul>
            <li><strong>Bonnes pratiques</strong> : Ce qui a bien fonctionné</li>
            <li><strong>Récits de changement</strong> : Témoignages d'impacts</li>
            <li><strong>Guides méthodologiques</strong> : Procédures réutilisables</li>
          </ul>
        `,
      },
      {
        id: 'cap-2',
        title: 'Structure d\'une fiche',
        content: `
          <p>Chaque fiche de capitalisation contient :</p>
          <ul>
            <li>Contexte : Où, quand, pourquoi ?</li>
            <li>Défis : Obstacles rencontrés</li>
            <li>Solutions : Comment avez-vous procédé ?</li>
            <li>Résultats : Impacts mesurés</li>
            <li>Leçons apprises : À retenir pour la suite</li>
          </ul>
        `,
      },
    ],
  },
  {
    page: 'planification',
    articles: [
      {
        id: 'planif-1',
        title: 'Plan de travail annuel (PTA)',
        content: `
          <p>Le PTA structure vos activités sur l'année :</p>
          <ol>
            <li>Créez votre PTA pour l'année en cours</li>
            <li>Définissez les objectifs annuels</li>
            <li>Répartissez les activités par trimestre</li>
            <li>Faites valider par votre hiérarchie</li>
          </ol>
        `,
      },
      {
        id: 'planif-2',
        title: 'Matrice de résultats',
        content: `
          <p>La matrice permet de lier :</p>
          <ul>
            <li><strong>Objectifs stratégiques</strong></li>
            <li><strong>Résultats attendus</strong></li>
            <li><strong>Indicateurs de mesure</strong></li>
          </ul>
          <p>C'est l'outil de pilotage de votre performance.</p>
        `,
      },
    ],
  },
  {
    page: 'documents',
    articles: [
      {
        id: 'doc-1',
        title: 'Joindre des documents',
        content: `
          <p>Vous pouvez joindre des fichiers à :</p>
          <ul>
            <li>Vos activités</li>
            <li>Les items de checklist</li>
            <li>Les fiches de capitalisation</li>
          </ul>
          <p><strong>Formats acceptés :</strong> PDF, Word, Excel, images (max 10 Mo).</p>
        `,
      },
    ],
  },
  {
    page: 'reports',
    articles: [
      {
        id: 'rep-1',
        title: 'Générer des rapports',
        content: `
          <p>Créez des rapports personnalisés :</p>
          <ul>
            <li>Sélectionnez la période</li>
            <li>Choisissez les plans d'action</li>
            <li>Exportez en Excel ou PDF</li>
          </ul>
          <p>Les rapports incluent : activités, budgets, indicateurs.</p>
        `,
      },
    ],
  },
  {
    page: 'indicators',
    articles: [
      {
        id: 'ind-1',
        title: 'Définir des indicateurs',
        content: `
          <p>Les indicateurs mesurent l'atteinte de vos objectifs.</p>
          <p><strong>Renseignez :</strong></p>
          <ul>
            <li>Valeur de référence (baseline)</li>
            <li>Cible à atteindre</li>
            <li>Valeur réalisée</li>
          </ul>
        `,
      },
    ],
  },
  {
    page: 'settings',
    articles: [
      {
        id: 'set-1',
        title: 'Paramètres du compte',
        content: `
          <p>Dans les paramètres, vous pouvez :</p>
          <ul>
            <li>Modifier vos informations personnelles</li>
            <li>Changer votre mot de passe</li>
            <li>Activer l'authentification 2FA</li>
            <li>Personnaliser la couleur de votre organisation</li>
          </ul>
        `,
      },
    ],
  },
  {
    page: 'recommendations',
    articles: [
      {
        id: 'rec-1',
        title: 'Qu\'est-ce qu\'une recommandation ?',
        content: `
          <p>Les recommandations sont des observations issues de :</p>
          <ul>
            <li><strong>Audits</strong> internes ou externes</li>
            <li><strong>Missions</strong> de supervision</li>
            <li><strong>Évaluations</strong> de projets ou programmes</li>
            <li><strong>Contrôles</strong> qualité, internes, financiers</li>
          </ul>
          <p>Chaque recommandation doit être suivie jusqu'à sa clôture.</p>
        `,
      },
      {
        id: 'rec-2',
        title: 'Créer une recommandation',
        content: `
          <p>Pour enregistrer une recommandation :</p>
          <ol>
            <li>Cliquez sur <strong>"Nouvelle recommandation"</strong></li>
            <li>Renseignez : titre, description, source</li>
            <li>Définissez la priorité (Critique, Élevée, Moyenne, Faible)</li>
            <li>Assignez un responsable et un validateur</li>
            <li>Fixez les dates d'émission et d'échéance</li>
          </ol>
          <p><strong>Un code unique</strong> (REC-YYYY-NNN) est généré automatiquement.</p>
        `,
      },
      {
        id: 'rec-3',
        title: 'Workflow de suivi',
        content: `
          <p>Une recommandation passe par plusieurs statuts :</p>
          <ul>
            <li><strong>Non démarrée</strong> → Cliquez "Démarrer" pour la prendre en charge</li>
            <li><strong>En cours</strong> → Ajoutez des actions et mettez à jour la progression</li>
            <li><strong>Partiellement mise en œuvre</strong> → Progression entre 1% et 99%</li>
            <li><strong>Réalisée à valider</strong> → Le responsable a terminé, en attente de validation</li>
            <li><strong>Validée</strong> → Le validateur confirme la clôture</li>
          </ul>
          <p>Vous pouvez <strong>Suspendre</strong> ou <strong>Rouvrir</strong> une recommandation si nécessaire.</p>
        `,
      },
      {
        id: 'rec-4',
        title: 'Gérer les actions',
        content: `
          <p>Pour chaque recommandation, définissez des <strong>actions concrètes</strong> :</p>
          <ul>
            <li>Titre et description de l'action</li>
            <li>Échéance (optionnel)</li>
            <li>Responsable de l'exécution</li>
          </ul>
          <p>Les actions permettent de décomposer une recommandation complexe en tâches réalisables.</p>
        `,
      },
      {
        id: 'rec-5',
        title: 'Suivre la progression',
        content: `
          <p>La <strong>progression</strong> indique l'avancement de la mise en œuvre :</p>
          <ul>
            <li>Cliquez sur <strong>"Modifier"</strong> sous la barre de progression</li>
            <li>Saisissez un pourcentage entre 0% et 100%</li>
            <li>La couleur change automatiquement (rouge → orange → bleu → vert)</li>
          </ul>
          <p><strong>Astuce :</strong> Mettez à jour régulièrement pour un suivi en temps réel.</p>
        `,
      },
      {
        id: 'rec-6',
        title: 'Commenter et collaborer',
        content: `
          <p>Utilisez les <strong>commentaires</strong> pour :</p>
          <ul>
            <li>Documenter l'avancement</li>
            <li>Signaler des blocages</li>
            <li>Partager des ressources</li>
          </ul>
          <p>Cochez <strong>"Marquer comme important"</strong> pour mettre en évidence un commentaire critique.</p>
        `,
      },
      {
        id: 'rec-7',
        title: 'Filtrer et rechercher',
        content: `
          <p>Sur la page principale, utilisez les filtres pour :</p>
          <ul>
            <li>Afficher un statut spécifique (En cours, Validée, etc.)</li>
            <li>Filtrer par priorité (Critique, Élevée, etc.)</li>
            <li>Sélectionner une source (Audit interne, Mission, etc.)</li>
          </ul>
          <p>Les <strong>stats en haut</strong> vous donnent une vue d'ensemble rapide.</p>
        `,
      },
    ],
  },
  {
    page: 'passation',
    articles: [
      {
        id: 'pass-1',
        title: 'Vue d\'ensemble du module Passation',
        content: `
          <p>Le module Passation centralise la gestion complète de vos marchés publics :</p>
          <ul>
            <li><strong>PPM</strong> : Plans de Passation des Marchés annuels</li>
            <li><strong>Demandes d'achat</strong> : Requêtes émanant des services</li>
            <li><strong>Fournisseurs</strong> : Base de données des prestataires</li>
            <li><strong>Procédures</strong> : Appels d'offres et consultations</li>
            <li><strong>Contrats</strong> : Suivi des contrats signés</li>
          </ul>
        `,
      },
      {
        id: 'pass-2',
        title: 'Workflow type',
        content: `
          <p>Un processus standard suit ce flux :</p>
          <ol>
            <li>Création d'une <strong>demande d'achat</strong></li>
            <li>Validation et intégration au <strong>PPM</strong></li>
            <li>Lancement d'une <strong>procédure</strong> avec publication</li>
            <li>Évaluation des offres et attribution</li>
            <li>Signature du <strong>contrat</strong> avec le fournisseur</li>
          </ol>
        `,
      },
    ],
  },
  {
    page: 'passation-ppm',
    articles: [
      {
        id: 'ppm-1',
        title: 'Créer un PPM',
        content: `
          <p>Le Plan de Passation des Marchés structure vos achats annuels :</p>
          <ol>
            <li>Cliquez sur <strong>"Nouveau PPM"</strong></li>
            <li>Renseignez l'année, le projet associé</li>
            <li>Ajoutez les lignes PPM : objet, méthode, montant estimé</li>
            <li>Sauvegardez en brouillon ou validez directement</li>
          </ol>
          <p><strong>Astuce :</strong> Importez vos lignes depuis Excel pour gagner du temps.</p>
        `,
      },
      {
        id: 'ppm-2',
        title: 'Types de procédures',
        content: `
          <p>Choisissez la méthode adaptée au montant :</p>
          <ul>
            <li><strong>Gré à gré</strong> : Marchés de faible montant</li>
            <li><strong>Consultation</strong> : Montants moyens (3 à 5 fournisseurs)</li>
            <li><strong>Appel d'offres ouvert</strong> : Marchés importants</li>
            <li><strong>Appel d'offres restreint</strong> : Prestataires présélectionnés</li>
          </ul>
        `,
      },
      {
        id: 'ppm-3',
        title: 'Suivi et reporting',
        content: `
          <p>Utilisez les filtres pour analyser :</p>
          <ul>
            <li>Statut des lignes (brouillon, en cours, clôturé)</li>
            <li>Répartition par année</li>
            <li>Montants totaux engagés par projet</li>
          </ul>
          <p>Les KPIs vous donnent une vue d'ensemble instantanée de votre planification.</p>
        `,
      },
      {
        id: 'ppm-4',
        title: 'Règle : 1 PPM par année et par organisation',
        content: `
          <p><strong>⚠️ Contrainte d'unicité :</strong> Chaque organisation ne peut créer qu'<strong>un seul PPM par année</strong>.</p>
          <p>Si vous tentez de créer un deuxième PPM pour la même année, vous recevrez une erreur :</p>
          <p class="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800 my-2">
            "Un PPM existe déjà pour l'année XXXX dans votre organisation"
          </p>
          <p><strong>Solutions :</strong></p>
          <ul>
            <li>Si le PPM existant est en <strong>BROUILLON</strong> : vous pouvez le modifier ou le supprimer</li>
            <li>Si le PPM est <strong>VALIDÉ</strong> : contactez votre administrateur</li>
            <li>Créez un PPM pour une autre année</li>
          </ul>
          <p class="text-xs text-slate-600 mt-2">Cette règle garantit qu'un seul document de planification officiel existe par an, évitant contradictions et confusion.</p>
        `,
      },
      {
        id: 'ppm-5',
        title: 'Champs obligatoires et validation',
        content: `
          <p>Lors de la création d'un PPM, vous devez obligatoirement renseigner :</p>
          <ul>
            <li><strong>Titre</strong> : Nom descriptif du plan (ex: "PPM 2026 - Infrastructure")</li>
            <li><strong>Année</strong> : Année de planification (ex: 2026)</li>
          </ul>
          <p><strong>Optionnel :</strong></p>
          <ul>
            <li><strong>Projet</strong> : Vous pouvez rattacher le PPM à un plan d'action existant</li>
          </ul>
          <p class="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800 my-2">
            💡 <strong>Astuce :</strong> Les PPM en brouillon peuvent être modifiés. L'année ne peut PAS être changée après création (créez un nouveau PPM si nécessaire).
          </p>
        `,
      },
    ],
  },
  {
    page: 'passation-demandes',
    articles: [
      {
        id: 'dem-1',
        title: 'Créer une demande d\'achat',
        content: `
          <p>Pour initier une nouvelle demande :</p>
          <ol>
            <li>Cliquez sur <strong>"Nouvelle demande"</strong></li>
            <li>Renseignez : objet, description détaillée</li>
            <li>Précisez le montant estimé</li>
            <li>Liez à une ligne PPM si applicable</li>
            <li>Ajoutez les justifications et documents</li>
          </ol>
        `,
      },
      {
        id: 'dem-2',
        title: 'Circuit de validation',
        content: `
          <p>Une demande passe par plusieurs étapes :</p>
          <ul>
            <li><strong>Brouillon</strong> : En cours de rédaction</li>
            <li><strong>Soumise</strong> : Transmise pour validation</li>
            <li><strong>En validation</strong> : En cours d'examen</li>
            <li><strong>Approuvée</strong> : Validée, peut passer en procédure</li>
            <li><strong>Rejetée</strong> : Refusée avec commentaires</li>
          </ul>
        `,
      },
      {
        id: 'dem-3',
        title: 'Recherche et filtres',
        content: `
          <p>Retrouvez rapidement vos demandes avec :</p>
          <ul>
            <li>Recherche par référence, objet ou demandeur</li>
            <li>Filtres par statut (en validation, approuvée, etc.)</li>
            <li>Vue des KPIs : total, en validation, approuvées</li>
          </ul>
        `,
      },
    ],
  },
  {
    page: 'passation-fournisseurs',
    articles: [
      {
        id: 'four-1',
        title: 'Enregistrer un fournisseur',
        content: `
          <p>Pour ajouter un nouveau fournisseur :</p>
          <ol>
            <li>Cliquez sur <strong>"Nouveau fournisseur"</strong></li>
            <li>Renseignez : raison sociale, identifiant fiscal</li>
            <li>Ajoutez les coordonnées : adresse, téléphone, email</li>
            <li>Joignez les documents : RC, NINEA, quitus fiscal</li>
          </ol>
          <p><strong>Important :</strong> Un fournisseur doit être validé avant de soumissionner.</p>
        `,
      },
      {
        id: 'four-2',
        title: 'Gérer les statuts',
        content: `
          <p>Les fournisseurs peuvent avoir différents statuts :</p>
          <ul>
            <li><strong>À valider</strong> : Dossier en cours d'examen</li>
            <li><strong>Actif</strong> : Qualifié, peut soumissionner</li>
            <li><strong>Suspendu</strong> : Temporairement inéligible</li>
            <li><strong>Blacklisté</strong> : Exclu définitivement</li>
            <li><strong>Archivé</strong> : N'est plus actif</li>
          </ul>
        `,
      },
      {
        id: 'four-3',
        title: 'Historique et performance',
        content: `
          <p>Sur la fiche fournisseur, consultez :</p>
          <ul>
            <li>Nombre de soumissions déposées</li>
            <li>Contrats en cours et terminés</li>
            <li>Historique des évaluations</li>
            <li>Notes et commentaires internes</li>
          </ul>
        `,
      },
    ],
  },
  {
    page: 'passation-procedures',
    articles: [
      {
        id: 'proc-1',
        title: 'Lancer une procédure',
        content: `
          <p>Pour publier un appel d'offres :</p>
          <ol>
            <li>Cliquez sur <strong>"Nouvelle procédure"</strong></li>
            <li>Sélectionnez le type : AOO, AOR, Consultation, Gré à gré</li>
            <li>Renseignez l'objet, le montant estimé</li>
            <li>Fixez les dates : publication, clôture, ouverture</li>
            <li>Joignez le DAO (Dossier d'Appel d'Offres)</li>
          </ol>
        `,
      },
      {
        id: 'proc-2',
        title: 'Réceptionner les soumissions',
        content: `
          <p>Les soumissions sont enregistrées jusqu'à la date de clôture.</p>
          <p>À l'ouverture des plis :</p>
          <ul>
            <li>Vérifiez la conformité administrative</li>
            <li>Vérifiez la conformité technique</li>
            <li>Enregistrez les montants proposés</li>
          </ul>
        `,
      },
      {
        id: 'proc-3',
        title: 'Évaluation et attribution',
        content: `
          <p>La commission d'évaluation :</p>
          <ol>
            <li>Note chaque offre selon les critères du DAO</li>
            <li>Classe les soumissions par score</li>
            <li>Propose l'attribution au mieux-disant</li>
            <li>Rédige le rapport d'évaluation</li>
          </ol>
          <p>Le statut passe à <strong>"Attribuée"</strong> après validation.</p>
        `,
      },
      {
        id: 'proc-4',
        title: 'Contrainte : 1 ligne PPM = 1 procédure maximum',
        content: `
          <p><strong>⚠️ Règle d'unicité :</strong> Une ligne PPM ne peut être rattachée qu'à <strong>une seule procédure</strong>.</p>
          <p>Si vous tentez de lier une ligne PPM déjà utilisée, vous recevrez :</p>
          <p class="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800 my-2">
            "Cette ligne PPM est déjà rattachée à la procédure XXX"
          </p>
          <p><strong>Vérifications automatiques :</strong></p>
          <ul>
            <li>La ligne PPM doit appartenir à votre organisation</li>
            <li>Elle ne doit pas déjà être liée à une autre procédure</li>
            <li>Le rattachement est <strong>optionnel</strong> lors de la création</li>
          </ul>
          <p class="text-xs text-slate-600 mt-2">Cette contrainte assure la traçabilité entre planification (PPM) et exécution (procédures).</p>
        `,
      },
      {
        id: 'proc-5',
        title: 'Champs obligatoires et erreurs fréquentes',
        content: `
          <p><strong>Champs obligatoires :</strong></p>
          <ul>
            <li><strong>Objet</strong> : Description de la procédure</li>
            <li><strong>Méthode</strong> : Type de passation (AOO, AOR, DC, etc.)</li>
            <li><strong>Montant estimé</strong> : Budget prévisionnel (≥ 0, max 2 décimales)</li>
            <li><strong>Description</strong> : Détails complets</li>
          </ul>
          <p><strong>Erreurs fréquentes :</strong></p>
          <ul>
            <li>"Ligne PPM introuvable" → La ligne n'existe pas dans votre organisation</li>
            <li>"Déjà rattachée" → Cette ligne PPM est utilisée par une autre procédure</li>
            <li>"Montant invalide" → Le montant doit être ≥ 0 avec maximum 2 décimales</li>
          </ul>
          <p class="bg-amber-50 border border-amber-200 rounded p-2 text-sm text-amber-800 my-2">
            ⚠️ <strong>Attention :</strong> Une fois publiée, seul le statut de la procédure peut être modifié. Les autres champs sont verrouillés.
          </p>
        `,
      },
    ],
  },
  {
    page: 'passation-contrats',
    articles: [
      {
        id: 'cont-1',
        title: 'Créer un contrat',
        content: `
          <p>Après attribution d'une procédure :</p>
          <ol>
            <li>Cliquez sur <strong>"Nouveau contrat"</strong></li>
            <li>Liez-le à la procédure et au fournisseur attributaire</li>
            <li>Renseignez : montant initial, dates de signature/échéance</li>
            <li>Joignez le contrat signé scanné</li>
          </ol>
        `,
      },
      {
        id: 'cont-2',
        title: 'Suivre l\'exécution',
        content: `
          <p>Durant la vie du contrat :</p>
          <ul>
            <li>Suivez les paiements effectués (acomptes, solde)</li>
            <li>Enregistrez les avenants si le montant change</li>
            <li>Suivez les délais d'exécution</li>
            <li>Ajoutez des rapports de suivi</li>
          </ul>
          <p>Le statut passe de <strong>"Signé"</strong> à <strong>"Terminé"</strong> à l'achèvement.</p>
        `,
      },
      {
        id: 'cont-3',
        title: 'Gestion des avenants',
        content: `
          <p>Un avenant modifie un contrat en cours :</p>
          <ul>
            <li>Augmentation/diminution du montant</li>
            <li>Prolongation des délais</li>
            <li>Modification du scope</li>
          </ul>
          <p>Le <strong>montant révisé</strong> remplace alors le montant initial dans les rapports.</p>
        `,
      },
      {
        id: 'cont-4',
        title: 'Contrainte : 1 procédure = 1 contrat maximum',
        content: `
          <p><strong>⚠️ Règle d'unicité :</strong> Une procédure ne peut avoir qu'<strong>un seul contrat</strong>.</p>
          <p>Si vous tentez de créer un deuxième contrat pour la même procédure, vous recevrez :</p>
          <p class="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800 my-2">
            "Un contrat existe déjà pour cette procédure : REF-XXX"
          </p>
          <p><strong>Conditions préalables :</strong></p>
          <ul>
            <li>La procédure doit exister dans votre organisation</li>
            <li>La procédure doit être en statut <strong>CLOTUREE_OFFRES</strong> ou <strong>ATTRIBUEE</strong></li>
            <li>Aucun contrat ne doit déjà exister pour cette procédure</li>
            <li>Le fournisseur doit exister dans votre base</li>
          </ul>
          <p class="text-xs text-slate-600 mt-2">Cette contrainte garantit qu'une procédure aboutit à un contrat unique, évitant les doublons contractuels.</p>
        `,
      },
      {
        id: 'cont-5',
        title: 'Validation et erreurs fréquentes',
        content: `
          <p><strong>Champs obligatoires :</strong></p>
          <ul>
            <li><strong>Procédure</strong> : ID de la procédure attributaire</li>
            <li><strong>Fournisseur</strong> : Prestataire sélectionné</li>
            <li><strong>Montant initial</strong> : Montant du contrat (≥ 0, max 2 décimales)</li>
            <li><strong>Date signature</strong> : Date officielle de signature (format ISO)</li>
            <li><strong>Date échéance</strong> : Date de fin du contrat (format ISO)</li>
          </ul>
          <p><strong>Erreurs fréquentes et solutions :</strong></p>
          <ul>
            <li><strong>"Procédure introuvable"</strong> → Vérifiez que la procédure existe dans votre organisation</li>
            <li><strong>"La procédure doit être clôturée ou attribuée"</strong> → Changez d'abord le statut de la procédure</li>
            <li><strong>"Un contrat existe déjà"</strong> → Utilisez le contrat existant ou supprimez-le si nécessaire</li>
            <li><strong>"Fournisseur introuvable"</strong> → Créez d'abord le fournisseur dans votre base</li>
          </ul>
          <p class="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800 my-2">
            💡 <strong>Bon à savoir :</strong> Toutes les dates doivent être au format ISO (YYYY-MM-DD). Les montants ne peuvent pas être négatifs.
          </p>
        `,
      },
    ],
  },
];

/**
 * Récupère les articles d'aide pour une page donnée
 */
export function getHelpForPage(page: string): HelpArticle[] {
  const helpPage = HELP_CONTENT.find(h => h.page === page);
  return helpPage?.articles ?? [];
}
