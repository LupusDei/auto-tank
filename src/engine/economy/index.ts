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
): number {
  const base = 1000;
  const killBonus = kills * 2000;
  const damageBonus = damageDealt * 1;
  const survivalBonus = survived ? 500 : 0;
  return base + killBonus + damageBonus + survivalBonus;
}

export function calculateInterest(money: number, rate = 0.1): number {
  return Math.floor(money * rate);
}

export function getStartingLoadout(): { weaponType: WeaponType; quantity: number }[] {
  return [
    { weaponType: 'baby-missile', quantity: 3 },
    { weaponType: 'missile', quantity: 2 },
    { weaponType: 'smoke-tracer', quantity: 2 },
    { weaponType: 'grenade', quantity: 3 },
    { weaponType: 'shotgun', quantity: 2 },
    { weaponType: 'fire-punch', quantity: 1 },
    { weaponType: 'baseball-bat', quantity: 1 },
  ];
}
