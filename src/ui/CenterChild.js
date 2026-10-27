/**
 * 文件：src/ui/CenterChild.js
 * 作用：画面中间的孩子。点一下打开脑洞。
 * 有 child.png 时用图片，没有就画一个随年龄变高的人影。
 */

import { inkText } from '../config/constants.js';
import { getStage } from '../data/stages.js';
import { faceFor } from '../systems/StatSystem.js';

const HEIGHT = { baby: 78, kinder: 110, middle: 150, high: 168 };

export default class CenterChild {
  constructor(scene, onClick) {
    this.scene = scene;
    this.body = scene.add.graphics().setDepth(2);
    this.face = scene.add.text(640, 360, '', inkText(56)).setOrigin(0.5).setDepth(3);
    this.photo = null;
    this.zone = scene.add.zone(640, 430, 220, 300).setDepth(4).setInteractive({ useHandCursor: true });
    this.zone.on('pointerup', (pointer, x, y, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      onClick();
    });
    scene.add.text(640, 590, '点孩子，去脑洞', inkText(16, '#2c2416')).setOrigin(0.5).setDepth(4);
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    const bodyHeight = HEIGHT[stage.id] || 120;
    this.body.clear();
    this.body.fillStyle(0xc4a484, 0.35);
    if (this.scene.textures.exists('child')) {
      this.face.setVisible(false);
      if (!this.photo) this.photo = this.scene.add.image(640, 400, 'child').setDepth(3);
      const aspect = (this.photo.width || 1) / (this.photo.height || 1);
      let width = 250;
      let height = width / aspect;
      if (height > 320) {
        height = 320;
        width = height * aspect;
      }
      this.photo.setDisplaySize(width, height);
      this.photo.setPosition(640, 470 - height / 2);
      this.body.fillEllipse(640, 470, Math.min(width, 220), 36);
      return;
    }
    this.face.setVisible(true);
    this.face.setText(faceFor(state.child.stats, stage));
    this.face.setY(430 - bodyHeight * 0.55);
    this.body.fillStyle(0xe7b089, 1);
    this.body.fillCircle(640, 430 - bodyHeight * 0.55, 28);
    this.body.fillStyle(0xd98b6c, 1);
    this.body.fillRoundedRect(612, 430 - bodyHeight * 0.28, 56, bodyHeight * 0.7, 16);
  }
}
