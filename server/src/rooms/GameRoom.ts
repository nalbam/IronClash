import { Room, Client } from 'colyseus';
import { GameState } from '../schemas/GameState';
import { TankSchema } from '../schemas/TankSchema';
import { ShellSchema } from '../schemas/ShellSchema';
import { TerrainSchema } from '../schemas/TerrainSchema';
import { PhysicsEngine } from '../logic/PhysicsEngine';
import * as CONST from '../../../shared/src/constants';

export class GameRoom extends Room<GameState> {
  private updateInterval?: NodeJS.Timeout;
  private lastUpdateTime: number = Date.now();
  private shellIdCounter: number = 0;

  onCreate(options: any) {
    this.setState(new GameState());
    this.state.terrain = new TerrainSchema(CONST.GAME_WIDTH, CONST.TERRAIN_HEIGHT);
    this.state.wind = (Math.random() - 0.5) * 2 * CONST.WIND_MAX;
    this.maxClients = 6; // 3v3

    console.log('GameRoom created!');

    // Setup message handlers
    this.onMessage('input', (client, message) => {
      this.handleInput(client, message);
    });

    // Start game loop
    this.setSimulationInterval((deltaTime) => this.update(deltaTime));
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');

    // Determine team (balance teams)
    const redCount = Array.from(this.state.tanks.values()).filter(t => t.team === CONST.TEAM_RED).length;
    const blueCount = Array.from(this.state.tanks.values()).filter(t => t.team === CONST.TEAM_BLUE).length;
    const team = redCount <= blueCount ? CONST.TEAM_RED : CONST.TEAM_BLUE;

    // Create tank for player
    const tank = new TankSchema();
    tank.id = client.sessionId;
    tank.team = team;
    tank.hp = CONST.TANK_MAX_HP;
    tank.shellCount = CONST.MAX_SHELLS;
    tank.angle = 45;
    tank.isAlive = true;

    // Position tank based on team
    const teamTanks = Array.from(this.state.tanks.values()).filter(t => t.team === team);
    const spacing = 150;
    const baseX = team === CONST.TEAM_RED ? 200 : CONST.GAME_WIDTH - 200;
    tank.x = baseX + (teamTanks.length * spacing * (team === CONST.TEAM_RED ? 1 : -1));
    
    const terrainHeight = this.state.terrain.getHeightAt(tank.x, CONST.GAME_WIDTH);
    tank.y = CONST.GAME_HEIGHT - terrainHeight - CONST.TANK_HEIGHT / 2;

    this.state.tanks.set(client.sessionId, tank);

    // Update team counts
    this.updateTeamCounts();

    // Start game if we have enough players
    if (this.state.tanks.size >= 2 && this.state.phase === 'waiting') {
      this.state.phase = 'playing';
      console.log('Game started!');
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');

    const tank = this.state.tanks.get(client.sessionId);
    if (tank) {
      tank.isAlive = false;
      this.state.tanks.delete(client.sessionId);
      this.updateTeamCounts();
      this.checkWinCondition();
    }
  }

  onDispose() {
    console.log('Room disposed!');
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private handleInput(client: Client, message: any) {
    const tank = this.state.tanks.get(client.sessionId);
    if (!tank || !tank.isAlive || this.state.phase !== 'playing') {
      return;
    }

    const currentTime = Date.now() / 1000; // Convert to seconds

    switch (message.command) {
      case 'move_left':
        tank.velocity = -CONST.TANK_SPEED;
        break;
      case 'move_right':
        tank.velocity = CONST.TANK_SPEED;
        break;
      case 'move_stop':
        tank.velocity = 0;
        break;
      case 'angle_up':
        tank.angle = Math.min(CONST.ANGLE_MAX, tank.angle + 1);
        break;
      case 'angle_down':
        tank.angle = Math.max(CONST.ANGLE_MIN, tank.angle - 1);
        break;
      case 'fire_start':
        if (tank.shellCount > 0 && !tank.isCharging) {
          tank.isCharging = true;
          tank.chargeStartTime = currentTime;
        }
        break;
      case 'fire_release':
        if (tank.isCharging && tank.shellCount > 0) {
          const chargeTime = currentTime - tank.chargeStartTime;
          this.fireShell(tank, chargeTime);
          tank.isCharging = false;
          tank.chargeStartTime = 0;
        }
        break;
    }
  }

  private fireShell(tank: TankSchema, chargeTime: number) {
    const currentTime = Date.now() / 1000;

    // Clamp charge time
    const clampedCharge = Math.max(CONST.CHARGE_TIME_MIN, Math.min(CONST.CHARGE_TIME_MAX, chargeTime));
    
    // Calculate power (0 to 1)
    const power = (clampedCharge - CONST.CHARGE_TIME_MIN) / (CONST.CHARGE_TIME_MAX - CONST.CHARGE_TIME_MIN);
    
    // Calculate launch speed
    const speed = CONST.SHELL_SPEED_MIN + (CONST.SHELL_SPEED_MAX - CONST.SHELL_SPEED_MIN) * power;
    
    // Convert angle to radians
    const angleRad = (tank.angle * Math.PI) / 180;
    
    // Create shell
    const shell = new ShellSchema();
    shell.id = `shell_${this.shellIdCounter++}`;
    shell.x = tank.x;
    shell.y = tank.y;
    shell.vx = Math.cos(angleRad) * speed * (tank.team === CONST.TEAM_RED ? 1 : -1);
    shell.vy = -Math.sin(angleRad) * speed; // Negative because y increases downward
    shell.team = tank.team;
    shell.ownerId = tank.id;

    this.state.shells.set(shell.id, shell);

    // Decrease shell count and update last shoot time
    tank.shellCount--;
    tank.lastShootTime = currentTime;

    console.log(`Tank ${tank.id} fired shell with power ${(power * 100).toFixed(0)}%`);
  }

  private update(deltaTime: number) {
    if (this.state.phase !== 'playing') {
      return;
    }

    const dt = deltaTime / 1000; // Convert to seconds
    const currentTime = Date.now() / 1000;

    // Update tanks
    this.state.tanks.forEach(tank => {
      PhysicsEngine.updateTank(tank, dt, this.state.terrain, CONST.GAME_WIDTH);

      // Reload shells
      if (tank.shellCount < CONST.MAX_SHELLS) {
        const timeSinceLastShot = currentTime - tank.lastShootTime;
        if (timeSinceLastShot >= CONST.SHELL_RELOAD_TIME) {
          tank.shellCount++;
          tank.lastShootTime = currentTime;
        }
      }
    });

    // Update shells
    const shellsToRemove: string[] = [];
    this.state.shells.forEach((shell, shellId) => {
      const stillActive = PhysicsEngine.updateShell(
        shell,
        dt,
        this.state.wind,
        this.state.terrain,
        CONST.GAME_WIDTH
      );

      if (!stillActive) {
        // Shell hit something, create explosion
        this.handleExplosion(shell.x, shell.y);
        shellsToRemove.push(shellId);
        return;
      }

      // Check collision with tanks
      let hitTank = false;
      this.state.tanks.forEach(tank => {
        if (PhysicsEngine.checkTankCollision(shell, tank)) {
          this.handleExplosion(shell.x, shell.y);
          shellsToRemove.push(shellId);
          hitTank = true;
        }
      });
    });

    // Remove destroyed shells
    shellsToRemove.forEach(shellId => {
      this.state.shells.delete(shellId);
    });

    // Check win condition
    this.checkWinCondition();
  }

  private handleExplosion(x: number, y: number) {
    // Apply damage to tanks
    PhysicsEngine.applyBlastDamage(x, y, this.state.tanks);

    // Destroy terrain
    this.state.terrain.destroyAt(x, y, CONST.BLAST_RADIUS, CONST.GAME_WIDTH);

    this.updateTeamCounts();
  }

  private updateTeamCounts() {
    this.state.redTeamAlive = Array.from(this.state.tanks.values()).filter(
      t => t.team === CONST.TEAM_RED && t.isAlive
    ).length;
    
    this.state.blueTeamAlive = Array.from(this.state.tanks.values()).filter(
      t => t.team === CONST.TEAM_BLUE && t.isAlive
    ).length;
  }

  private checkWinCondition() {
    if (this.state.phase !== 'playing') {
      return;
    }

    if (this.state.redTeamAlive === 0 && this.state.blueTeamAlive === 0) {
      this.state.phase = 'finished';
      this.state.winner = -1; // Draw
      console.log('Game finished: Draw!');
    } else if (this.state.redTeamAlive === 0) {
      this.state.phase = 'finished';
      this.state.winner = CONST.TEAM_BLUE;
      console.log('Game finished: Blue team wins!');
    } else if (this.state.blueTeamAlive === 0) {
      this.state.phase = 'finished';
      this.state.winner = CONST.TEAM_RED;
      console.log('Game finished: Red team wins!');
    }
  }
}
