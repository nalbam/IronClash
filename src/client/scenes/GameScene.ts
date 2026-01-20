import * as Phaser from 'phaser';
import { NetworkManager } from '../managers/NetworkManager';
import { InputManager } from '../managers/InputManager';
import { GameState } from '../../server/schemas/GameState';
import { TankSchema } from '../../server/schemas/TankSchema';
import { ShellSchema } from '../../server/schemas/ShellSchema';
import * as CONST from '../../shared/constants';

export class GameScene extends Phaser.Scene {
  private networkManager!: NetworkManager;
  private inputManager!: InputManager;
  private gameState: GameState | null = null;
  
  // Visual elements
  private tankSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private shellSprites: Map<string, Phaser.GameObjects.Arc> = new Map();
  private terrainGraphics!: Phaser.GameObjects.Graphics;
  private groundGraphics!: Phaser.GameObjects.Graphics;
  
  // UI elements
  private hpText!: Phaser.GameObjects.Text;
  private angleText!: Phaser.GameObjects.Text;
  private shellCountText!: Phaser.GameObjects.Text;
  private windText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private mySessionId: string = '';

  constructor() {
    super({ key: 'GameScene' });
  }

  async create() {
    console.log('GameScene created');

    // Create background
    this.add.rectangle(0, 0, CONST.GAME_WIDTH, CONST.GAME_HEIGHT, 0x87CEEB).setOrigin(0, 0);

    // Create graphics for terrain and ground
    this.groundGraphics = this.add.graphics();
    this.terrainGraphics = this.add.graphics();

    // Setup camera
    this.cameras.main.setBounds(0, 0, CONST.GAME_WIDTH, CONST.GAME_HEIGHT);
    this.cameras.main.setZoom(1);

    // Create UI
    this.createUI();

    // Setup network
    this.networkManager = new NetworkManager();
    this.inputManager = new InputManager(this);

    // Connect input to network
    this.inputManager.onInput((command) => {
      this.networkManager.sendInput(command);
    });

    try {
      const room = await this.networkManager.joinRoom();
      this.mySessionId = room.sessionId;
      
      // Listen to state changes
      room.onStateChange((state) => {
        this.gameState = state;
      });

      // Listen to tank additions
      room.state.tanks.onAdd((tank: TankSchema, key: string) => {
        this.createTankSprite(tank);
      });

      // Listen to tank removals
      room.state.tanks.onRemove((tank: TankSchema, key: string) => {
        this.removeTankSprite(key);
      });

      // Listen to shell additions
      room.state.shells.onAdd((shell: ShellSchema, key: string) => {
        this.createShellSprite(shell);
      });

      // Listen to shell removals
      room.state.shells.onRemove((shell: ShellSchema, key: string) => {
        this.removeShellSprite(key);
      });

      console.log('Connected to game room!');
    } catch (e) {
      console.error('Failed to connect:', e);
      this.statusText.setText('Failed to connect to server!');
    }
  }

