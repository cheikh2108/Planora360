import { ZonePreset } from '../constants/zone-presets';
export declare class UpdateZoneConfigDto {
    preset?: ZonePreset;
    levelLabels?: Record<string, string>;
    description?: string;
}
