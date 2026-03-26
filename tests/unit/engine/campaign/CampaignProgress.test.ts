import {
  createEmptyProgress,
  getCampaignTotalStars,
  getMissionStars,
  isMissionUnlocked,
  recordMissionResult,
} from '@engine/campaign/CampaignProgress';
import { describe, expect, it } from 'vitest';
import { CAMPAIGNS } from '@engine/campaign/CampaignDefinitions';

describe('CampaignProgress', () => {
  it('should start with empty progress', () => {
    const store = createEmptyProgress();
    expect(Object.keys(store.campaigns)).toHaveLength(0);
  });

  it('should record mission result', () => {
    const mission = CAMPAIGNS[0]?.missions[0];
    if (!mission) return;
    const store = recordMissionResult(createEmptyProgress(), 'boot-camp', mission, 2000);
    expect(getMissionStars(store, 'boot-camp', 'bc-1')).toBe(2);
  });

  it('should keep best score', () => {
    const mission = CAMPAIGNS[0]?.missions[0];
    if (!mission) return;
    let store = recordMissionResult(createEmptyProgress(), 'boot-camp', mission, 5000);
    store = recordMissionResult(store, 'boot-camp', mission, 1000);
    expect(getMissionStars(store, 'boot-camp', 'bc-1')).toBe(3); // 5000 > 3000 threshold
  });

  it('should calculate total campaign stars', () => {
    const missions = CAMPAIGNS[0]?.missions ?? [];
    let store = createEmptyProgress();
    for (const m of missions) {
      store = recordMissionResult(store, 'boot-camp', m, 10000);
    }
    expect(getCampaignTotalStars(store, 'boot-camp')).toBe(9); // 3 missions × 3 stars
  });

  it('should unlock first mission by default', () => {
    const missions = CAMPAIGNS[0]?.missions ?? [];
    expect(isMissionUnlocked(createEmptyProgress(), 'boot-camp', 'bc-1', missions)).toBe(true);
  });

  it('should lock second mission until first completed', () => {
    const missions = CAMPAIGNS[0]?.missions ?? [];
    expect(isMissionUnlocked(createEmptyProgress(), 'boot-camp', 'bc-2', missions)).toBe(false);

    const mission1 = missions[0];
    if (!mission1) return;
    const store = recordMissionResult(createEmptyProgress(), 'boot-camp', mission1, 1000);
    expect(isMissionUnlocked(store, 'boot-camp', 'bc-2', missions)).toBe(true);
  });
});
