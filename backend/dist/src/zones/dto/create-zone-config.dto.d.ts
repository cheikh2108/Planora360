import { ZonePreset } from '../constants/zone-presets';
export declare class CreateZoneConfigDto {
    preset: ZonePreset;
    levelLabels?: Record<string, string>;
    description?: string;
}
