import { AirStrikeBehavior } from './AirStrikeBehavior';
import { ArmageddonBehavior } from './ArmageddonBehavior';
import { ConcreteDonkeyBehavior } from './ConcreteDonkeyBehavior';
import { DiggerBehavior } from './DiggerBehavior';
import { DirtBombBehavior } from './DirtBombBehavior';
import { GuidedMissileBehavior } from './GuidedMissileBehavior';
import { NapalmBehavior } from './NapalmBehavior';
import { registerBehavior } from './WeaponBehavior';
import { RollerBehavior } from './RollerBehavior';

/** Register all custom weapon behaviors. Call once at startup. */
export function registerAllBehaviors(): void {
  registerBehavior(new RollerBehavior());
  registerBehavior(new DiggerBehavior());
  registerBehavior(new DirtBombBehavior());
  registerBehavior(new AirStrikeBehavior());
  registerBehavior(new NapalmBehavior());
  registerBehavior(new GuidedMissileBehavior());
  registerBehavior(new ConcreteDonkeyBehavior());
  registerBehavior(new ArmageddonBehavior());
}
