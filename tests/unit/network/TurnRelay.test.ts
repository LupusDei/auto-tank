import { describe, expect, it } from 'vitest';
import { receiveTurnAction, sendTurnAction, validateTurnAction } from '@network/TurnRelay';
import { NetworkClient } from '@network/NetworkClient';

describe('TurnRelay', () => {
  describe('validateTurnAction()', () => {
    it('should accept valid action', () => {
      expect(
        validateTurnAction(
          { playerId: 'p1', tankId: 't1', weaponType: 'missile', angle: 45, power: 80 },
          'p1',
        ).valid,
      ).toBe(true);
    });

    it('should reject wrong player', () => {
      expect(
        validateTurnAction(
          { playerId: 'p2', tankId: 't2', weaponType: 'missile', angle: 45, power: 80 },
          'p1',
        ).valid,
      ).toBe(false);
    });

    it('should reject invalid power', () => {
      expect(
        validateTurnAction(
          { playerId: 'p1', tankId: 't1', weaponType: 'missile', angle: 45, power: 150 },
          'p1',
        ).valid,
      ).toBe(false);
    });

    it('should reject invalid angle', () => {
      expect(
        validateTurnAction(
          { playerId: 'p1', tankId: 't1', weaponType: 'missile', angle: -10, power: 50 },
          'p1',
        ).valid,
      ).toBe(false);
    });
  });

  describe('sendTurnAction()', () => {
    it('should send valid action', () => {
      const client = new NetworkClient();
      expect(
        sendTurnAction(client, {
          playerId: 'p1',
          tankId: 't1',
          weaponType: 'missile',
          angle: 45,
          power: 80,
        }),
      ).toBe(true);
      expect(client.pendingMessages).toBe(1);
    });

    it('should reject invalid action', () => {
      const client = new NetworkClient();
      expect(
        sendTurnAction(client, {
          playerId: 'p1',
          tankId: 't1',
          weaponType: 'missile',
          angle: -5,
          power: 80,
        }),
      ).toBe(false);
      expect(client.pendingMessages).toBe(0);
    });
  });

  describe('receiveTurnAction()', () => {
    it('should parse valid action', () => {
      const action = receiveTurnAction(
        { playerId: 'p1', tankId: 't1', weaponType: 'missile', angle: 45, power: 80 },
        'p1',
      );
      expect(action).not.toBeNull();
      expect(action?.angle).toBe(45);
    });

    it('should reject null payload', () => {
      expect(receiveTurnAction(null, 'p1')).toBeNull();
    });

    it('should reject wrong player', () => {
      expect(
        receiveTurnAction(
          { playerId: 'p2', tankId: 't2', weaponType: 'missile', angle: 45, power: 80 },
          'p1',
        ),
      ).toBeNull();
    });
  });
});
