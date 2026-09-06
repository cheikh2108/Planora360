export declare const ZONE_PRESETS: {
    STANDARD: {
        name: string;
        description: string;
        levelLabels: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        };
    };
    SANTE: {
        name: string;
        description: string;
        levelLabels: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        };
    };
    EDUCATION: {
        name: string;
        description: string;
        levelLabels: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        };
    };
    AGRICULTURE: {
        name: string;
        description: string;
        levelLabels: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        };
    };
    CUSTOM: {
        name: string;
        description: string;
        levelLabels: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        };
    };
};
export type ZonePreset = keyof typeof ZONE_PRESETS;
export declare const ZONE_PRESET_LIST: ZonePreset[];
