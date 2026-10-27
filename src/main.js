/**
 * 文件：src/main.js
 * 作用：整个网页游戏的入口。
 * 顺序固定为：启动 → 加载 → 主菜单 → 四个时期 → 结局。
 * 暂停、事件、结算都是叠在培养场景上的弹窗，不把进度拆散。
 */

import Phaser from 'phaser';
import { createGameConfig } from './config/gameConfig.js';
import BootScene from './scenes/BootScene.js';
import EndingScene from './scenes/EndingScene.js';
import GameScene from './scenes/GameScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import PreloadScene from './scenes/PreloadScene.js';

const config = createGameConfig([
  BootScene,
  PreloadScene,
  MainMenuScene,
  GameScene,
  EndingScene,
]);

const previous = window.__supperBeforeGame;
if (previous) previous.destroy(true);
window.__supperBeforeGame = new Phaser.Game(config);
