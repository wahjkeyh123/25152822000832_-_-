/**
 * 文件：src/ui/ExpectBox.js
 * 作用：左下角的「当前期望」。显示这一期的小目标、进度和奖励。
 * 只读状态，奖励在 systems/ExpectSystem.js 里发。
 */

import { inkText } from '../config/constants.js';
import { expectProgress } from '../systems/ExpectSystem.js';
import { WOOD } from './theme/frame.js';

const BAR_W = 246;

export default class ExpectBox {
  constructor(scene) {
    this.scene = scene;
    const x = 16;
    const y = 594;
    const w = 278;
    const h = 92;
    const g = scene.add.graphics().setDepth(4);
    g.fillStyle(0x000000, 0.2);
    g.fillRoundedRect(x + 4, y + 6, w, h, 12);
    g.fillStyle(WOOD.dark, 0.94);
    g.fillRoundedRect(x, y, w, h, 12);
    g.lineStyle(2, 0xa8754a, 1);
    g.strokeRoundedRect(x + 4, y + 4, w - 8, h - 8, 10);
    scene.add.text(x + 16, y + 16, '当前期望：', inkText(16, '#f3d48a', { fontStyle: 'bold' })).setOrigin(0, 0.5).setDepth(5);
    this.title = scene.add.text(x + 16, y + 39, '', inkText(15, '#fff6e6')).setOrigin(0, 0.5).setDepth(5);
    this.barBg = scene.add.rectangle(x + 16, y + 58, BAR_W, 8, 0x2e1d12).setOrigin(0, 0.5).setDepth(5);
    this.bar = scene.add.rectangle(x + 16, y + 58, 0, 8, 0xe2b325).setOrigin(0, 0.5).setDepth(5);
    this.reward = scene.add.text(x + 16, y + 76, '', inkText(13, '#d9c4a4')).setOrigin(0, 0.5).setDepth(5);
  }

  refresh(state) {
    const progress = expectProgress(state);
    if (!progress) {
      this.title.setText('这一期没有期望');
      this.reward.setText('');
      this.bar.width = 0;
      return;
    }
    this.title.setText(`${progress.title}… ${progress.label} ${Math.min(progress.value, progress.target)}/${progress.target}`);
    const status = progress.done ? '已领取' : progress.reached ? '达到了，时期结束时领取' : '时期结束时检查';
    this.reward.setText(`奖励 ${progress.reward} · ${status}`);
    const ratio = Math.min(1, progress.value / Math.max(1, progress.target));
    this.bar.width = BAR_W * ratio;
    this.bar.setFillStyle(progress.reached ? 0x6fbf73 : 0xe2b325);
  }
}
