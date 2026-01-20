import * as Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import * as CONST from '../shared/constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CONST.GAME_WIDTH,
  height: CONST.GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  scene: [GameScene]
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
});
