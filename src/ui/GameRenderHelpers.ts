import type { DamageNumber } from '@renderer/weapons/ImpactFeedback';
import type { EnvParticle } from '@renderer/effects/EnvironmentalParticles';
import type { GameSnapshot } from '@engine/GameManager';
import type { KillConfirmationState } from '@renderer/feedback/KillConfirmation';
import type { ShakeState } from '@renderer/effects/ScreenEffects';
import type { TurnTransitionState } from '@renderer/feedback/TurnTransition';
import type { Vector2D } from '@shared/types/geometry';

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
import {
  isDamageNumberVisible,
  renderDamageNumbers,
} from '@renderer/weapons/ImpactFeedback';
import { getShakeOffset, isShakeComplete, updateShake } from '@renderer/effects/ScreenEffects';
import { getTrailConfig, renderWeaponTrail } from '@renderer/weapons/WeaponTrails';
import { renderTerrain, renderTerrainDetail } from '@renderer/terrain/TerrainRenderer';
import { createKillConfirmation, renderKillConfirmation } from '@renderer/feedback/KillConfirmation';
import { createTurnTransition, renderTurnTransition } from '@renderer/feedback/TurnTransition';
import { getTheme } from '@engine/themes/TerrainThemeSystem';
import { renderCrate } from '@renderer/effects/CrateRenderer';
import { renderMoneyPopups } from '@renderer/feedback/MoneyPopup';
import { renderProjectile } from '@renderer/entities/ProjectileRenderer';
import { renderScreenFlash } from '@renderer/weapons/ExplosionVariety';
import { renderSky } from '@renderer/sky/SkyRenderer';
import { renderSpeechBubble } from '@engine/commentary/SpeechBubble';
import { renderTankWithHealth } from '@renderer/entities/TankRenderer';
import { renderWater } from '@renderer/terrain/WaterRenderer';
import { renderWindCompass } from '@renderer/feedback/WindCompass';

export interface RenderState {
  envParticles: EnvParticle[];
  envTheme: string;
  shake: ShakeState | null;
  turnTransition: TurnTransitionState | null;
  killConfirmation: KillConfirmationState | null;
  screenFlash: { opacity: number; startTime: number } | null;
  damageNumbers: DamageNumber[];
}

export function createRenderState(): RenderState {
  return {
    envParticles: [],
    envTheme: '',
    shake: null,
    turnTransition: null,
    killConfirmation: null,
    screenFlash: null,
    damageNumbers: [],
  };
}

/** Trigger a screen shake (called from explosion events). */
export function triggerShake(state: RenderState, intensity: number, duration: number): void {
  state.shake = { intensity, elapsed: 0, duration };
}

/** Trigger a turn transition banner. */
export function triggerTurnTransition(
  state: RenderState,
  playerName: string,
  playerColor: string,
): void {
  state.turnTransition = createTurnTransition(playerName, playerColor);
}

/** Trigger a kill confirmation overlay. */
export function triggerKillConfirmation(
  state: RenderState,
  killerName: string,
  victimName: string,
  position: Vector2D,
): void {
  state.killConfirmation = createKillConfirmation(killerName, victimName, position);
}

/** Trigger a screen flash effect. */
export function triggerScreenFlash(state: RenderState, opacity: number): void {
  state.screenFlash = { opacity, startTime: performance.now() };
}

/** Add a damage number to the render state. */
export function addDamageNumber(state: RenderState, dmgNumber: DamageNumber): void {
  state.damageNumbers.push(dmgNumber);
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

  // Damage numbers
  if (showDamageNumbers && renderState.damageNumbers.length > 0) {
    renderState.damageNumbers = renderState.damageNumbers.filter(isDamageNumberVisible);
    renderDamageNumbers(ctx, renderState.damageNumbers);
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

  // --- Overlays rendered AFTER victory (no shake transform) ---

  // Turn transition banner
  if (renderState.turnTransition) {
    const ttElapsed = (now - renderState.turnTransition.startTime) / 1000;
    if (ttElapsed >= renderState.turnTransition.duration) {
      renderState.turnTransition = null;
    } else {
      renderTurnTransition(ctx, renderState.turnTransition, canvas.width, canvas.height, ttElapsed);
    }
  }

  // Kill confirmation overlay
  if (renderState.killConfirmation) {
    const kcElapsed = (now - renderState.killConfirmation.startTime) / 1000;
    if (kcElapsed >= renderState.killConfirmation.duration) {
      renderState.killConfirmation = null;
    } else {
      renderKillConfirmation(
        ctx,
        renderState.killConfirmation,
        canvas.width,
        canvas.height,
        kcElapsed,
      );
    }
  }

  // Screen flash
  if (renderState.screenFlash) {
    const flashElapsed = (now - renderState.screenFlash.startTime) / 1000;
    const flashDuration = 0.3;
    if (flashElapsed >= flashDuration) {
      renderState.screenFlash = null;
    } else {
      const currentOpacity = renderState.screenFlash.opacity * (1 - flashElapsed / flashDuration);
      renderScreenFlash(ctx, canvas.width, canvas.height, currentOpacity);
    }
  }
}
