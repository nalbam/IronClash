import { PhysicsEngine } from '../PhysicsEngine';
import { ShellSchema } from '../../schemas/ShellSchema';
import { TankSchema } from '../../schemas/TankSchema';
import * as CONST from '../../../shared/constants';

describe('PhysicsEngine', () => {
  describe('calculateDamage', () => {
    it('should return direct damage for direct hit', () => {
      const distance = CONST.SHELL_RADIUS - 1;
      const damage = PhysicsEngine.calculateDamage(distance);
      expect(damage).toBe(CONST.DIRECT_DAMAGE);
    });

    it('should return 0 damage outside blast radius', () => {
      const distance = CONST.BLAST_RADIUS + 10;
      const damage = PhysicsEngine.calculateDamage(distance);
      expect(damage).toBe(0);
    });

    it('should return proportional damage within blast radius', () => {
      const distance = CONST.BLAST_RADIUS / 2;
      const damage = PhysicsEngine.calculateDamage(distance);
      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThan(CONST.DIRECT_DAMAGE);
    });

    it('should decrease damage as distance increases', () => {
      const distance1 = CONST.SHELL_RADIUS + 5;
      const distance2 = CONST.BLAST_RADIUS / 2;
      const damage1 = PhysicsEngine.calculateDamage(distance1);
      const damage2 = PhysicsEngine.calculateDamage(distance2);
      expect(damage1).toBeGreaterThan(damage2);
    });
  });

  describe('checkTankCollision', () => {
    let shell: ShellSchema;
    let tank: TankSchema;

    beforeEach(() => {
      shell = new ShellSchema();
      shell.x = 100;
      shell.y = 100;
      shell.team = 0;

      tank = new TankSchema();
      tank.x = 100;
      tank.y = 100;
      tank.team = 1;
      tank.isAlive = true;
    });

    it('should detect collision when shell is at tank position', () => {
      const collision = PhysicsEngine.checkTankCollision(shell, tank);
      expect(collision).toBe(true);
    });

    it('should not detect collision when tank is dead', () => {
      tank.isAlive = false;
      const collision = PhysicsEngine.checkTankCollision(shell, tank);
      expect(collision).toBe(false);
    });

    it('should not detect collision with same team', () => {
      tank.team = 0;
      const collision = PhysicsEngine.checkTankCollision(shell, tank);
      expect(collision).toBe(false);
    });

    it('should not detect collision when shell is far away', () => {
      shell.x = 500;
      shell.y = 500;
      const collision = PhysicsEngine.checkTankCollision(shell, tank);
      expect(collision).toBe(false);
    });

    it('should detect collision within collision radius', () => {
      const collisionRadius = CONST.TANK_WIDTH / 2 + CONST.SHELL_RADIUS;
      shell.x = tank.x + collisionRadius - 1;
      shell.y = tank.y;
      const collision = PhysicsEngine.checkTankCollision(shell, tank);
      expect(collision).toBe(true);
    });
  });

  describe('applyBlastDamage', () => {
    it('should damage tanks within blast radius', () => {
      const tanks = new Map<string, TankSchema>();

      const tank1 = new TankSchema();
      tank1.x = 100;
      tank1.y = 100;
      tank1.hp = 100;
      tank1.isAlive = true;
      tanks.set('tank1', tank1);

      const explosionX = 100;
      const explosionY = 100;

      PhysicsEngine.applyBlastDamage(explosionX, explosionY, tanks);

      expect(tank1.hp).toBeLessThan(100);
    });

    it('should not damage tanks outside blast radius', () => {
      const tanks = new Map<string, TankSchema>();

      const tank1 = new TankSchema();
      tank1.x = 1000;
      tank1.y = 1000;
      tank1.hp = 100;
      tank1.isAlive = true;
      tanks.set('tank1', tank1);

      const explosionX = 100;
      const explosionY = 100;

      PhysicsEngine.applyBlastDamage(explosionX, explosionY, tanks);

      expect(tank1.hp).toBe(100);
    });

    it('should mark tank as dead when hp reaches 0', () => {
      const tanks = new Map<string, TankSchema>();

      const tank1 = new TankSchema();
      tank1.x = 100;
      tank1.y = 100;
      tank1.hp = 1;
      tank1.isAlive = true;
      tanks.set('tank1', tank1);

      const explosionX = 100;
      const explosionY = 100;

      PhysicsEngine.applyBlastDamage(explosionX, explosionY, tanks);

      expect(tank1.hp).toBe(0);
      expect(tank1.isAlive).toBe(false);
    });

    it('should not damage already dead tanks', () => {
      const tanks = new Map<string, TankSchema>();

      const tank1 = new TankSchema();
      tank1.x = 100;
      tank1.y = 100;
      tank1.hp = 0;
      tank1.isAlive = false;
      tanks.set('tank1', tank1);

      const explosionX = 100;
      const explosionY = 100;

      PhysicsEngine.applyBlastDamage(explosionX, explosionY, tanks);

      expect(tank1.hp).toBe(0);
    });
  });
});
