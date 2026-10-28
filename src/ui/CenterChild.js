/**
 * 文件：src/ui/CenterChild.js
 * 作用：画面中间的孩子。会轻轻呼吸，点一下跳一跳，然后打开脑洞。
 * 立绘按性别和时期换：婴儿坐着，越大越高。缺图时画一个随年龄变高的人影。
 */

import { inkText } from '../config/constants.js';
import { getStage } from '../data/stages.js';
import { breathe, hop } from '../effects/Motion.js';
import { faceFor } from '../systems/StatSystem.js';
import { childArtKey } from './childArt.js';

const HEIGHT = { baby: 230, kinder: 318, middle: 392, high: 410 };
const FEET_Y = 566;

export default class CenterChild {
  constructor(scene, onClick) {
    this.scene = scene;
    this.shadow = scene.add.graphics().setDepth(2);
    this.body = scene.add.graphics().setDepth(2);
    this.face = scene.add.text(640, 360, '', inkText(56)).setOrigin(0.5).setDepth(3);
    this.photo = null;
    this.breath = null;
    this.shownKey = null;
    this.zone = scene.add.zone(640, 400, 260, 330).setDepth(4).setInteractive({ useHandCursor: true });
    this.zone.on('pointerup', (pointer, x, y, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      hop(scene, [this.photo, this.face].filter((item) => item && item.visible));
      scene.time.delayedCall(160, () => onClick());
    });
    this.zone.on('pointerover', () => this.photo?.setTint(0xfff3dc));
    this.zone.on('pointerout', () => this.photo?.clearTint());
    this.tip = scene.add.text(640, FEET_Y + 26, '点孩子 · 进入脑洞', inkText(15, '#fff8ee', {
      backgroundColor: '#7d5234',
      padding: { x: 14, y: 5 },
    })).setOrigin(0.5).setDepth(4);
    scene.tweens.add({ targets: this.tip, alpha: 0.6, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    const key = childArtKey(this.scene, state.child, stage.id);
    if (key) {
      this.face.setVisible(false);
      this.body.clear();
      if (key !== this.shownKey) this.showPhoto(key, stage.id);
      return;
    }
    const bodyHeight = (HEIGHT[stage.id] || 300) * 0.45;
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

  /** 换时期时才重新算大小，避免和呼吸动画抢缩放。 */
  showPhoto(key, stageId) {
    this.shownKey = key;
    this.breath?.stop();
    if (!this.photo) {
      // 原点放在脚下，呼吸时脚不离地。
      this.photo = this.scene.add.image(640, FEET_Y, key).setOrigin(0.5, 1).setDepth(3);
    } else {
      this.photo.setTexture(key);
      this.photo.setScale(1);
    }
    const aspect = (this.photo.width || 1) / (this.photo.height || 1);
    let height = HEIGHT[stageId] || 360;
    let width = height * aspect;
    if (width > 300) {
      width = 300;
      height = width / aspect;
    }
    this.photo.setDisplaySize(width, height);
    this.photo.setPosition(640, FEET_Y);
    this.zone.setPosition(640, FEET_Y - height / 2).setSize(Math.max(160, width), height);
    this.drawShadow(Math.min(width * 0.9, 220));
    this.breath = breathe(this.scene, this.photo);
  }

  drawShadow(width) {
    this.shadow.clear();
    this.shadow.fillStyle(0x000000, 0.22);
    this.shadow.fillEllipse(640, FEET_Y - 4, width, 26);
  }
}
