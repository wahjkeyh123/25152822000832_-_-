/**
 * 文件：src/ui/RoundBanner.js
 * 作用：顶栏下面正中间的回合横幅，和下面一排「状态」小牌子。
 * 鼠标放到状态牌上，会显示这个状态具体做了什么。
 */

import { inkText } from '../config/constants.js';
import { getStatus } from '../data/statuses.js';
import { getStage, roundsLeft } from '../data/stages.js';
import { WOOD } from './theme/frame.js';

const Y = 116;
const CHIP_Y = 150;

export default class RoundBanner {
  constructor(scene) {
    this.scene = scene;
    this.chips = [];
    this.chipKey = '';
    const g = scene.add.graphics().setDepth(5);
    const w = 380;
    const x = 640 - w / 2;
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(x + 3, Y - 15, w, 34, 17);
    g.fillStyle(WOOD.dark, 0.95);
    g.fillRoundedRect(x, Y - 18, w, 34, 17);
    g.lineStyle(2, 0xf3d48a, 0.9);
    g.strokeRoundedRect(x + 3, Y - 15, w - 6, 28, 14);
    this.text = scene.add.text(640, Y - 1, '', inkText(17, '#fff6e6', { fontStyle: 'bold' })).setOrigin(0.5).setDepth(6);
    this.tip = scene.add.text(640, CHIP_Y + 26, '', inkText(14, '#fff6e6', {
      backgroundColor: '#3b2616',
      padding: { x: 10, y: 6 },
      align: 'center',
    })).setOrigin(0.5, 0).setDepth(60).setVisible(false);
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    const left = roundsLeft(state.yearIndex, state.round);
    const tail = left <= 0 ? '这一回合结束就高考' : `距离高考还有 ${left} 回合`;
    const line = `${stage.grade} · 第 ${state.round}/${stage.rounds} 回合 · ${tail}`;
    const key = `${state.yearIndex}-${state.round}`;
    this.text.setText(line);
    if (this.lastKey && this.lastKey !== key) {
      this.text.setScale(1.25);
      this.scene.tweens.add({ targets: this.text, scale: 1, duration: 320, ease: 'Back.easeOut' });
    }
    this.lastKey = key;
    this.refreshChips(state);
  }

  refreshChips(state) {
    const list = (state.statuses || []).filter((entry) => getStatus(entry.id));
    const key = list.map((entry) => `${entry.id}:${entry.rounds}`).join('|');
    if (key === this.chipKey) return;
    this.chipKey = key;
    this.chips.forEach((node) => node.destroy());
    this.chips = [];
    this.tip.setVisible(false);
    if (list.length === 0) return;

    const widths = list.map((entry) => 40 + getStatus(entry.id).label.length * 16 + 52);
    const total = widths.reduce((sum, w) => sum + w, 0) + (list.length - 1) * 10;
    let x = 640 - total / 2;
    list.forEach((entry, index) => {
      const status = getStatus(entry.id);
      const w = widths[index];
      const good = status.kind === 'good';
      const bg = this.scene.add.rectangle(x + w / 2, CHIP_Y, w, 28, good ? 0x3f8f4f : 0xa33b32)
        .setStrokeStyle(2, good ? 0xbfe6b0 : 0xf2b3a8, 1)
        .setDepth(6)
        .setInteractive({ useHandCursor: true });
      const label = this.scene.add.text(x + w / 2, CHIP_Y, `${good ? '☀' : '☁'} ${status.label} · ${entry.rounds} 回合`, inkText(14, '#fff8ee', { fontStyle: 'bold' }))
        .setOrigin(0.5).setDepth(7);
      bg.on('pointerover', () => {
        this.tip.setText(status.desc);
        this.tip.setVisible(true);
      });
      bg.on('pointerout', () => this.tip.setVisible(false));
      this.chips.push(bg, label);
      bg.setScale(0.6);
      this.scene.tweens.add({ targets: bg, scale: 1, duration: 260, ease: 'Back.easeOut' });
      x += w + 10;
    });
  }
}
