/**
 * 文件：src/ui/CenterChild.js
 * 作用：画面中间的孩子。会轻轻呼吸，点一下跳一跳，然后打开脑洞。
 * 人站在正中央的空地上。教室背景自己取景，把地板让出来，不用坐到椅子里。
 * 压力高了人会塌一点、颜色发灰。
 */

import { inkText } from '../config/constants.js';
import { getStage } from '../data/stages.js';
import { breathe, hop } from '../effects/Motion.js';
import { faceFor } from '../systems/StatSystem.js';
import { childArtKey, childSpot } from './childArt.js';

export default class CenterChild {
  constructor(scene, onClick) {
    this.scene = scene;
    this.stress = 0;
    this.shadow = scene.add.graphics().setDepth(2);
    this.body = scene.add.graphics().setDepth(2);
    this.face = scene.add.text(640, 360, '', inkText(56)).setOrigin(0.5).setDepth(3);
    this.photo = null;
    this.breath = null;
    this.shownKey = null;
    this.spot = childSpot('baby');
    this.zone = scene.add.zone(640, 400, 260, 330).setDepth(4).setInteractive({ useHandCursor: true });
    this.zone.on('pointerup', (pointer, x, y, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      hop(scene, [this.photo, this.face].filter((item) => item && item.visible));
      scene.time.delayedCall(160, () => onClick());
    });
    this.zone.on('pointerover', () => this.photo?.setTint(0xfff3dc));
    this.zone.on('pointerout', () => this.tintForStress());
    this.tip = scene.add.text(640, 590, '点孩子 · 进入脑洞', inkText(15, '#fff8ee', {
      backgroundColor: '#7d5234',
      padding: { x: 14, y: 5 },
    })).setOrigin(0.5).setDepth(4);
    scene.tweens.add({ targets: this.tip, alpha: 0.6, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    this.stress = state.child.stats.stress ?? 0;
    const key = childArtKey(this.scene, state.child, stage.id);
    this.spot = childSpot(stage.id);
    if (key) {
      this.face.setVisible(false);
      this.body.clear();
      if (key !== this.shownKey) this.showPhoto(key);
      else this.layoutPhoto();
      this.tintForStress();
      this.placeTip();
      return;
    }
    const spot = this.spot;
    const bodyHeight = spot.height * 0.45;
    this.face.setVisible(true);
    this.face.setText(faceFor(state.child.stats, stage));
    this.face.setPosition(spot.x, spot.y - 40 - bodyHeight * 0.55);
    this.drawShadow(spot.x, spot.y, 140);
    this.body.clear();
    this.body.fillStyle(0xe7b089, 1);
    this.body.fillCircle(spot.x, spot.y - 40 - bodyHeight * 0.55, 28);
    this.body.fillStyle(0xd98b6c, 1);
    this.body.fillRoundedRect(spot.x - 28, spot.y - 40 - bodyHeight * 0.28, 56, bodyHeight * 0.7, 16);
    this.zone.setPosition(spot.x, spot.y - bodyHeight / 2).setSize(160, bodyHeight + 40);
    this.placeTip();
  }

  /** 换时期时才重新贴图，避免和呼吸动画抢缩放。 */
  showPhoto(key) {
    this.shownKey = key;
    this.breath?.stop();
    if (!this.photo) {
      this.photo = this.scene.add.image(this.spot.x, this.spot.y, key).setOrigin(0.5, 1).setDepth(3);
    } else {
      this.photo.setTexture(key);
      this.photo.setScale(1);
    }
    this.layoutPhoto();
    this.breath = breathe(this.scene, this.photo);
  }

  layoutPhoto() {
    const spot = this.spot;
    const slump = this.stress >= 75 ? 10 : this.stress >= 55 ? 4 : 0;
    const frameW = this.photo.width || 1;
    const frameH = this.photo.height || 1;
    const aspect = frameW / frameH;
    const maxH = Math.min(spot.height, Math.max(220, spot.y - 128));
    let height = maxH;
    let width = height * aspect;
    if (width > 210) {
      width = 210;
      height = width / aspect;
    }
    this.photo.setOrigin(0.5, 1);
    this.photo.setDisplaySize(Math.round(width), Math.round(height));
    this.photo.setPosition(spot.x, spot.y + slump);
    this.zone.setPosition(spot.x, spot.y + slump - height / 2).setSize(Math.max(140, width + 24), height);
    this.drawShadow(spot.x, spot.y + slump, Math.min(width * 0.85, 200));
  }

  tintForStress() {
    if (!this.photo) return;
    if (this.stress >= 80) this.photo.setTint(0xc9b4b0);
    else if (this.stress >= 60) this.photo.setTint(0xe6d3c8);
    else this.photo.clearTint();
  }

  placeTip() {
    const y = Math.min(662, this.spot.y + 38);
    this.tip.setPosition(this.spot.x, y);
    if (this.stress >= 75) this.tip.setText('点孩子 · 进入脑洞（有点撑不住）');
    else if (this.stress >= 55) this.tip.setText('点孩子 · 进入脑洞（心里有事）');
    else this.tip.setText('点孩子 · 进入脑洞');
  }

  drawShadow(x, y, width) {
    this.shadow.clear();
    this.shadow.fillStyle(0x000000, 0.22);
    this.shadow.fillEllipse(x, y - 4, width, 26);
  }
}
