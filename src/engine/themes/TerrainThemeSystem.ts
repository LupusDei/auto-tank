import type { SkyGradientStop } from '@renderer/sky/SkyRenderer';
import type { TerrainTheme } from '@shared/types/terrain';

export interface ThemeConfig {
  readonly id: TerrainTheme;
  readonly name: string;
  readonly terrainFill: string;
  readonly terrainStroke: string;
  readonly terrainHighlight: string;
  readonly skyGradient: readonly SkyGradientStop[];
  readonly waterColor: string;
  readonly particleColor: string;
  readonly roughness: number;
  readonly description: string;
}

export const THEMES: Record<TerrainTheme, ThemeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Rolling green hills',
    terrainFill: '#4a7c2e',
    terrainStroke: '#3a6422',
    terrainHighlight: '#5a9436',
    skyGradient: [
      { offset: 0, color: '#0a0a2e' },
      { offset: 0.5, color: '#2d1b69' },
      { offset: 1, color: '#f4a460' },
    ],
    waterColor: '#2196F3',
    particleColor: '#2ecc71',
    roughness: 0.6,
  },
  desert: {
    id: 'desert',
    name: 'Scorching Desert',
    description: 'Sandy dunes under blazing sun',
    terrainFill: '#c4a35a',
    terrainStroke: '#a8893e',
    terrainHighlight: '#d4b86a',
    skyGradient: [
      { offset: 0, color: '#1a0a00' },
      { offset: 0.3, color: '#ff6600' },
      { offset: 1, color: '#ffcc66' },
    ],
    waterColor: '#66aacc',
    particleColor: '#d4a35a',
    roughness: 0.4,
  },
  arctic: {
    id: 'arctic',
    name: 'Frozen Tundra',
    description: 'Ice and snow under pale skies',
    terrainFill: '#d0e0e8',
    terrainStroke: '#b0c0c8',
    terrainHighlight: '#e0f0f8',
    skyGradient: [
      { offset: 0, color: '#001133' },
      { offset: 0.5, color: '#4477aa' },
      { offset: 1, color: '#ccddee' },
    ],
    waterColor: '#88ccee',
    particleColor: '#ffffff',
    roughness: 0.3,
  },
  volcanic: {
    id: 'volcanic',
    name: 'Volcanic Hellscape',
    description: 'Lava and ash under dark skies',
    terrainFill: '#4a3030',
    terrainStroke: '#3a2020',
    terrainHighlight: '#6a4040',
    skyGradient: [
      { offset: 0, color: '#000000' },
      { offset: 0.4, color: '#330000' },
      { offset: 1, color: '#ff2200' },
    ],
    waterColor: '#ff4400',
    particleColor: '#ff6600',
    roughness: 0.7,
  },
  lunar: {
    id: 'lunar',
    name: 'Moonscape',
    description: 'Craters and dust in low gravity',
    terrainFill: '#808080',
    terrainStroke: '#606060',
    terrainHighlight: '#a0a0a0',
    skyGradient: [
      { offset: 0, color: '#000000' },
      { offset: 0.8, color: '#0a0a1a' },
      { offset: 1, color: '#1a1a2e' },
    ],
    waterColor: '#333333',
    particleColor: '#cccccc',
    roughness: 0.5,
  },
};

/** Get theme config by ID. */
export function getTheme(id: TerrainTheme): ThemeConfig {
  return THEMES[id];
}

/** Get all available theme IDs. */
export function getAvailableThemes(): TerrainTheme[] {
  return Object.keys(THEMES) as TerrainTheme[];
}

/** Get theme name for display. */
export function getThemeName(id: TerrainTheme): string {
  return THEMES[id].name;
}
