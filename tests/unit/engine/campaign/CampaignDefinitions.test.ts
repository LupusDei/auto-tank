import {
  calculateStars,
  CAMPAIGNS,
  getCampaign,
  getCampaignIds,
  getMission,
} from '@engine/campaign/CampaignDefinitions';
import { describe, expect, it } from 'vitest';

describe('CampaignDefinitions', () => {
  it('should have 3 campaigns', () => {
    expect(CAMPAIGNS).toHaveLength(3);
    expect(getCampaignIds()).toHaveLength(3);
  });

  it('should get campaign by id', () => {
    const camp = getCampaign('boot-camp');
    expect(camp?.name).toBe('Boot Camp');
    expect(camp?.missions.length).toBeGreaterThan(0);
  });

  it('should get specific mission', () => {
    const mission = getMission('warzone', 'wz-1');
    expect(mission?.name).toBe('Desert Storm');
    expect(mission?.aiDifficulty).toBe('medium');
  });

  it('should calculate star ratings', () => {
    const thresholds = { one: 1000, two: 3000, three: 6000 };
    expect(calculateStars(500, thresholds)).toBe(0);
    expect(calculateStars(1500, thresholds)).toBe(1);
    expect(calculateStars(4000, thresholds)).toBe(2);
    expect(calculateStars(10000, thresholds)).toBe(3);
  });

  it('should have escalating difficulty across campaigns', () => {
    const bc = getCampaign('boot-camp');
    const eo = getCampaign('elite-ops');
    expect(bc?.missions[0]?.aiDifficulty).toBe('easy');
    expect(eo?.missions[2]?.aiDifficulty).toBe('expert');
  });
});
