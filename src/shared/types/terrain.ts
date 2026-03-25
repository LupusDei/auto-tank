export type TerrainTheme = 'desert' | 'arctic' | 'volcanic' | 'lunar' | 'classic';

export interface TerrainPoint {
  readonly x: number;
  readonly y: number;
}

export interface TerrainConfig {
  readonly width: number;
  readonly height: number;
  readonly seed: number;
  readonly roughness: number;
  readonly theme: TerrainTheme;
}

export interface TerrainData {
  readonly config: TerrainConfig;
  readonly heightMap: readonly number[];
  readonly destructionMap: readonly boolean[];
}
