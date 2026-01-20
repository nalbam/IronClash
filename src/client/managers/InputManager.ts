export class InputManager {
  private keys: Map<string, Phaser.Input.Keyboard.Key>;
  private scene: Phaser.Scene;
  private onInputCallback: ((command: string) => void) | null = null;
  
  // Mobile touch controls
  private leftButton: Phaser.GameObjects.Rectangle | null = null;
  private rightButton: Phaser.GameObjects.Rectangle | null = null;
  private upButton: Phaser.GameObjects.Rectangle | null = null;
  private downButton: Phaser.GameObjects.Rectangle | null = null;
  private fireButton: Phaser.GameObjects.Rectangle | null = null;
  
  private isMobile: boolean = false;
  private isCharging: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.keys = new Map();
    this.isMobile = this.detectMobile();

    this.setupKeyboard();
    if (this.isMobile) {
      this.setupMobileControls();
    }
  }

  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private setupKeyboard() {
    if (!this.scene.input.keyboard) return;

    const keyboard = this.scene.input.keyboard;
    this.keys.set('left', keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A));
    this.keys.set('right', keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D));
    this.keys.set('up', keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W));
    this.keys.set('down', keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S));
    this.keys.set('fire', keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE));

    // Also support arrow keys
    this.keys.set('left2', keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT));
    this.keys.set('right2', keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT));
    this.keys.set('up2', keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP));
    this.keys.set('down2', keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN));
  }

  private setupMobileControls() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const buttonSize = 60;
    const margin = 20;

    // Left/Right movement buttons (bottom left)
    this.leftButton = this.scene.add.rectangle(
      margin + buttonSize / 2,
      height - margin - buttonSize / 2,
      buttonSize,
      buttonSize,
      0x4444ff,
      0.5
    ).setInteractive().setScrollFactor(0).setDepth(1000);

    this.rightButton = this.scene.add.rectangle(
      margin + buttonSize / 2 + buttonSize + 10,
      height - margin - buttonSize / 2,
      buttonSize,
      buttonSize,
      0x4444ff,
      0.5
    ).setInteractive().setScrollFactor(0).setDepth(1000);

    // Up/Down angle buttons (bottom left, above movement)
    this.upButton = this.scene.add.rectangle(
      margin + buttonSize / 2 + buttonSize / 2 + 5,
      height - margin - buttonSize * 2 - 20,
      buttonSize,
      buttonSize,
      0x44ff44,
      0.5
    ).setInteractive().setScrollFactor(0).setDepth(1000);

    this.downButton = this.scene.add.rectangle(
      margin + buttonSize / 2 + buttonSize / 2 + 5,
      height - margin - buttonSize / 2,
      buttonSize,
      buttonSize,
      0x44ff44,
      0.5
    ).setInteractive().setScrollFactor(0).setDepth(1000);

    // Fire button (bottom right)
    this.fireButton = this.scene.add.rectangle(
      width - margin - buttonSize / 2,
      height - margin - buttonSize / 2,
      buttonSize * 1.5,
      buttonSize * 1.5,
      0xff4444,
      0.5
    ).setInteractive().setScrollFactor(0).setDepth(1000);

    // Add labels
    this.scene.add.text(this.leftButton.x, this.leftButton.y, '←', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    this.scene.add.text(this.rightButton.x, this.rightButton.y, '→', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    this.scene.add.text(this.upButton.x, this.upButton.y, '↑', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    this.scene.add.text(this.downButton.x, this.downButton.y, '↓', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    this.scene.add.text(this.fireButton.x, this.fireButton.y, 'FIRE', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    // Setup button events
    this.leftButton.on('pointerdown', () => this.sendInput('move_left'));
    this.leftButton.on('pointerup', () => this.sendInput('move_stop'));
    this.leftButton.on('pointerout', () => this.sendInput('move_stop'));

    this.rightButton.on('pointerdown', () => this.sendInput('move_right'));
    this.rightButton.on('pointerup', () => this.sendInput('move_stop'));
    this.rightButton.on('pointerout', () => this.sendInput('move_stop'));

    this.upButton.on('pointerdown', () => this.sendInput('angle_up'));
    this.upButton.on('pointerup', () => this.sendInput('angle_stop'));

    this.downButton.on('pointerdown', () => this.sendInput('angle_down'));
    this.downButton.on('pointerup', () => this.sendInput('angle_stop'));

    this.fireButton.on('pointerdown', () => {
      this.sendInput('fire_start');
      this.isCharging = true;
    });
    this.fireButton.on('pointerup', () => {
      if (this.isCharging) {
        this.sendInput('fire_release');
        this.isCharging = false;
      }
    });
  }

  update() {
    if (this.isMobile) return; // Mobile uses button events

    const leftKey = this.keys.get('left') || this.keys.get('left2');
    const rightKey = this.keys.get('right') || this.keys.get('right2');
    const upKey = this.keys.get('up') || this.keys.get('up2');
    const downKey = this.keys.get('down') || this.keys.get('down2');
    const fireKey = this.keys.get('fire');

    // Movement
    if (leftKey && Phaser.Input.Keyboard.JustDown(leftKey)) {
      this.sendInput('move_left');
    } else if (leftKey && Phaser.Input.Keyboard.JustUp(leftKey)) {
      this.sendInput('move_stop');
    }

    if (rightKey && Phaser.Input.Keyboard.JustDown(rightKey)) {
      this.sendInput('move_right');
    } else if (rightKey && Phaser.Input.Keyboard.JustUp(rightKey)) {
      this.sendInput('move_stop');
    }

    // Angle adjustment
    if (upKey && upKey.isDown) {
      this.sendInput('angle_up');
    }
    if (downKey && downKey.isDown) {
      this.sendInput('angle_down');
    }

    // Firing
    if (fireKey && Phaser.Input.Keyboard.JustDown(fireKey)) {
      this.sendInput('fire_start');
      this.isCharging = true;
    } else if (fireKey && Phaser.Input.Keyboard.JustUp(fireKey)) {
      if (this.isCharging) {
        this.sendInput('fire_release');
        this.isCharging = false;
      }
    }
  }

  onInput(callback: (command: string) => void) {
    this.onInputCallback = callback;
  }

  private sendInput(command: string) {
    if (this.onInputCallback) {
      this.onInputCallback(command);
    }
  }
}
