import * as CONST from '../constants';

describe('Game Constants', () => {
  describe('Game dimensions', () => {
    it('should have valid game width', () => {
      expect(CONST.GAME_WIDTH).toBeGreaterThan(0);
      expect(typeof CONST.GAME_WIDTH).toBe('number');
    });

    it('should have valid game height', () => {
      expect(CONST.GAME_HEIGHT).toBeGreaterThan(0);
      expect(typeof CONST.GAME_HEIGHT).toBe('number');
    });

    it('should have terrain height less than game height', () => {
      expect(CONST.TERRAIN_HEIGHT).toBeLessThanOrEqual(CONST.GAME_HEIGHT);
      expect(CONST.TERRAIN_HEIGHT).toBeGreaterThan(0);
    });
  });

  describe('Physics constants', () => {
    it('should have positive gravity', () => {
      expect(CONST.GRAVITY).toBeGreaterThan(0);
    });

    it('should have valid shell speed range', () => {
      expect(CONST.SHELL_SPEED_MIN).toBeGreaterThan(0);
      expect(CONST.SHELL_SPEED_MAX).toBeGreaterThan(CONST.SHELL_SPEED_MIN);
    });

    it('should have valid wind max', () => {
      expect(CONST.WIND_MAX).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Tank constants', () => {
    it('should have valid tank dimensions', () => {
      expect(CONST.TANK_WIDTH).toBeGreaterThan(0);
      expect(CONST.TANK_HEIGHT).toBeGreaterThan(0);
    });

    it('should have valid tank speed', () => {
      expect(CONST.TANK_SPEED).toBeGreaterThan(0);
    });

    it('should have valid tank max HP', () => {
      expect(CONST.TANK_MAX_HP).toBeGreaterThan(0);
    });
  });

  describe('Combat constants', () => {
    it('should have valid reload time', () => {
      expect(CONST.SHELL_RELOAD_TIME).toBeGreaterThan(0);
    });

    it('should have valid max shells', () => {
      expect(CONST.MAX_SHELLS).toBeGreaterThan(0);
    });

    it('should have valid charge time range', () => {
      expect(CONST.CHARGE_TIME_MIN).toBeGreaterThan(0);
      expect(CONST.CHARGE_TIME_MAX).toBeGreaterThan(CONST.CHARGE_TIME_MIN);
    });

    it('should have valid damage values', () => {
      expect(CONST.DIRECT_DAMAGE).toBeGreaterThan(0);
      expect(CONST.DIRECT_DAMAGE).toBeLessThanOrEqual(CONST.TANK_MAX_HP);
    });

    it('should have valid blast radius', () => {
      expect(CONST.BLAST_RADIUS).toBeGreaterThan(CONST.SHELL_RADIUS);
    });

    it('should have valid shell radius', () => {
      expect(CONST.SHELL_RADIUS).toBeGreaterThan(0);
    });
  });

  describe('Angle constraints', () => {
    it('should have valid angle range', () => {
      expect(CONST.ANGLE_MIN).toBeLessThan(CONST.ANGLE_MAX);
      expect(CONST.ANGLE_MIN).toBeGreaterThanOrEqual(-90);
      expect(CONST.ANGLE_MAX).toBeLessThanOrEqual(90);
    });

    it('should have valid angle speed', () => {
      expect(CONST.ANGLE_SPEED).toBeGreaterThan(0);
    });
  });

  describe('Team configuration', () => {
    it('should have valid team size', () => {
      expect(CONST.TEAM_SIZE).toBeGreaterThan(0);
      expect(CONST.TEAM_SIZE).toBe(3);
    });

    it('should have valid team IDs', () => {
      expect(CONST.TEAM_RED).toBe(0);
      expect(CONST.TEAM_BLUE).toBe(1);
      expect(CONST.TEAM_RED).not.toBe(CONST.TEAM_BLUE);
    });
  });

  describe('Game loop', () => {
    it('should have valid tick rate', () => {
      expect(CONST.TICK_RATE).toBeGreaterThan(0);
      expect(CONST.TICK_RATE).toBe(60);
    });

    it('should have consistent fixed time step', () => {
      const expectedTimeStep = 1000 / CONST.TICK_RATE;
      expect(CONST.FIXED_TIME_STEP).toBe(expectedTimeStep);
    });
  });
});
