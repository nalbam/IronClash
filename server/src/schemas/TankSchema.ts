import { Schema, type } from '@colyseus/schema';

export class TankSchema extends Schema {
  @type('string') id: string;
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') team: number = 0;
  @type('number') hp: number = 10;
  @type('number') angle: number = 45; // cannon angle in degrees
  @type('number') shellCount: number = 3;
  @type('boolean') isAlive: boolean = true;
  @type('number') velocity: number = 0;
  @type('number') lastShootTime: number = 0;
  @type('number') chargeStartTime: number = 0;
  @type('boolean') isCharging: boolean = false;
}
