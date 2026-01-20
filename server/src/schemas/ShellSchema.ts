import { Schema, type } from '@colyseus/schema';

export class ShellSchema extends Schema {
  @type('string') id: string;
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') vx: number = 0; // velocity x
  @type('number') vy: number = 0; // velocity y
  @type('number') team: number = 0;
  @type('string') ownerId: string;
}
