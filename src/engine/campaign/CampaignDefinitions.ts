import type { AIDifficulty } from '@engine/ai/AIController';
import type { TerrainTheme } from '@shared/types/terrain';

export interface CampaignMission {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly theme: TerrainTheme;
  readonly aiDifficulty: AIDifficulty;
  readonly aiCount: number;
  readonly rounds: number;
  readonly starThresholds: { readonly one: number; readonly two: number; readonly three: number };
}

export interface Campaign {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly missions: readonly CampaignMission[];
}

export const CAMPAIGNS: readonly Campaign[] = [
  {
    id: 'boot-camp',
    name: 'Boot Camp',
    description: 'Learn the basics of tank warfare',
    missions: [
      {
        id: 'bc-1',
        name: 'First Shot',
        description: 'Learn to aim and fire',
        theme: 'classic',
        aiDifficulty: 'easy',
        aiCount: 1,
        rounds: 3,
        starThresholds: { one: 500, two: 1500, three: 3000 },
      },
      {
        id: 'bc-2',
        name: 'Wind Factor',
        description: 'Master wind compensation',
        theme: 'desert',
        aiDifficulty: 'easy',
        aiCount: 1,
        rounds: 3,
        starThresholds: { one: 800, two: 2000, three: 4000 },
      },
      {
        id: 'bc-3',
        name: 'Two on One',
        description: 'Face two opponents',
        theme: 'classic',
        aiDifficulty: 'easy',
        aiCount: 2,
        rounds: 3,
        starThresholds: { one: 1000, two: 3000, three: 6000 },
      },
    ],
  },
  {
    id: 'warzone',
    name: 'Warzone',
    description: 'Prove yourself in medium difficulty battles',
    missions: [
      {
        id: 'wz-1',
        name: 'Desert Storm',
        description: 'Battle in the dunes',
        theme: 'desert',
        aiDifficulty: 'medium',
        aiCount: 2,
        rounds: 5,
        starThresholds: { one: 2000, two: 5000, three: 10000 },
      },
      {
        id: 'wz-2',
        name: 'Frozen Conflict',
        description: 'Ice cold warfare',
        theme: 'arctic',
        aiDifficulty: 'medium',
        aiCount: 3,
        rounds: 5,
        starThresholds: { one: 3000, two: 7000, three: 15000 },
      },
      {
        id: 'wz-3',
        name: 'Volcanic Fury',
        description: 'Fight on the edge of destruction',
        theme: 'volcanic',
        aiDifficulty: 'hard',
        aiCount: 2,
        rounds: 5,
        starThresholds: { one: 4000, two: 10000, three: 20000 },
      },
    ],
  },
  {
    id: 'elite-ops',
    name: 'Elite Operations',
    description: 'Only the best survive',
    missions: [
      {
        id: 'eo-1',
        name: 'Lunar Base',
        description: 'Low gravity, high stakes',
        theme: 'lunar',
        aiDifficulty: 'hard',
        aiCount: 3,
        rounds: 7,
        starThresholds: { one: 5000, two: 15000, three: 30000 },
      },
      {
        id: 'eo-2',
        name: 'Gauntlet',
        description: 'Face 4 expert opponents',
        theme: 'volcanic',
        aiDifficulty: 'expert',
        aiCount: 4,
        rounds: 7,
        starThresholds: { one: 8000, two: 20000, three: 50000 },
      },
      {
        id: 'eo-3',
        name: 'Final Stand',
        description: 'The ultimate challenge',
        theme: 'classic',
        aiDifficulty: 'expert',
        aiCount: 5,
        rounds: 10,
        starThresholds: { one: 10000, two: 30000, three: 75000 },
      },
    ],
  },
];

/** Get a campaign by ID. */
export function getCampaign(id: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}

/** Get all campaign IDs. */
export function getCampaignIds(): string[] {
  return CAMPAIGNS.map((c) => c.id);
}

/** Get a specific mission. */
export function getMission(campaignId: string, missionId: string): CampaignMission | undefined {
  return getCampaign(campaignId)?.missions.find((m) => m.id === missionId);
}

/** Calculate star rating for a score. */
export function calculateStars(
  score: number,
  thresholds: CampaignMission['starThresholds'],
): number {
  if (score >= thresholds.three) return 3;
  if (score >= thresholds.two) return 2;
  if (score >= thresholds.one) return 1;
  return 0;
}
