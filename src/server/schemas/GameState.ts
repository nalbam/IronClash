import { Schema, type, MapSchema } from '@colyseus/schema';
import { TankSchema } from './TankSchema';
import { ShellSchema } from './ShellSchema';
import { TerrainSchema } from './TerrainSchema';

export class GameState extends Schema {
  @type('string') phase: string = 'waiting';
  @type({ map: TankSchema }) tanks = new MapSchema<TankSchema>();
  @type({ map: ShellSchema }) shells = new MapSchema<ShellSchema>();
  @type(TerrainSchema) terrain!: TerrainSchema;
  @type('number') wind: number = 0;
  @type('number') winner: number = -1; // -1 means no winner yet
  @type('number') redTeamAlive: number = 0;
  @type('number') blueTeamAlive: number = 0;
}
