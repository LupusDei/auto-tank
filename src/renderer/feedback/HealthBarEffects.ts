export interface SmoothHealthBar {
  readonly displayHealth: number;
  readonly targetHealth: number;
  readonly maxHealth: number;
  readonly shieldAmount: number;
  readonly criticalFlashing: boolean;
}

/** Create a smooth health bar state. */
export function createSmoothHealthBar(health: number, maxHealth: number): SmoothHealthBar {
  return {
    displayHealth: health,
    targetHealth: health,
    maxHealth,
    shieldAmount: 0,
    criticalFlashing: false,
  };
}

/** Update smooth health bar — lerps toward target. */
export function updateSmoothHealthBar(bar: SmoothHealthBar, dt: number): SmoothHealthBar {
  const speed = 50; // HP per second drain speed
  const diff = bar.targetHealth - bar.displayHealth;
  const step = Math.sign(diff) * Math.min(Math.abs(diff), speed * dt);
  const newDisplay = bar.displayHealth + step;
  return {
    ...bar,
    displayHealth: newDisplay,
    criticalFlashing: newDisplay / bar.maxHealth <= 0.2,
  };
}

/** Set new target health (for damage events). */
export function setTargetHealth(bar: SmoothHealthBar, newHealth: number): SmoothHealthBar {
  return { ...bar, targetHealth: Math.max(0, newHealth) };
}

/** Set shield overlay amount. */
export function setShieldAmount(bar: SmoothHealthBar, amount: number): SmoothHealthBar {
  return { ...bar, shieldAmount: Math.max(0, amount) };
}

/** Render enhanced health bar with smooth drain and shield overlay. */
export function renderEnhancedHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bar: SmoothHealthBar,
  width = 30,
): void {
  const barHeight = 5;
  const barY = y - 35;
  const healthPct = bar.maxHealth > 0 ? bar.displayHealth / bar.maxHealth : 0;
  const targetPct = bar.maxHealth > 0 ? bar.targetHealth / bar.maxHealth : 0;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x - width / 2, barY, width, barHeight);

  // Damage drain (the gap between display and target)
  if (healthPct > targetPct) {
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(
      x - width / 2 + width * targetPct,
      barY,
      width * (healthPct - targetPct),
      barHeight,
    );
  }

  // Health fill
  const healthColor = healthPct > 0.5 ? '#2ecc71' : healthPct > 0.2 ? '#f39c12' : '#e74c3c';
  const flashAlpha = bar.criticalFlashing ? 0.5 + 0.5 * Math.sin(performance.now() * 0.01) : 1;
  ctx.globalAlpha = flashAlpha;
  ctx.fillStyle = healthColor;
  ctx.fillRect(x - width / 2, barY, width * Math.min(healthPct, targetPct), barHeight);
  ctx.globalAlpha = 1;

  // Shield overlay
  if (bar.shieldAmount > 0) {
    const shieldPct = bar.shieldAmount / 100;
    ctx.fillStyle = 'rgba(100, 150, 255, 0.4)';
    ctx.fillRect(x - width / 2, barY - 2, width * shieldPct, barHeight + 4);
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - width / 2, barY - 2, width * shieldPct, barHeight + 4);
  }
}
