import { calculateStars, type CampaignMission } from './CampaignDefinitions';

export interface MissionResult {
  readonly missionId: string;
  readonly score: number;
  readonly stars: number;
  readonly completed: boolean;
  readonly timestamp: number;
}

export interface CampaignProgressData {
  readonly campaignId: string;
  readonly results: Record<string, MissionResult>;
}

export interface ProgressStore {
  readonly campaigns: Record<string, CampaignProgressData>;
}

const STORAGE_KEY = 'auto-tank-progress';

/** Create empty progress store. */
export function createEmptyProgress(): ProgressStore {
  return { campaigns: {} };
}

/** Record a mission result. Updates best score if higher. */
export function recordMissionResult(
  store: ProgressStore,
  campaignId: string,
  mission: CampaignMission,
  score: number,
): ProgressStore {
  const stars = calculateStars(score, mission.starThresholds);
  const existing = store.campaigns[campaignId]?.results[mission.id];
  const bestScore = Math.max(score, existing?.score ?? 0);
  const bestStars = Math.max(stars, existing?.stars ?? 0);

  const result: MissionResult = {
    missionId: mission.id,
    score: bestScore,
    stars: bestStars,
    completed: true,
    timestamp: Date.now(),
  };

  const campaignProgress: CampaignProgressData = {
    campaignId,
    results: { ...store.campaigns[campaignId]?.results, [mission.id]: result },
  };

  return { campaigns: { ...store.campaigns, [campaignId]: campaignProgress } };
}

/** Get stars for a specific mission. */
export function getMissionStars(
  store: ProgressStore,
  campaignId: string,
  missionId: string,
): number {
  return store.campaigns[campaignId]?.results[missionId]?.stars ?? 0;
}

/** Get total stars for a campaign. */
export function getCampaignTotalStars(store: ProgressStore, campaignId: string): number {
  const results = store.campaigns[campaignId]?.results ?? {};
  return Object.values(results).reduce((sum, r) => sum + r.stars, 0);
}

/** Check if a mission is unlocked (previous mission completed or first mission). */
export function isMissionUnlocked(
  store: ProgressStore,
  campaignId: string,
  missionId: string,
  missions: readonly CampaignMission[],
): boolean {
  const idx = missions.findIndex((m) => m.id === missionId);
  if (idx === 0) return true;
  const prevMission = missions[idx - 1];
  if (!prevMission) return false;
  return store.campaigns[campaignId]?.results[prevMission.id]?.completed ?? false;
}

/** Save progress to localStorage. */
export function saveProgress(store: ProgressStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage unavailable
  }
}

/** Load progress from localStorage. */
export function loadProgress(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyProgress();
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return createEmptyProgress();
  }
}
