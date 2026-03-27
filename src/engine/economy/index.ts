import type { WeaponType } from '../../shared/types/weapons';

export function canAfford(money: number, price: number): boolean {
  return money >= price;
}

export function purchaseWeapon(
  money: number,
  weaponPrice: number,
  currentQuantity: number,
): { newMoney: number; newQuantity: number } | null {
  if (!canAfford(money, weaponPrice)) {
    return null;
  }
  return {
    newMoney: money - weaponPrice,
    newQuantity: currentQuantity + 1,
  };
}

export function calculateRoundReward(
  kills: number,
  damageDealt: number,
  survived: boolean,
  isUnderdog: boolean = false,
): number {
  const base = 500;
  const killBonus = kills * 750;
  const damageBonus = Math.round(damageDealt * 5);
  const survivalBonus = survived ? 300 : 0;
  const underdogBonus = isUnderdog ? 500 : 0;
  return base + killBonus + damageBonus + survivalBonus + underdogBonus;
}

export function calculateInterest(money: number, rate = 0.05): number {
  return Math.min(Math.floor(money * rate), 500);
}

export function getStartingLoadout(): { weaponType: WeaponType; quantity: number }[] {
  return [
    { weaponType: 'baby-missile', quantity: 99 },
    { weaponType: 'smoke-tracer', quantity: 99 },
    { weaponType: 'fire-punch', quantity: 99 },
    { weaponType: 'baseball-bat', quantity: 99 },
    { weaponType: 'grenade', quantity: 3 },
    { weaponType: 'missile', quantity: 2 },
  ];
}
