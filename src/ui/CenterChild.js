/**
 * 文件：src/ui/CenterChild.js
 * 作用：画面中间的孩子。会轻轻呼吸，点一下跳一跳，然后打开脑洞。
 * 有 child.png 时用图片，没有就画一个随年龄变高的人影。
 */

import { inkText } from '../config/constants.js';
import { getStage } from '../data/stages.js';
import { breathe, hop } from '../effects/Motion.js';
import { faceFor } from '../systems/StatSystem.js';

const HEIGHT = { baby: 78, kinder: 110, middle: 150, high: 168 };
const FEET_Y = 470;

export default class CenterChild {
  constructor(scene, onClick) {
    this.scene = scene;
    this.shadow = scene.add.graphics().setDepth(2);
    this.body = scene.add.graphics().setDepth(2);
    this.face = scene.add.text(640, 360, '', inkText(56)).setOrigin(0.5).setDepth(3);
    this.photo = null;
    this.breath = null;
    this.sizedFor = null;
    this.zone = scene.add.zone(640, 380, 240, 320).setDepth(4).setInteractive({ useHandCursor: true });
    this.zone.on('pointerup', (pointer, x, y, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      hop(scene, [this.photo, this.face].filter((item) => item && item.visible));
      scene.time.delayedCall(160, () => onClick());
    });
    const tip = scene.add.text(640, 608, '点孩子，去脑洞', inkText(16, '#5b4632', {
      backgroundColor: '#fff6e6',
      padding: { x: 12, y: 5 },
    })).setOrigin(0.5).setDepth(4);
    scene.tweens.add({ targets: tip, alpha: 0.55, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    const bodyHeight = HEIGHT[stage.id] || 120;
    if (this.scene.textures.exists('child')) {
      this.face.setVisible(false);
      this.body.clear();
      if (!this.photo) {
        // 原点放在脚下，呼吸时脚不离地。
        this.photo = this.scene.add.image(640, FEET_Y, 'child').setOrigin(0.5, 1).setDepth(3);
      }
      if (this.sizedFor !== stage.id) this.sizePhoto(stage.id);
      return;
    }
    this.face.setVisible(true);
    this.face.setText(faceFor(state.child.stats, stage));
    this.face.setY(FEET_Y - 40 - bodyHeight * 0.55);
    this.drawShadow(140);
    this.body.clear();
    this.body.fillStyle(0xe7b089, 1);
    this.body.fillCircle(640, FEET_Y - 40 - bodyHeight * 0.55, 28);
    this.body.fillStyle(0xd98b6c, 1);
    this.body.fillRoundedRect(612, FEET_Y - 40 - bodyHeight * 0.28, 56, bodyHeight * 0.7, 16);
  }

  /** 孩子越大，图越高一点。换时期时才重新算，避免和呼吸动画抢缩放。 */
  sizePhoto(stageId) {
    this.sizedFor = stageId;
    this.breath?.stop();
    const grow = { baby: 0.84, kinder: 0.9, middle: 0.96, high: 1 }[stageId] || 1;
    const aspect = (this.photo.width || 1) / (this.photo.height || 1);
    let height = 330 * grow;
    let width = height * aspect;
    if (width > 260) {
      width = 260;
      height = width / aspect;
    }
    this.photo.setDisplaySize(width, height);
    this.photo.setPosition(640, FEET_Y);
    this.drawShadow(Math.min(width, 220));
    this.breath = breathe(this.scene, this.photo);
  }

  drawShadow(width) {
    this.shadow.clear();
    this.shadow.fillStyle(0x000000, 0.16);
    this.shadow.fillEllipse(640, FEET_Y, width, 30);
  }
}
