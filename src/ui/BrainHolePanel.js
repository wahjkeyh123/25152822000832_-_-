/**
 * 文件：src/ui/BrainHolePanel.js
 * 作用：8 列 9 行的脑洞图。点一格花 5 点精力。
 * 这一轮的排列存在存档里，关掉再打开不会重排。
 * 孩子压力到 60 以后会混进灰色乌云格，挖到只扣精力不加东西。
 */

import { COLORS, HOLE_ENERGY_COST, inkText } from '../config/constants.js';
import { attributeByKey } from '../data/attributes.js';
import { paintIcon } from './paintIcon.js';
import BasePanel from './BasePanel.js';
import TextButton from './components/TextButton.js';

const COLS = 8;
const ROWS = 9;
const CELL = 52;
const GAP = 6;

export default class BrainHolePanel extends BasePanel {
  constructor(scene, state, onDig, onClose) {
    super(scene, { title: '脑洞闯关', width: 1040, height: 680 });
    this.scene = scene;
    this.onDig = onDig;
    this.cells = [];
    this.hint = scene.add.text(this.centerX, this.top + 68, '', inkText(16, COLORS.muted)).setOrigin(0.5).setDepth(205);
    this.objects.push(this.hint);

    const gridW = COLS * CELL + (COLS - 1) * GAP;
    const originX = this.centerX - gridW / 2 + CELL / 2;
    const originY = this.top + 108;

    state.board.forEach((key, index) => {
      const col = index % COLS;
      const row = Math.floor(index / COLS);
      const x = originX + col * (CELL + GAP);
      const y = originY + row * (CELL + GAP);
      const attr = attributeByKey(key);
      const icon = paintIcon(scene, attr, x, y, 36, 206);
      const hit = scene.add.rectangle(x, y, CELL, CELL, 0xffffff, 0.001).setDepth(208);
      hit.on('pointerup', (pointer, localX, localY, event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        if (!this.canClick()) return;
        onDig(index);
      });
      this.objects.push(icon, hit);
      this.cells.push({ icon, hit });
    });

    if (state.board.length !== COLS * ROWS) {
      this.hint.setText('脑洞图还没排好。');
    }

    const close = new TextButton(scene, this.centerX, this.top + this.height - 36, 200, 44, '返回', () => {
      if (!this.canClick()) return;
      scene.time.delayedCall(0, () => onClose());
    }, { fontSize: 18, depth: 208, color: 0x4a3424, hoverColor: 0x6b4b30 });
    this.objects.push(...close.nodes());
    this.refresh(state);
  }

  refresh(state, message = '') {
    const enough = state.household.energy >= HOLE_ENERGY_COST;
    const clouds = state.board.filter((key, index) => key === 'cloud' && !state.dug.includes(index)).length;
    const cloudText = clouds > 0 ? ` · 压力太大，有 ${clouds} 朵乌云（白花精力）` : '';
    this.hint.setText(message || `精力 ${state.household.energy}/${state.household.energyMax} · 每格 ${HOLE_ENERGY_COST} 点 · 悟性格 +5${cloudText}`);
    this.hint.setColor(enough && !message ? COLORS.muted : '#a33b32');
    this.cells.forEach((cell, index) => {
      const dug = state.dug.includes(index);
      cell.icon.setAlpha(dug ? 0.25 : 1);
      cell.hit.disableInteractive();
      if (!dug) cell.hit.setInteractive({ useHandCursor: true });
    });
  }
}
