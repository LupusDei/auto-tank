import { DEFENSE_ITEMS, type DefenseItem } from '@engine/defense/DefenseShop';
import {
  type ExtendedWeaponDef,
  getTierColor,
  NEW_WEAPONS,
  WEAPON_TIERS,
} from '@engine/weapons/NewWeapons';
import React from 'react';

export interface ShopScreenProps {
  readonly playerName: string;
  readonly playerMoney: number;
  readonly onBuyWeapon: (weapon: ExtendedWeaponDef) => void;
  readonly onBuyDefense: (item: DefenseItem) => void;
  readonly onReady: () => void;
}

function WeaponCard({
  weapon,
  money,
  onBuy,
}: {
  readonly weapon: ExtendedWeaponDef;
  readonly money: number;
  readonly onBuy: () => void;
}): React.ReactElement {
  const tierColor = getTierColor(weapon.tier);
  const canAfford = money >= weapon.price;
  const tierInfo = WEAPON_TIERS[weapon.tier];

  return (
    <div
      className={`shop-card${canAfford ? '' : ' opacity-half'}`}
      style={{ borderColor: `${tierColor}33` }}
      data-testid={`shop-weapon-${weapon.type}`}
    >
      <div className="shop-card-name" style={{ color: tierColor }}>
        {weapon.name}
      </div>
      <div className="shop-card-tier" style={{ color: tierColor }}>
        {weapon.tier}
      </div>
      <div className="shop-card-desc">{weapon.description}</div>
      <div className="shop-card-stats">
        💥 {weapon.damage} dmg | 💣 {weapon.explosionRadius}r
      </div>
      <div className="shop-card-footer">
        <span className="shop-card-price">${weapon.price}</span>
        <button
          onClick={onBuy}
          disabled={!canAfford}
          className="shop-buy-btn"
          data-testid={`buy-${weapon.type}`}
        >
          BUY
        </button>
      </div>
      <div className="shop-card-max">Max: {tierInfo.maxPurchase}</div>
    </div>
  );
}

export function ShopScreen({
  playerName,
  playerMoney,
  onBuyWeapon,
  onBuyDefense,
  onReady,
}: ShopScreenProps): React.ReactElement {
  const weaponsByTier = ['free', 'common', 'rare', 'epic', 'legendary'] as const;

  return (
    <div className="shop-overlay" data-testid="shop-screen">
      <div className="shop-header">
        <h2>🏪 SHOP — {playerName}</h2>
        <div className="shop-money">${playerMoney}</div>
      </div>

      <h3 className="shop-section-title">Weapons</h3>
      <div className="shop-grid">
        {weaponsByTier.flatMap((tier) =>
          NEW_WEAPONS.filter((w) => w.tier === tier && w.price > 0).map((w) => (
            <WeaponCard
              key={w.type}
              weapon={w}
              money={playerMoney}
              onBuy={(): void => onBuyWeapon(w)}
            />
          )),
        )}
      </div>

      <h3 className="shop-section-title">Defenses</h3>
      <div className="shop-grid">
        {DEFENSE_ITEMS.map((item) => (
          <div
            key={item.name}
            className={`shop-card${playerMoney >= item.price ? '' : ' opacity-half'}`}
            style={{ borderColor: '#3498db33' }}
            data-testid={`shop-defense-${item.type}`}
          >
            <div className="shop-card-name" style={{ color: '#3498db' }}>
              {item.name}
            </div>
            <div className="shop-card-desc">{item.description}</div>
            <div className="shop-card-footer">
              <span className="shop-card-price">${item.price}</span>
              <button
                onClick={(): void => onBuyDefense(item)}
                disabled={playerMoney < item.price}
                className="shop-buy-btn shop-buy-btn--defense"
              >
                BUY
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onReady} className="shop-ready-btn" data-testid="shop-ready-btn">
        READY ✓
      </button>
    </div>
  );
}
