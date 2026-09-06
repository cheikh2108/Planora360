"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZONE_PRESET_LIST = exports.ZONE_PRESETS = void 0;
exports.ZONE_PRESETS = {
    STANDARD: {
        name: 'Standard',
        description: 'Configuration standard: Pays → Région → Département → Commune',
        levelLabels: {
            '0': 'Pays',
            '1': 'Région',
            '2': 'Département',
            '3': 'Commune',
        },
    },
    SANTE: {
        name: 'Santé',
        description: 'Configuration pour projets de santé: Pays → Région → District sanitaire → Structure de santé',
        levelLabels: {
            '0': 'Pays',
            '1': 'Région',
            '2': 'District sanitaire',
            '3': 'Structure de santé',
        },
    },
    EDUCATION: {
        name: 'Éducation',
        description: 'Configuration pour projets d\'éducation: Pays → Région → Inspection → Établissement',
        levelLabels: {
            '0': 'Pays',
            '1': 'Région',
            '2': 'Inspection',
            '3': 'Établissement',
        },
    },
    AGRICULTURE: {
        name: 'Agriculture',
        description: 'Configuration pour projets agricoles: Pays → Région → Zone agro-écologique → Site de production',
        levelLabels: {
            '0': 'Pays',
            '1': 'Région',
            '2': 'Zone agro-écologique',
            '3': 'Site de production',
        },
    },
    CUSTOM: {
        name: 'Personnalisé',
        description: 'Configuration personnalisée (à définir)',
        levelLabels: {
            '0': 'Niveau 0',
            '1': 'Niveau 1',
            '2': 'Niveau 2',
            '3': 'Niveau 3',
        },
    },
};
exports.ZONE_PRESET_LIST = Object.keys(exports.ZONE_PRESETS);
//# sourceMappingURL=zone-presets.js.map