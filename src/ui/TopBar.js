/**
 * 文件：src/ui/TopBar.js
 * 作用：培养界面最上面一排。头像可点，打开个人信息。
 * 左边是悟性、精力、积蓄三块纸片；右边是「父母满意度」和「压力」两条进度条。
 * 只显示，不在这里改数字。数字变了会跳一下。
 */

import { INSIGHT_ICON } from '../data/attributes.js';
import { getStage } from '../data/stages.js';
import { SAT_MAX, inkText } from '../config/constants.js';
import { pulse } from '../effects/Motion.js';
import { faceFor } from '../systems/StatSystem.js';
import { addPortrait, childArtKey, swapPortrait } from './childArt.js';
import { paintIcon } from './paintIcon.js';
import TextButton from './components/TextButton.js';
import { WOOD, drawCard, shade } from './theme/frame.js';

const AVATAR = { x: 58, y: 46, r: 32 };
const BAR_W = 168;

export default class TopBar {
  constructor(scene, { onAvatar, onPause }) {
    this.scene = scene;
    this.last = {};
    const bar = scene.add.graphics().setDepth(5);
    bar.fillStyle(0x000000, 0.12);
    bar.fillRect(0, 88, 1280, 6);
    bar.fillStyle(shade(WOOD.mid, 1.05), 0.94);
    bar.fillRect(0, 0, 1280, 88);
    bar.fillStyle(WOOD.dark, 1);
    bar.fillRect(0, 84, 1280, 6);
    bar.lineStyle(1, WOOD.grain, 0.25);
    [18, 40, 62].forEach((y) => bar.lineBetween(0, y, 1280, y));

    scene.add.circle(AVATAR.x, AVATAR.y, AVATAR.r + 4, WOOD.dark).setDepth(6);
    this.avatarNodes = [];
    this.avatarFace = scene.add.text(AVATAR.x, AVATAR.y, '', inkText(28)).setOrigin(0.5).setDepth(8);
    this.avatarHit = scene.add.circle(AVATAR.x, AVATAR.y, AVATAR.r + 2, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(9);
    this.avatarHit.on('pointerup', (pointer, x, y, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      onAvatar();
    });
    this.avatarHit.on('pointerover', () => this.avatarNodes[0]?.setStrokeStyle(3, 0xfff3c4, 1));
    this.avatarHit.on('pointerout', () => this.avatarNodes[0]?.setStrokeStyle(3, 0xf3d48a, 1));

    this.nameText = scene.add.text(104, 30, '', inkText(22, '#fff6e6', { fontStyle: 'bold' })).setOrigin(0, 0.5).setDepth(6);
    this.stageText = scene.add.text(104, 60, '', inkText(15, '#f3d48a')).setOrigin(0, 0.5).setDepth(6);

    const pills = scene.add.graphics().setDepth(5);
    drawCard(pills, 312, 24, 146, 42, 20);
    drawCard(pills, 466, 24, 146, 42, 20);
    drawCard(pills, 620, 24, 128, 42, 20);
    paintIcon(scene, INSIGHT_ICON, 336, 45, 26, 6);
    this.insightText = scene.add.text(354, 45, '', inkText(17)).setOrigin(0, 0.5).setDepth(6);
    this.drawBolt(pills, 490, 45);
    this.energyText = scene.add.text(508, 45, '', inkText(17)).setOrigin(0, 0.5).setDepth(6);
    this.drawCoin(pills, 644, 45);
    this.moneyText = scene.add.text(662, 45, '', inkText(17)).setOrigin(0, 0.5).setDepth(6);

    this.sat = this.meter(762, '父母满意度', 0xf0b43c);
    this.stress = this.meter(962, '孩子压力', 0xd0563b);

    this.pauseButton = new TextButton(scene, 1226, 45, 82, 42, '暂停', onPause, {
      fontSize: 16,
      depth: 6,
      color: 0xc45c26,
    });
  }

  /** 一条带标题的进度条：左上标题，右上数字，下面是条。 */
  meter(x, label, color) {
    const scene = this.scene;
    const g = scene.add.graphics().setDepth(5);
    drawCard(g, x, 14, BAR_W + 24, 62, 14);
    g.fillStyle(0x3b2616, 0.85);
    g.fillRoundedRect(x + 12, 50, BAR_W, 14, 7);
    const title = scene.add.text(x + 12, 31, label, inkText(14, '#5a4a3a', { fontStyle: 'bold' })).setOrigin(0, 0.5).setDepth(6);
    const value = scene.add.text(x + 12 + BAR_W, 31, '', inkText(14)).setOrigin(1, 0.5).setDepth(6);
    const fill = scene.add.rectangle(x + 14, 57, 0, 10, color).setOrigin(0, 0.5).setDepth(6);
    const shine = scene.add.rectangle(x + 14, 54, 0, 3, 0xffffff, 0.35).setOrigin(0, 0.5).setDepth(6);
    const ticks = scene.add.graphics().setDepth(6);
    ticks.lineStyle(1, 0x000000, 0.25);
    [0.25, 0.5, 0.75].forEach((r) => ticks.lineBetween(x + 12 + BAR_W * r, 51, x + 12 + BAR_W * r, 63));
    return { title, value, fill, shine, color, width: BAR_W - 4 };
  }

  setMeter(meter, key, value, max, color) {
    const ratio = Math.max(0, Math.min(1, value / max));
    meter.value.setText(`${value}/${max}`);
    meter.fill.setFillStyle(color);
    const width = Math.round(meter.width * ratio);
    if (this.last[key] === undefined) {
      meter.fill.width = width;
      meter.shine.width = width;
    } else if (this.last[key] !== value) {
      this.scene.tweens.add({ targets: [meter.fill, meter.shine], width, duration: 320, ease: 'Cubic.easeOut' });
      pulse(this.scene, meter.value);
    }
    this.last[key] = value;
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

  refreshAvatar(state, stage) {
    const look = `${state.child.gender}-${stage.id}`;
    if (this.avatarLook === look) return;
    this.avatarLook = look;
    if (this.avatarNodes.length === 0) {
      this.avatarNodes = addPortrait(this.scene, state.child, stage.id, AVATAR.x, AVATAR.y, AVATAR.r, 6);
    } else {
      swapPortrait(this.scene, this.avatarNodes[1], state.child, stage.id, AVATAR.x, AVATAR.y, AVATAR.r);
    }
    this.hasArt = Boolean(childArtKey(this.scene, state.child, stage.id));
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    const h = state.household;
    const stress = state.child.stats.stress;
    this.refreshAvatar(state, stage);
    this.avatarFace.setText(this.hasArt ? '' : faceFor(state.child.stats, stage));
    this.nameText.setText(state.child.name);
    this.stageText.setText(`${stage.grade} · ${stage.age} 岁 · 第 ${state.round}/${stage.rounds} 回合`);
    this.setValue(this.insightText, 'insight', `悟性 ${h.insight}/${h.insightMax}`, h.insight);
    this.setValue(this.energyText, 'energy', `精力 ${h.energy}/${h.energyMax}`, h.energy);
    this.setValue(this.moneyText, 'money', `积蓄 ${h.money}`, h.money);
    const satColor = h.satisfaction >= 80 ? 0x5fb35a : h.satisfaction <= 25 ? 0x8b8f9a : 0xf0b43c;
    this.setMeter(this.sat, 'sat', h.satisfaction, SAT_MAX, satColor);
    const stressColor = stress >= 70 ? 0xc0392b : stress <= 30 ? 0x4aa39a : 0xe08a3c;
    this.setMeter(this.stress, 'stress', stress, 100, stressColor);
    this.pauseButton.setVisible(!state.endingId);
  }
}
