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
];

/**
 * Récupère les articles d'aide pour une page donnée
 */
export function getHelpForPage(page: string): HelpArticle[] {
  const helpPage = HELP_CONTENT.find(h => h.page === page);
  return helpPage?.articles ?? [];
}
