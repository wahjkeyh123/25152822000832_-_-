/**
 * 文件：src/ui/ExpectBox.js
 * 作用：左下角的「当前期望」。显示这一期的小目标、进度和奖励。
 * 达到目标后可以点，领一笔额外奖励。期末那次结算仍在 ExpectSystem.settleExpect。
 */

import { inkText } from '../config/constants.js';
import { expectProgress } from '../systems/ExpectSystem.js';
import { WOOD } from './theme/frame.js';

const BAR_W = 246;

export default class ExpectBox {
  constructor(scene, onClaim) {
    this.scene = scene;
    this.onClaim = onClaim;
    const x = 16;
    const y = 594;
    const w = 278;
    const h = 92;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    const g = scene.add.graphics().setDepth(4);
    g.fillStyle(0x000000, 0.2);
    g.fillRoundedRect(x + 4, y + 6, w, h, 12);
    g.fillStyle(WOOD.dark, 0.94);
    g.fillRoundedRect(x, y, w, h, 12);
    g.lineStyle(2, 0xa8754a, 1);
    g.strokeRoundedRect(x + 4, y + 4, w - 8, h - 8, 10);
    this.frame = g;
    scene.add.text(x + 16, y + 16, '当前期望：', inkText(16, '#f3d48a', { fontStyle: 'bold' })).setOrigin(0, 0.5).setDepth(5);
    this.title = scene.add.text(x + 16, y + 39, '', inkText(15, '#fff6e6')).setOrigin(0, 0.5).setDepth(5);
    this.barBg = scene.add.rectangle(x + 16, y + 58, BAR_W, 8, 0x2e1d12).setOrigin(0, 0.5).setDepth(5);
    this.bar = scene.add.rectangle(x + 16, y + 58, 0, 8, 0xe2b325).setOrigin(0, 0.5).setDepth(5);
    this.reward = scene.add.text(x + 16, y + 76, '', inkText(13, '#d9c4a4')).setOrigin(0, 0.5).setDepth(5);
    this.hit = scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0.001).setDepth(6);
    this.hit.on('pointerup', (pointer, hx, hy, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      onClaim?.();
    });
  }

  refresh(state) {
    const progress = expectProgress(state);
    if (!progress) {
      this.title.setText('这一期没有期望');
      this.reward.setText('');
      this.bar.width = 0;
      this.hit.disableInteractive();
      return;
    }
    this.title.setText(`${progress.title}… ${progress.label} ${Math.min(progress.value, progress.target)}/${progress.target}`);
    let status = `还剩 ${progress.roundsLeft} 回合检查`;
    if (progress.roundsLeft <= 0) status = '本回合结束检查';
    if (progress.reached) status = progress.bonusClaimed ? '额外奖励已领' : '已达到 · 点这里领额外奖励';
    if (progress.done && !progress.reached) status = '已结算';
    this.reward.setText(`${progress.reward} · ${status}`);
    const ratio = Math.min(1, progress.value / Math.max(1, progress.target));
    this.bar.width = BAR_W * ratio;
    this.bar.setFillStyle(progress.reached ? 0x6fbf73 : 0xe2b325);
    if (progress.reached && !progress.bonusClaimed) {
      this.hit.setInteractive({ useHandCursor: true });
    } else {
      this.hit.disableInteractive();
    }
  }
}
