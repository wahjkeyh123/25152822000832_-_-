/**
 * 文件：src/ui/BasePanel.js
 * 作用：所有弹窗的父类。负责半透明遮罩、木框纸面和标题书签，挡住后面的按钮。
 * 打开后的 200 毫秒内不接受点击，避免「点结束学年」的那一下误触到新弹出来的选项。
 */

import { COLORS, GAME_HEIGHT, GAME_WIDTH, inkText } from '../config/constants.js';
import { fadeInObjects } from '../effects/Motion.js';
import { drawTab, drawWoodFrame } from './theme/frame.js';

export default class BasePanel {
  constructor(scene, { title, width = 760, height = 440 } = {}) {
    this.scene = scene;
    this.objects = [];
    this.openedAt = scene.time.now;
    this.width = width;
    this.height = height;
    this.centerX = GAME_WIDTH / 2;
    this.centerY = GAME_HEIGHT / 2;

    const dim = scene.add.rectangle(this.centerX, this.centerY, GAME_WIDTH, GAME_HEIGHT, COLORS.dim, 0.5);
    const zone = scene.add.zone(this.centerX, this.centerY, GAME_WIDTH, GAME_HEIGHT).setInteractive();
    zone.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
    });
    this.track(dim, 0);
    this.track(zone, 1);

    const frame = scene.add.graphics();
    const left = this.centerX - width / 2;
    const top = this.centerY - height / 2;
    drawWoodFrame(frame, left, top, width, height);
    this.track(frame, 2);
    this.left = left;
    this.top = top;

    if (title) {
      const tabW = Math.max(180, title.length * 30 + 60);
      const tab = scene.add.graphics();
      drawTab(tab, this.centerX - tabW / 2, top + 14, tabW, 44, 0xc45c26);
      this.track(tab, 3);
      this.track(scene.add.text(this.centerX, top + 36, title, inkText(26, '#fff8ee')).setOrigin(0.5), 4);
    }

    // 子类在构造函数里还会继续加东西，所以等这一帧结束再统一淡入。
    scene.time.delayedCall(0, () => fadeInObjects(scene, this.objects));
  }

  /** 弹窗刚打开的瞬间，忽略点击。 */
  canClick() {
    return this.scene.time.now - this.openedAt >= 200;
  }

  track(obj, depthOffset = 0) {
    obj.setDepth(200 + depthOffset);
    this.objects.push(obj);
    return obj;
  }

  destroy() {
    this.objects.forEach((obj) => obj.destroy());
    this.objects = [];
  }
}
