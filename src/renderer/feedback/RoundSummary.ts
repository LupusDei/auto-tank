export interface RoundIncomeBreakdown {
  readonly playerName: string;
  readonly basePay: number;
  readonly damageBonus: number;
  readonly killBonus: number;
  readonly survivalBonus: number;
  readonly interest: number;
  readonly total: number;
}

/** Calculate income breakdown for a round. */
export function calculateIncomeBreakdown(
  playerName: string,
  damageDealt: number,
  kills: number,
  survived: boolean,
  currentMoney: number,
): RoundIncomeBreakdown {
  const basePay = 1000;
  const damageBonus = damageDealt;
  const killBonus = kills * 2000;
  const survivalBonus = survived ? 500 : 0;
  const interest = Math.floor(currentMoney * 0.1);
  return {
    playerName,
    basePay,
    damageBonus,
    killBonus,
    survivalBonus,
    interest,
    total: basePay + damageBonus + killBonus + survivalBonus + interest,
  };
}

/** Render round summary economy panel. */
export function renderRoundSummary(
  ctx: CanvasRenderingContext2D,
  breakdowns: readonly RoundIncomeBreakdown[],
  x: number,
  y: number,
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  const panelWidth = 300;
  const lineHeight = 20;
  const panelHeight = breakdowns.length * (lineHeight * 7 + 20) + 40;
  ctx.fillRect(x, y, panelWidth, panelHeight);

  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, panelWidth, panelHeight);

  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#ffcc00';
  ctx.textAlign = 'center';
  ctx.fillText('ROUND SUMMARY', x + panelWidth / 2, y + 25);

  let cy = y + 50;
  ctx.font = '12px monospace';
  ctx.textAlign = 'left';

  for (const bd of breakdowns) {
    ctx.fillStyle = '#ffffff';
    ctx.fillText(bd.playerName, x + 10, cy);
    cy += lineHeight;
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`  Base Pay:      $${bd.basePay}`, x + 10, cy);
    cy += lineHeight;
    ctx.fillText(`  Damage Bonus:  $${bd.damageBonus}`, x + 10, cy);
    cy += lineHeight;
    ctx.fillText(`  Kill Bonus:    $${bd.killBonus}`, x + 10, cy);
    cy += lineHeight;
    ctx.fillText(`  Survival:      $${bd.survivalBonus}`, x + 10, cy);
    cy += lineHeight;
    ctx.fillText(`  Interest:      $${bd.interest}`, x + 10, cy);
    cy += lineHeight;
    ctx.fillStyle = '#44ff44';
    ctx.fillText(`  TOTAL:         $${bd.total}`, x + 10, cy);
    cy += lineHeight + 10;
  }

  ctx.restore();
}
