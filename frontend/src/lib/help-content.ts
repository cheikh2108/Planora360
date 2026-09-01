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
