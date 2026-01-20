// Shared constants between client and server
export const GAME_WIDTH = 1600;
export const GAME_HEIGHT = 900;
export const TERRAIN_HEIGHT = 600;

// Physics constants
export const GRAVITY = 980; // pixels/s^2
export const SHELL_SPEED_MIN = 300; // minimum launch speed
export const SHELL_SPEED_MAX = 800; // maximum launch speed
export const WIND_MAX = 100; // max wind speed (pixels/s)

// Tank constants
export const TANK_WIDTH = 40;
export const TANK_HEIGHT = 30;
export const TANK_SPEED = 100; // pixels/s
export const TANK_MAX_HP = 10;

// Combat constants
export const SHELL_RELOAD_TIME = 3; // seconds
export const MAX_SHELLS = 3;
export const CHARGE_TIME_MIN = 0.2; // seconds
export const CHARGE_TIME_MAX = 0.7; // seconds
export const DIRECT_DAMAGE = 4;
export const BLAST_RADIUS = 60; // pixels
export const SHELL_RADIUS = 5;

// Angle constraints
export const ANGLE_MIN = -90; // degrees (pointing down)
export const ANGLE_MAX = 90; // degrees (pointing up)
export const ANGLE_SPEED = 60; // degrees/s

// Team configuration
export const TEAM_SIZE = 3;
export const TEAM_RED = 0;
export const TEAM_BLUE = 1;

// Game loop
export const TICK_RATE = 60; // server updates per second
export const FIXED_TIME_STEP = 1000 / TICK_RATE; // ms
