/**
 * 文件：src/config/gameConfig.js
 * 作用：创建 Phaser 游戏时的总开关（画面大小、缩放、场景列表）。
 * 这里不写玩法。玩法在 systems/ 和 data/。
 */

import { COLORS, GAME_HEIGHT, GAME_WIDTH } from './constants.js';

export function createGameConfig(scenes) {
  return {
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: COLORS.bg,
    banner: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: scenes,
  };
}
