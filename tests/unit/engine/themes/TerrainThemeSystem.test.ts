import { describe, expect, it } from 'vitest';
import { getAvailableThemes, getTheme, getThemeName } from '@engine/themes/TerrainThemeSystem';

describe('TerrainThemeSystem', () => {
  it('should have 5 themes', () => {
    expect(getAvailableThemes()).toHaveLength(5);
  });

  it('should get theme by id', () => {
    const theme = getTheme('volcanic');
    expect(theme.name).toBe('Volcanic Hellscape');
    expect(theme.terrainFill).toContain('#');
  });

  it('should have sky gradients for all themes', () => {
    for (const id of getAvailableThemes()) {
      const theme = getTheme(id);
      expect(theme.skyGradient.length).toBeGreaterThan(0);
    }
  });

  it('should return theme name', () => {
    expect(getThemeName('arctic')).toBe('Frozen Tundra');
    expect(getThemeName('lunar')).toBe('Moonscape');
  });
});
