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

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0,0,0,0.92)',
  zIndex: 30,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px 40px',
  color: '#fff',
  fontFamily: "'Courier New', monospace",
  overflow: 'auto',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 10,
  width: '100%',
  maxWidth: 900,
  marginBottom: 16,
};

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
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${tierColor}33`,
        borderRadius: 8,
        padding: 12,
        opacity: canAfford ? 1 : 0.5,
      }}
      data-testid={`shop-weapon-${weapon.type}`}
    >
      <div style={{ color: tierColor, fontWeight: 'bold', fontSize: 14 }}>{weapon.name}</div>
      <div style={{ fontSize: 10, color: tierColor, textTransform: 'uppercase' }}>
        {weapon.tier}
      </div>
      <div style={{ fontSize: 11, color: '#aaa', margin: '4px 0' }}>{weapon.description}</div>
      <div style={{ fontSize: 12 }}>
        💥 {weapon.damage} dmg | 💣 {weapon.explosionRadius}r
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>${weapon.price}</span>
        <button
          onClick={onBuy}
          disabled={!canAfford}
          style={{
            padding: '4px 12px',
            borderRadius: 4,
            border: 'none',
            cursor: canAfford ? 'pointer' : 'default',
            background: canAfford ? '#2ecc71' : '#333',
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
          }}
          data-testid={`buy-${weapon.type}`}
        >
          BUY
        </button>
      </div>
      <div style={{ fontSize: 9, color: '#666', marginTop: 4 }}>Max: {tierInfo.maxPurchase}</div>
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
    <div style={overlayStyle} data-testid="shop-screen">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: 900,
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>🏪 SHOP — {playerName}</h2>
        <div style={{ fontSize: 24, color: '#ffcc00', fontWeight: 'bold' }}>${playerMoney}</div>
      </div>

      <h3
        style={{
          alignSelf: 'flex-start',
          maxWidth: 900,
          width: '100%',
          margin: '8px 0',
          color: '#aaa',
        }}
      >
        Weapons
      </h3>
      <div style={gridStyle}>
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

      <h3
        style={{
          alignSelf: 'flex-start',
          maxWidth: 900,
          width: '100%',
          margin: '8px 0',
          color: '#aaa',
        }}
      >
        Defenses
      </h3>
      <div style={gridStyle}>
        {DEFENSE_ITEMS.map((item) => (
          <div
            key={item.name}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #3498db33',
              borderRadius: 8,
              padding: 12,
              opacity: playerMoney >= item.price ? 1 : 0.5,
            }}
            data-testid={`shop-defense-${item.type}`}
          >
            <div style={{ fontWeight: 'bold', fontSize: 14, color: '#3498db' }}>{item.name}</div>
            <div style={{ fontSize: 11, color: '#aaa', margin: '4px 0' }}>{item.description}</div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>${item.price}</span>
              <button
                onClick={(): void => onBuyDefense(item)}
                disabled={playerMoney < item.price}
                style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  border: 'none',
                  cursor: playerMoney >= item.price ? 'pointer' : 'default',
                  background: playerMoney >= item.price ? '#3498db' : '#333',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                BUY
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onReady}
        style={{
          marginTop: 16,
          padding: '14px 48px',
          fontSize: 20,
          fontWeight: 'bold',
          background: '#2ecc71',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          cursor: 'pointer',
        }}
        data-testid="shop-ready-btn"
      >
        READY ✓
      </button>
    </div>
  );
}
