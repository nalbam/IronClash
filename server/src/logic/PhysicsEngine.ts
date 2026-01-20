import { ShellSchema } from '../schemas/ShellSchema';
import { TankSchema } from '../schemas/TankSchema';
import { TerrainSchema } from '../schemas/TerrainSchema';
import * as CONST from '../../../shared/src/constants';

export class PhysicsEngine {
  static updateShell(shell: ShellSchema, deltaTime: number, wind: number, terrain: TerrainSchema, gameWidth: number): boolean {
    // Apply gravity
    shell.vy += CONST.GRAVITY * deltaTime;
    
    // Apply wind
    shell.vx += wind * deltaTime;
    
    // Update position
    shell.x += shell.vx * deltaTime;
    shell.y += shell.vy * deltaTime;
    
    // Check if shell is out of bounds
    if (shell.x < 0 || shell.x > gameWidth || shell.y > CONST.GAME_HEIGHT) {
      return false; // Shell should be destroyed
    }
    
    // Check terrain collision
    const terrainHeight = terrain.getHeightAt(shell.x, gameWidth);
    if (shell.y >= CONST.GAME_HEIGHT - terrainHeight) {
      return false; // Hit terrain
    }
    
    return true; // Shell is still active
  }

  static checkTankCollision(shell: ShellSchema, tank: TankSchema): boolean {
    if (!tank.isAlive || shell.team === tank.team) {
      return false;
    }

    const dx = shell.x - tank.x;
    const dy = shell.y - tank.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (CONST.TANK_WIDTH / 2 + CONST.SHELL_RADIUS);
  }

  static calculateDamage(distance: number): number {
    if (distance < CONST.SHELL_RADIUS) {
      return CONST.DIRECT_DAMAGE; // Direct hit
    }
    
    if (distance > CONST.BLAST_RADIUS) {
      return 0; // Out of range
    }
    
    // Area damage decreases with distance
    const ratio = 1 - (distance / CONST.BLAST_RADIUS);
    return Math.ceil(CONST.DIRECT_DAMAGE * ratio * 0.5);
  }

  static updateTank(tank: TankSchema, deltaTime: number, terrain: TerrainSchema, gameWidth: number) {
    if (!tank.isAlive) {
      return;
    }

    // Update position based on velocity
    tank.x += tank.velocity * deltaTime;
    
    // Clamp to game bounds
    tank.x = Math.max(CONST.TANK_WIDTH / 2, Math.min(gameWidth - CONST.TANK_WIDTH / 2, tank.x));
    
    // Update y position to match terrain
    const terrainHeight = terrain.getHeightAt(tank.x, gameWidth);
    tank.y = CONST.GAME_HEIGHT - terrainHeight - CONST.TANK_HEIGHT / 2;
  }

  static applyBlastDamage(
    explosionX: number,
    explosionY: number,
    tanks: Map<string, TankSchema>
  ): void {
    tanks.forEach(tank => {
      if (!tank.isAlive) return;

      const dx = tank.x - explosionX;
      const dy = tank.y - explosionY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= CONST.BLAST_RADIUS) {
        const damage = this.calculateDamage(distance);
        tank.hp = Math.max(0, tank.hp - damage);
        
        if (tank.hp <= 0) {
          tank.isAlive = false;
        }
      }
    });
  }
}
