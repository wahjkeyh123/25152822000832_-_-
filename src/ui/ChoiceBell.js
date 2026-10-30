/**
 * 文件：src/ui/ChoiceBell.js
 * 作用：当前期望右边的「抉择」铃。有未看的选择事件时亮起来，点开才弹出选项。
 */

import { inkText } from '../config/constants.js';

export default class ChoiceBell {
  constructor(scene, onOpen) {
    this.scene = scene;
    this.onOpen = onOpen;
    const x = 322;
    const y = 640;
    this.x = x;
    this.y = y;

    this.glow = scene.add.circle(x, y, 34, 0xf3d48a, 0.18).setDepth(5);
    this.bg = scene.add.circle(x, y, 28, 0xf3c94a).setDepth(6);
    this.ring = scene.add.circle(x, y, 28).setStrokeStyle(4, 0x3b2616, 0.85).setDepth(6);
    this.mark = scene.add.text(x, y - 1, '!', inkText(32, '#3b2616', { fontStyle: 'bold' })).setOrigin(0.5).setDepth(7);
    this.hit = scene.add.circle(x, y, 30, 0xffffff, 0.001).setDepth(8);
    this.hit.setInteractive({ useHandCursor: true });
    this.hit.on('pointerup', (pointer, hx, hy, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      onOpen();
    });
    this.hit.on('pointerover', () => this.bg.setFillStyle(0xffe07a));
    this.hit.on('pointerout', () => this.bg.setFillStyle(0xf3c94a));
    this.nodes = [this.glow, this.bg, this.ring, this.mark, this.hit];
    this.tween = scene.tweens.add({
      targets: this.glow,
      scale: 1.18,
      alpha: 0.05,
      duration: 900,
      yoyo: true,
      repeat: -1,
    });
    this.refresh(false);
  }

  refresh(visible) {
    this.nodes.forEach((node) => node.setVisible(visible));
    if (visible) this.tween.resume();
    else this.tween.pause();
  }
}
