/**
 * 文件：src/ui/TopBar.js
 * 作用：培养界面最上面一排。头像可点，打开个人信息。
 * 悟性、精力、积蓄放在三块纸片上，只显示，不在这里扣。数字变了会跳一下。
 */

import { INSIGHT_ICON } from '../data/attributes.js';
import { getStage } from '../data/stages.js';
import { inkText } from '../config/constants.js';
import { pulse } from '../effects/Motion.js';
import { faceFor } from '../systems/StatSystem.js';
import { paintIcon } from './paintIcon.js';
import TextButton from './components/TextButton.js';
import { WOOD, drawCard, shade } from './theme/frame.js';

export default class TopBar {
  constructor(scene, { onAvatar, onPause }) {
    this.scene = scene;
    this.last = {};
    const bar = scene.add.graphics().setDepth(5);
    bar.fillStyle(0x000000, 0.1);
    bar.fillRect(0, 88, 1280, 6);
    bar.fillStyle(shade(WOOD.mid, 1.05), 0.92);
    bar.fillRect(0, 0, 1280, 88);
    bar.fillStyle(WOOD.dark, 1);
    bar.fillRect(0, 84, 1280, 6);
    bar.lineStyle(1, WOOD.grain, 0.25);
    [18, 40, 62].forEach((y) => bar.lineBetween(0, y, 1280, y));

    scene.add.circle(58, 46, 36, WOOD.dark).setDepth(6);
    scene.add.circle(58, 46, 32, 0xf3d7b0).setStrokeStyle(3, 0xf3d48a, 1).setDepth(6);
    this.avatarFace = scene.add.text(58, 46, '', inkText(28)).setOrigin(0.5).setDepth(7);
    this.avatarImage = null;
    if (scene.textures.exists('avatar')) {
      this.avatarImage = scene.add.image(58, 46, 'avatar').setDepth(7);
      const longest = Math.max(this.avatarImage.width, this.avatarImage.height) || 1;
      this.avatarImage.setScale(60 / longest);
      const mask = scene.make.graphics({ add: false });
      mask.fillStyle(0xffffff);
      mask.fillCircle(58, 46, 30);
      this.avatarImage.setMask(mask.createGeometryMask());
      this.avatarFace.setVisible(false);
    }
    this.avatarHit = scene.add.circle(58, 46, 34, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(8);
    this.avatarHit.on('pointerup', (pointer, x, y, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      onAvatar();
    });

    this.nameText = scene.add.text(106, 30, '', inkText(22, '#fff6e6')).setOrigin(0, 0.5).setDepth(6);
    this.stageText = scene.add.text(106, 60, '', inkText(15, '#f3d48a')).setOrigin(0, 0.5).setDepth(6);

    const pills = scene.add.graphics().setDepth(5);
    [430, 650, 870].forEach((x) => drawCard(pills, x, 24, 190, 42, 20));
    paintIcon(scene, INSIGHT_ICON, 456, 45, 26, 6);
    this.insightText = scene.add.text(478, 45, '', inkText(18)).setOrigin(0, 0.5).setDepth(6);
    this.drawBolt(pills, 676, 45);
    this.energyText = scene.add.text(698, 45, '', inkText(18)).setOrigin(0, 0.5).setDepth(6);
    this.drawCoin(pills, 896, 45);
    this.moneyText = scene.add.text(918, 45, '', inkText(18)).setOrigin(0, 0.5).setDepth(6);

    this.pauseButton = new TextButton(scene, 1210, 45, 88, 42, '暂停', onPause, {
      fontSize: 16,
      depth: 6,
      color: 0xc45c26,
    });
  }

  drawBolt(g, x, y) {
    g.fillStyle(0xe2b325, 1);
    g.fillTriangle(x + 3, y - 13, x - 8, y + 2, x + 1, y + 2);
    g.fillTriangle(x - 1, y - 2, x + 8, y - 2, x - 3, y + 13);
  }

  drawCoin(g, x, y) {
    g.fillStyle(0xc9952d, 1);
    g.fillCircle(x, y + 1, 11);
    g.fillStyle(0xf3cf5c, 1);
    g.fillCircle(x, y, 11);
    g.lineStyle(2, 0xc9952d, 1);
    g.strokeCircle(x, y, 6);
  }

  setValue(text, key, label, value) {
    text.setText(label);
    if (this.last[key] !== undefined && this.last[key] !== value) pulse(this.scene, text);
    this.last[key] = value;
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    const h = state.household;
    this.avatarFace.setText(faceFor(state.child.stats, stage));
    this.nameText.setText(state.child.name);
    this.stageText.setText(`${stage.grade} · ${stage.age} 岁`);
    this.setValue(this.insightText, 'insight', `悟性 ${h.insight}/${h.insightMax}`, h.insight);
    this.setValue(this.energyText, 'energy', `精力 ${h.energy}/${h.energyMax}`, h.energy);
    this.setValue(this.moneyText, 'money', `积蓄 ${h.money}`, h.money);
    this.pauseButton.setVisible(!state.endingId);
  }
}
