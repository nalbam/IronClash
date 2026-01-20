"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIXED_TIME_STEP = exports.TICK_RATE = exports.TEAM_BLUE = exports.TEAM_RED = exports.TEAM_SIZE = exports.ANGLE_SPEED = exports.ANGLE_MAX = exports.ANGLE_MIN = exports.SHELL_RADIUS = exports.BLAST_RADIUS = exports.DIRECT_DAMAGE = exports.CHARGE_TIME_MAX = exports.CHARGE_TIME_MIN = exports.MAX_SHELLS = exports.SHELL_RELOAD_TIME = exports.TANK_MAX_HP = exports.TANK_SPEED = exports.TANK_HEIGHT = exports.TANK_WIDTH = exports.WIND_MAX = exports.SHELL_SPEED_MAX = exports.SHELL_SPEED_MIN = exports.GRAVITY = exports.TERRAIN_HEIGHT = exports.GAME_HEIGHT = exports.GAME_WIDTH = void 0;
// Shared constants between client and server
exports.GAME_WIDTH = 1600;
exports.GAME_HEIGHT = 900;
exports.TERRAIN_HEIGHT = 600;
// Physics constants
exports.GRAVITY = 980; // pixels/s^2
exports.SHELL_SPEED_MIN = 300; // minimum launch speed
exports.SHELL_SPEED_MAX = 800; // maximum launch speed
exports.WIND_MAX = 100; // max wind speed (pixels/s)
// Tank constants
exports.TANK_WIDTH = 40;
exports.TANK_HEIGHT = 30;
exports.TANK_SPEED = 100; // pixels/s
exports.TANK_MAX_HP = 10;
// Combat constants
exports.SHELL_RELOAD_TIME = 3; // seconds
exports.MAX_SHELLS = 3;
exports.CHARGE_TIME_MIN = 0.2; // seconds
exports.CHARGE_TIME_MAX = 0.7; // seconds
exports.DIRECT_DAMAGE = 4;
exports.BLAST_RADIUS = 60; // pixels
exports.SHELL_RADIUS = 5;
// Angle constraints
exports.ANGLE_MIN = -90; // degrees (pointing down)
exports.ANGLE_MAX = 90; // degrees (pointing up)
exports.ANGLE_SPEED = 60; // degrees/s
// Team configuration
exports.TEAM_SIZE = 3;
exports.TEAM_RED = 0;
exports.TEAM_BLUE = 1;
// Game loop
exports.TICK_RATE = 60; // server updates per second
exports.FIXED_TIME_STEP = 1000 / exports.TICK_RATE; // ms