  private createUI() {
    const margin = 10;
    const fontSize = '20px';
    const color = '#ffffff';

    this.hpText = this.add.text(margin, margin, 'HP: 10/10', {
      fontSize,
      color,
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0).setDepth(1000);

    this.angleText = this.add.text(margin, margin + 35, 'Angle: 45°', {
      fontSize,
      color,
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0).setDepth(1000);

    this.shellCountText = this.add.text(margin, margin + 70, 'Shells: 3/3', {
      fontSize,
      color,
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0).setDepth(1000);

    this.windText = this.add.text(margin, margin + 105, 'Wind: 0', {
      fontSize,
      color,
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0).setDepth(1000);

    this.statusText = this.add.text(
      this.scale.width / 2,
      margin,
      'Waiting for players...',
      {
        fontSize: '24px',
        color,
        backgroundColor: '#000000',
        padding: { x: 15, y: 10 }
      }
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

    // Controls hint
    this.add.text(
      this.scale.width - margin,
      margin,
      'A/D: Move | W/S: Angle | SPACE: Fire',
      {
        fontSize: '16px',
        color,
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);
  }

  private createTankSprite(tank: TankSchema) {
    const container = this.add.container(tank.x, tank.y);
    
    // Tank body
    const color = tank.team === CONST.TEAM_RED ? 0xff0000 : 0x0000ff;
    const body = this.add.rectangle(0, 0, CONST.TANK_WIDTH, CONST.TANK_HEIGHT, color);
    
    // Tank cannon
    const cannon = this.add.line(0, 0, 0, 0, 20, 0, color);
    cannon.setLineWidth(3);
    
    // HP bar background
    const hpBarBg = this.add.rectangle(0, -25, CONST.TANK_WIDTH, 5, 0x333333);
    
    // HP bar
    const hpBar = this.add.rectangle(-CONST.TANK_WIDTH / 2, -25, CONST.TANK_WIDTH, 5, 0x00ff00).setOrigin(0, 0.5);
    
    container.add([body, cannon, hpBarBg, hpBar]);
    
    // Store references
    container.setData('body', body);
    container.setData('cannon', cannon);
    container.setData('hpBar', hpBar);
    container.setData('tankId', tank.id);
    
    this.tankSprites.set(tank.id, container);
  }

  private removeTankSprite(tankId: string) {
    const sprite = this.tankSprites.get(tankId);
    if (sprite) {
      sprite.destroy();
      this.tankSprites.delete(tankId);
    }
  }

  private createShellSprite(shell: ShellSchema) {
    const color = shell.team === CONST.TEAM_RED ? 0xff0000 : 0x0000ff;
    const sprite = this.add.circle(shell.x, shell.y, CONST.SHELL_RADIUS, color);
    this.shellSprites.set(shell.id, sprite);
  }

  private removeShellSprite(shellId: string) {
    const sprite = this.shellSprites.get(shellId);
    if (sprite) {
      // Create explosion effect
      const explosion = this.add.circle(sprite.x, sprite.y, CONST.BLAST_RADIUS, 0xffaa00, 0.3);
      this.tweens.add({
        targets: explosion,
        alpha: 0,
        scale: 1.5,
        duration: 300,
        onComplete: () => explosion.destroy()
      });
      
      sprite.destroy();
      this.shellSprites.delete(shellId);
    }
  }

  update() {
    if (!this.gameState) return;

    // Update input
    this.inputManager.update();

    // Update tank sprites
    this.gameState.tanks.forEach((tank: TankSchema) => {
      const sprite = this.tankSprites.get(tank.id);
      if (sprite) {
        sprite.setPosition(tank.x, tank.y);
        
        // Update cannon angle
        const cannon = sprite.getData('cannon') as Phaser.GameObjects.Line;
        if (cannon) {
          const angleRad = (tank.angle * Math.PI) / 180;
          const cannonLength = 20;
          const direction = tank.team === CONST.TEAM_RED ? 1 : -1;
          cannon.setTo(
            0, 0,
            Math.cos(angleRad) * cannonLength * direction,
            -Math.sin(angleRad) * cannonLength
          );
        }
        
        // Update HP bar
        const hpBar = sprite.getData('hpBar') as Phaser.GameObjects.Rectangle;
        if (hpBar) {
          const hpPercent = tank.hp / CONST.TANK_MAX_HP;
          hpBar.setScale(hpPercent, 1);
          
          // Change color based on HP
          if (hpPercent > 0.6) {
            hpBar.setFillStyle(0x00ff00);
          } else if (hpPercent > 0.3) {
            hpBar.setFillStyle(0xffff00);
          } else {
            hpBar.setFillStyle(0xff0000);
          }
        }
        
        // Hide if not alive
        sprite.setVisible(tank.isAlive);
      }
    });

    // Update shell sprites
    this.gameState.shells.forEach((shell: ShellSchema) => {
      const sprite = this.shellSprites.get(shell.id);
      if (sprite) {
        sprite.setPosition(shell.x, shell.y);
      }
    });

    // Update terrain
    this.drawTerrain();

    // Update UI for my tank
    const myTank = this.gameState.tanks.get(this.mySessionId);
    if (myTank) {
      this.hpText.setText(`HP: ${myTank.hp}/${CONST.TANK_MAX_HP}`);
      this.angleText.setText(`Angle: ${Math.round(myTank.angle)}°`);
      this.shellCountText.setText(`Shells: ${myTank.shellCount}/${CONST.MAX_SHELLS}`);
      
      // Update camera to follow player
      this.cameras.main.scrollX = Phaser.Math.Clamp(
        myTank.x - this.scale.width / 2,
        0,
        CONST.GAME_WIDTH - this.scale.width
      );
    }

    this.windText.setText(`Wind: ${Math.round(this.gameState.wind)}`);

    // Update status
    if (this.gameState.phase === 'waiting') {
      this.statusText.setText('Waiting for players...');
    } else if (this.gameState.phase === 'playing') {
      this.statusText.setText(
        `Red: ${this.gameState.redTeamAlive} | Blue: ${this.gameState.blueTeamAlive}`
      );
    } else if (this.gameState.phase === 'finished') {
      if (this.gameState.winner === CONST.TEAM_RED) {
        this.statusText.setText('RED TEAM WINS!');
      } else if (this.gameState.winner === CONST.TEAM_BLUE) {
        this.statusText.setText('BLUE TEAM WINS!');
      } else {
        this.statusText.setText('DRAW!');
      }
    }
  }

  private drawTerrain() {
    if (!this.gameState || !this.gameState.terrain) return;

    this.groundGraphics.clear();
    this.terrainGraphics.clear();

    // Draw ground (fill below terrain)
    this.groundGraphics.fillStyle(0x8B4513, 1);
    this.groundGraphics.beginPath();
    
    const terrain = this.gameState.terrain;
    const segments = terrain.heights.length - 1;
    const segmentWidth = CONST.GAME_WIDTH / segments;

    // Start from bottom left
    this.groundGraphics.moveTo(0, CONST.GAME_HEIGHT);
    
    // Draw terrain outline
    for (let i = 0; i < terrain.heights.length; i++) {
      const x = i * segmentWidth;
      const height = terrain.heights[i];
      if (height !== undefined) {
        const y = CONST.GAME_HEIGHT - height;
        this.groundGraphics.lineTo(x, y);
      }
    }
    
    // Complete the shape
    this.groundGraphics.lineTo(CONST.GAME_WIDTH, CONST.GAME_HEIGHT);
    this.groundGraphics.closePath();
    this.groundGraphics.fillPath();

    // Draw terrain outline
    this.terrainGraphics.lineStyle(2, 0x654321, 1);
    this.terrainGraphics.beginPath();
    
    for (let i = 0; i < terrain.heights.length; i++) {
      const x = i * segmentWidth;
      const height = terrain.heights[i];
      if (height !== undefined) {
        const y = CONST.GAME_HEIGHT - height;
        
        if (i === 0) {
          this.terrainGraphics.moveTo(x, y);
        } else {
          this.terrainGraphics.lineTo(x, y);
        }
      }
    }
    
    this.terrainGraphics.strokePath();
  }

  shutdown() {
    if (this.networkManager) {
      this.networkManager.leave();
    }
  }
}
