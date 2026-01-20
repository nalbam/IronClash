// Shared types between client and server

export interface ITank {
  id: string;
  x: number;
  y: number;
  team: number;
  hp: number;
  angle: number; // cannon angle in degrees
  shellCount: number;
  isAlive: boolean;
  velocity: number; // current movement velocity
}

export interface IShell {
  id: string;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  team: number;
  ownerId: string;
}

export interface ITerrainCell {
  height: number;
  destroyed: boolean;
}

export enum GamePhase {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished'
}

export enum InputCommand {
  MOVE_LEFT = 'move_left',
  MOVE_RIGHT = 'move_right',
  MOVE_STOP = 'move_stop',
  ANGLE_UP = 'angle_up',
  ANGLE_DOWN = 'angle_down',
  ANGLE_STOP = 'angle_stop',
  FIRE_START = 'fire_start',
  FIRE_RELEASE = 'fire_release'
}

export interface IPlayerInput {
  command: InputCommand;
  timestamp?: number;
}

export interface IGameState {
  phase: GamePhase;
  tanks: Map<string, ITank>;
  shells: Map<string, IShell>;
  terrain: number[]; // height map
  wind: number; // current wind speed
  winner: number | null; // team number or null
}
