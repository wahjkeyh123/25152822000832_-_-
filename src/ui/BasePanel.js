/**
 * 文件：src/ui/BasePanel.js
 * 作用：所有弹窗的父类。负责半透明遮罩，挡住后面的按钮。
 * 打开后的 200 毫秒内不接受点击，避免「点结束学年」的那一下误触到新弹出来的选项。
 */

import { COLORS, GAME_HEIGHT, GAME_WIDTH, inkText } from '../config/constants.js';

export default class BasePanel {
  constructor(scene, { title, width = 760, height = 440 } = {}) {
    this.scene = scene;
    this.objects = [];
    this.openedAt = scene.time.now;
    this.width = width;
    this.height = height;
    this.centerX = GAME_WIDTH / 2;
    this.centerY = GAME_HEIGHT / 2;

    const dim = scene.add.rectangle(this.centerX, this.centerY, GAME_WIDTH, GAME_HEIGHT, COLORS.dim, 0.46);
    const zone = scene.add.zone(this.centerX, this.centerY, GAME_WIDTH, GAME_HEIGHT).setInteractive();
    zone.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
    });
    this.track(dim, 0);
    this.track(zone, 1);

    const frame = scene.add.graphics();
    const left = this.centerX - width / 2;
    const top = this.centerY - height / 2;
    frame.fillStyle(0xfff9f0, 1);
    frame.fillRoundedRect(left, top, width, height, 18);
    frame.lineStyle(2, COLORS.panelEdge, 1);
    frame.strokeRoundedRect(left, top, width, height, 18);
    this.track(frame, 2);
    this.left = left;
    this.top = top;

    if (title) {
      this.track(scene.add.text(this.centerX, top + 36, title, inkText(28)).setOrigin(0.5), 3);
    }
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
