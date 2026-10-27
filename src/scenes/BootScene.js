/**
 * 文件：src/scenes/BootScene.js
 * 作用：游戏的第一站。只创建全局的传话桌子，然后马上去加载。
 * 不要在这里写玩法，也不要在这里加载大图，否则玩家会看到长时间黑屏。
 */

import EventBus from '../core/EventBus.js';
import { SCENE } from '../config/constants.js';
import BaseScene from '../core/BaseScene.js';

export default class BootScene extends BaseScene {
  constructor() {
    super(SCENE.BOOT);
  }

  create() {
    if (!this.bus) this.registry.set('bus', new EventBus());
    this.scene.start(SCENE.PRELOAD);
  }
}
