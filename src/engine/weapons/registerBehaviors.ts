import { AirStrikeBehavior } from './AirStrikeBehavior';
import { DiggerBehavior } from './DiggerBehavior';
import { DirtBombBehavior } from './DirtBombBehavior';
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
}
