import type { EnvParticle } from '@renderer/effects/EnvironmentalParticles';
import type { GameSnapshot } from '@engine/GameManager';
import type { ShakeState } from '@renderer/effects/ScreenEffects';

import {
  calculateTrajectoryPreview,
  renderTrajectoryPreview,
  renderTurnIndicator,
} from '@renderer/feedback/TurnIndicator';
import {
  generateEnvParticles,
  renderEnvParticles,
  updateEnvParticles,
} from '@renderer/effects/EnvironmentalParticles';
import { getShakeOffset, isShakeComplete, updateShake } from '@renderer/effects/ScreenEffects';
import { getTrailConfig, renderWeaponTrail } from '@renderer/weapons/WeaponTrails';
import { renderTerrain, renderTerrainDetail } from '@renderer/terrain/TerrainRenderer';
import { getTheme } from '@engine/themes/TerrainThemeSystem';
import { renderCrate } from '@renderer/effects/CrateRenderer';
import { renderMoneyPopups } from '@renderer/feedback/MoneyPopup';
import { renderProjectile } from '@renderer/entities/ProjectileRenderer';
import { renderSky } from '@renderer/sky/SkyRenderer';
import { renderSpeechBubble } from '@engine/commentary/SpeechBubble';
import { renderTankWithHealth } from '@renderer/entities/TankRenderer';
import { renderWater } from '@renderer/terrain/WaterRenderer';
import { renderWindCompass } from '@renderer/feedback/WindCompass';

export interface RenderState {
  envParticles: EnvParticle[];
  envTheme: string;
  shake: ShakeState | null;
}

export function createRenderState(): RenderState {
  return { envParticles: [], envTheme: '', shake: null };
}

/** Trigger a screen shake (called from explosion events). */
export function triggerShake(state: RenderState, intensity: number, duration: number): void {
  state.shake = { intensity, elapsed: 0, duration };
}

/**
 * Full game render pass. Renders all layers back-to-front.
 * Mutates renderState for particles and shake (frame-local state).
 */
export function renderGame(
  ctx: CanvasRenderingContext2D,
  snap: GameSnapshot,
  playerNames: readonly string[],
  showDamageNumbers: boolean,
  cameraShake: boolean,
  renderState: RenderState,
  dt: number,
): void {
  const canvas = ctx.canvas;
  const now = performance.now();
  const elapsed = now / 1000;

  ctx.save();

  // Screen shake offset
  if (cameraShake && renderState.shake) {
    renderState.shake = updateShake(renderState.shake, dt);
    if (isShakeComplete(renderState.shake)) {
      renderState.shake = null;
    } else {
      const offset = getShakeOffset(renderState.shake);
      ctx.translate(offset.x, offset.y);
    }
  }

  // Sky
  const themeConfig = snap.theme ? getTheme(snap.theme) : undefined;
  renderSky(ctx, canvas.width, canvas.height, themeConfig?.skyGradient);

  // Environmental particles (behind terrain)
  if (snap.theme !== renderState.envTheme) {
    renderState.envParticles = generateEnvParticles(snap.theme, canvas.width, canvas.height);
    renderState.envTheme = snap.theme;
  }
  if (renderState.envParticles.length > 0) {
    updateEnvParticles(renderState.envParticles, dt, canvas.width, canvas.height);
    renderEnvParticles(ctx, renderState.envParticles);
  }

  // Terrain
  renderTerrain(ctx, snap.terrain, canvas.height);
  renderTerrainDetail(ctx, snap.terrain, canvas.height);

  // Water
  renderWater(ctx, canvas.width, canvas.height, elapsed);

  // Crates
  for (const crate of snap.activeCrates) {
    if (!crate.collected) {
      renderCrate(ctx, { position: crate.position, state: 'landed', elapsed: now });
    }
  }

  // Tanks
  for (const tank of snap.tanks) {
    if (tank.state === 'destroyed') continue;
    renderTankWithHealth(
      ctx,
      { x: tank.position.x, y: tank.position.y, angle: tank.angle, color: tank.color },
      tank.health,
      tank.maxHealth,
    );
  }

  // Projectiles with weapon-specific trails
  for (const proj of snap.projectiles) {
    if (proj.state === 'done') continue;
    const trailConfig = getTrailConfig(proj.weaponType);
    if (proj.trail.length >= 2) {
      renderWeaponTrail(ctx, proj.trail, trailConfig);
    }
    renderProjectile(ctx, { position: proj.position, trail: proj.trail });
  }

  // Active effects (explosions)
  for (const effect of snap.activeEffects) {
    const effectElapsed = now - effect.startTime;
    if (!effect.isComplete(effectElapsed)) effect.render(ctx, effectElapsed);
  }

  // Wind compass (top-right)
  renderWindCompass(ctx, canvas.width - 60, 60, snap.wind, elapsed);

  // Trajectory preview and turn indicator
  if (snap.phase === 'turn') {
    const at = snap.tanks[snap.currentPlayerIndex];
    if (at?.state === 'alive') {
      const points = calculateTrajectoryPreview(at.position, at.angle, at.power, snap.wind, 9.81);
      renderTrajectoryPreview(ctx, points);
      renderTurnIndicator(ctx, at.position, elapsed);
    }
  }

  // Money popups
  if (showDamageNumbers) {
    renderMoneyPopups(ctx, snap.moneyPopups);
  }

  // Commentary speech bubbles
  for (const line of snap.commentaryLines) {
    const activeTank = snap.tanks[snap.currentPlayerIndex];
    if (activeTank) {
      renderSpeechBubble(ctx, {
        text: line.text,
        position: { x: activeTank.position.x, y: activeTank.position.y - 40 },
        startTime: now - 1000,
        duration: 3000,
        color: '#ffffff',
      });
    }
  }

  // Victory overlay
  if (snap.phase === 'victory') {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    const w = snap.tanks.find((t) => t.state === 'alive');
    const name = w ? (playerNames[snap.tanks.indexOf(w)] ?? 'Winner') : 'Draw';
    ctx.fillText(`${name} WINS!`, canvas.width / 2, canvas.height / 2 + 15);
  }

  ctx.restore();
}
