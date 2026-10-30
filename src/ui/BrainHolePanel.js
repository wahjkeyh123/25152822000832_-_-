/**
 * 文件：src/ui/BrainHolePanel.js
 * 作用：点孩子之后看到的脑洞。10 列 10 行，开局只亮中间 4×4。
 * 点开一格，周围 3×3 跟着亮。精力没了就不能再点。下一页是图上的一格，最多两次。
 */

import { BOARD_COLS, BOARD_ROWS, COLORS, DIG_GAIN_MAX, DIG_GAIN_MIN, ENERGY_MAX, HOLE_ENERGY_COST, inkText } from '../config/constants.js';
import { BOARD_ATTRIBUTES, FLIP_ICON, INSIGHT_ICON, attributeByKey } from '../data/attributes.js';
import { BRAIN_SKIP_MAX, isRevealed } from '../data/board.js';
import { pulse } from '../effects/Motion.js';
import { paintIcon } from './paintIcon.js';
import BasePanel from './BasePanel.js';
import TextButton from './components/TextButton.js';
import { shade } from './theme/frame.js';

const COLS = BOARD_COLS;
const ROWS = BOARD_ROWS;
const CELL = 52;
const GAP = 3;

const LEGEND = [
  ...BOARD_ATTRIBUTES,
  INSIGHT_ICON,
  FLIP_ICON,
];

export default class BrainHolePanel extends BasePanel {
  constructor(scene, state, { onDig, onClose }) {
    super(scene, { title: '孩子的脑洞', width: 1188, height: 704 });
    this.scene = scene;
    this.onDig = onDig;
    this.cells = [];
    this.hoverIndex = -1;

    this.paintMind();
    this.paintEnergy();
    this.paintLegend();
    this.paintGrid(state);

    this.tip = this.track(scene.add.text(this.board.cx, this.board.bottom + 16, '', inkText(15, '#f3d48a')).setOrigin(0.5), 7);
    this.note = this.track(scene.add.text(this.left + 148, this.top + this.height - 108, '', inkText(14, COLORS.muted, {
      wordWrap: { width: 250, useAdvancedWrap: true },
    })).setOrigin(0.5, 0), 7);

    const close = new TextButton(scene, this.left + this.width - 118, this.top + this.height - 34, 160, 44, '返回', () => {
      if (!this.canClick()) return;
      scene.time.delayedCall(0, () => onClose());
    }, { fontSize: 18, depth: 208, color: 0x4a3424, hoverColor: 0x6b4b30 });
    this.objects.push(...close.nodes());
    this.refresh(state);
  }

  paintMind() {
    const x = this.left + 276;
    const y = this.top + 56;
    const w = 880;
    const h = 580;
    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.2);
    g.fillRoundedRect(x + 8, y + 10, w, h, 28);
    g.fillStyle(0x5a3a28, 1);
    g.fillRoundedRect(x, y, w, h, 28);
    g.fillStyle(0x241610, 1);
    g.fillRoundedRect(x + 12, y + 12, w - 24, h - 24, 20);
    g.fillStyle(0xf3d48a, 0.07);
    g.fillCircle(x + w / 2, y + h / 2, 210);
    g.fillStyle(0xf6ead4, 0.05);
    for (let i = 0; i < 18; i += 1) {
      g.fillCircle(x + 48 + (i % 6) * 128, y + 40 + Math.floor(i / 6) * 160, 3);
    }
    g.lineStyle(3, 0xe2b656, 0.55);
    g.strokeRoundedRect(x + 12, y + 12, w - 24, h - 24, 20);
    g.lineStyle(2, 0xc45c26, 0.35);
    g.strokeRoundedRect(x + 6, y + 6, w - 12, h - 12, 26);
    this.track(g, 4);
    this.board = { x, y, w, h, cx: x + w / 2, bottom: y + h };
  }

  paintEnergy() {
    const x = this.left + 36;
    const y = this.top + 78;
    const g = this.scene.add.graphics();
    g.fillStyle(0xfff8ee, 1);
    g.fillRoundedRect(x, y, 236, 118, 16);
    g.lineStyle(2, 0xe2d2bc, 1);
    g.strokeRoundedRect(x, y, 236, 118, 16);
    g.fillStyle(0x3b2616, 0.82);
    g.fillRoundedRect(x + 16, y + 54, 204, 18, 9);
    this.track(g, 4);
    this.track(this.scene.add.text(x + 18, y + 24, '精力', inkText(16, '#5a4a3a', { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    this.energyValue = this.track(this.scene.add.text(x + 218, y + 24, '', inkText(16)).setOrigin(1, 0.5), 5);
    this.energyFill = this.track(this.scene.add.rectangle(x + 18, y + 63, 0, 12, 0xe2b325).setOrigin(0, 0.5), 6);
    this.leftCount = this.track(this.scene.add.text(x + 18, y + 94, '', inkText(13, COLORS.muted)).setOrigin(0, 0.5), 5);
  }

  paintLegend() {
    const x = this.left + 36;
    let y = this.top + 214;
    const card = this.scene.add.graphics();
    card.fillStyle(0xfff8ee, 0.94);
    card.fillRoundedRect(x, y, 236, 370, 16);
    card.lineStyle(2, 0xe2d2bc, 1);
    card.strokeRoundedRect(x, y, 236, 370, 16);
    this.track(card, 4);
    this.track(this.scene.add.text(x + 16, y + 22, '格子上的颜色', inkText(15, '#6b4b30', { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    y += 48;
    LEGEND.forEach((item) => {
      const tile = this.scene.add.graphics();
      tile.setPosition(x + 28, y);
      drawTile(tile, 26, item.color);
      this.track(tile, 5);
      this.track(paintIcon(this.scene, item, x + 28, y, 16, 206), 6);
      this.track(this.scene.add.text(x + 50, y, item.label, inkText(14, COLORS.ink)).setOrigin(0, 0.5), 5);
      y += 30;
    });
    this.track(this.scene.add.text(x + 16, y + 8, `开局只亮中间 4×4。\n点开一格，周围 3×3 跟着亮。\n精力没了就不能再点。\n点哪加哪，+${DIG_GAIN_MIN}~${DIG_GAIN_MAX}，悟性 +5。\n「下一页」在图里，最多 ${BRAIN_SKIP_MAX} 次。`, inkText(13, COLORS.muted, {
      lineSpacing: 4,
    })).setOrigin(0, 0), 5);
  }

  paintGrid(state) {
    const gridW = COLS * CELL + (COLS - 1) * GAP;
    const gridH = ROWS * CELL + (ROWS - 1) * GAP;
    const originX = this.board.x + (this.board.w - gridW) / 2 + CELL / 2;
    const originY = this.board.y + (this.board.h - gridH) / 2 + CELL / 2;
    this.originX = originX;
    this.originY = originY;

    state.board.forEach((key, index) => {
      const col = index % COLS;
      const row = Math.floor(index / COLS);
      const x = originX + col * (CELL + GAP);
      const y = originY + row * (CELL + GAP);
      const attr = attributeByKey(key);
      const tile = this.scene.add.graphics();
      drawTile(tile, CELL, attr.color);
      const icon = paintIcon(this.scene, attr, 0, 0, 30, 1);
      const fog = this.scene.add.graphics();
      drawFog(fog, CELL);
      const dug = this.scene.add.graphics().setAlpha(0);
      drawHole(dug, CELL);
      const hit = this.scene.add.rectangle(0, 0, CELL, CELL, 0xffffff, 0.001);
      const box = this.scene.add.container(x, y, [tile, icon, fog, dug, hit]);
      hit.on('pointerup', (pointer, localX, localY, event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        if (!this.canClick()) return;
        this.onDig(index);
      });
      hit.on('pointerover', () => this.hover(index, true));
      hit.on('pointerout', () => this.hover(index, false));
      this.track(box, 6);
      this.cells.push({
        key, x, y, box, tile, icon, fog, dug, hit, attr, opened: false, shown: false,
      });
    });
  }

  clearGrid() {
    this.cells.forEach((cell) => cell.box.destroy());
    this.objects = this.objects.filter((obj) => !this.cells.some((cell) => cell.box === obj));
    this.cells = [];
  }

  rebuild(state) {
    this.clearGrid();
    this.paintGrid(state);
    this.refresh(state);
  }

  cellAt(index) {
    const cell = this.cells[index];
    return cell ? { x: cell.x, y: cell.y } : null;
  }

  hover(index, on) {
    const cell = this.cells[index];
    if (!cell || cell.opened || !cell.shown) {
      if (!on) this.tip.setText(this.idleTip);
      return;
    }
    this.hoverIndex = on ? index : -1;
    this.scene.tweens.killTweensOf(cell.box);
    this.scene.tweens.add({ targets: cell.box, scale: on ? 1.12 : 1, duration: 140, ease: 'Back.easeOut' });
    if (on) this.tip.setText(tipFor(cell.key, cell.attr));
    else this.tip.setText(this.idleTip);
  }

  refresh(state, message = '') {
    const used = state.digsThisRound ?? state.dug.length;
    const enough = state.household.energy >= HOLE_ENERGY_COST;
    const max = state.household.energyMax || ENERGY_MAX;
    const energy = state.household.energy;
    this.energyValue.setText(`${energy}/${max}`);
    this.energyFill.width = Math.round(200 * Math.min(1, energy / max));
    this.energyFill.setFillStyle(energy <= 5 ? 0xd0563b : 0xe2b325);
    this.leftCount.setText(`本回合已挖 ${used} 次`);
    this.idleTip = '先点中间亮着的格子。精力没了就不能再点。';
    const hover = this.cells[this.hoverIndex];
    this.tip.setText(this.hoverIndex >= 0 && hover?.shown && !hover.opened
      ? tipFor(hover.key, hover.attr)
      : this.idleTip);
    const note = enough ? '' : '精力不够了，结束回合会回复。';
    this.note.setText(message || note);
    this.note.setColor(message || note ? '#a33b32' : COLORS.muted);

    this.cells.forEach((cell, index) => {
      const opened = state.dug.includes(index);
      const shown = isRevealed(state, index);
      const just = opened && !cell.opened;
      cell.opened = opened;
      cell.shown = shown;
      const key = state.board[index];
      if (key !== cell.key) {
        cell.key = key;
        cell.attr = attributeByKey(key);
        drawTile(cell.tile, CELL, cell.attr.color);
      }
      cell.fog.setAlpha(shown ? 0 : 1);
      cell.icon.setVisible(shown && !opened);
      cell.dug.setAlpha(opened ? 1 : 0);
      cell.hit.disableInteractive();
      if (shown && !opened && enough) cell.hit.setInteractive({ useHandCursor: true });
      if (just) {
        cell.box.setScale(1);
        pulse(this.scene, cell.box);
      }
    });
  }
}

function tipFor(key, attr) {
  if (key === 'insight') return '悟性 · 挖开 +5';
  if (key === 'flip') return '下一页 · 换一张全新的脑洞，一回合最多两次';
  return `${attr.label} · 只加这一项，随机 +${DIG_GAIN_MIN}~${DIG_GAIN_MAX}`;
}

function drawTile(g, size, color) {
  const r = Math.max(8, Math.round(size * 0.24));
  const half = size / 2;
  g.clear();
  g.fillStyle(0x000000, 0.22);
  g.fillRoundedRect(-half + 2, -half + 4, size, size, r);
  g.fillStyle(shade(color, 0.48), 1);
  g.fillRoundedRect(-half, -half, size, size, r);
  g.fillStyle(shade(color, 0.82), 1);
  g.fillRoundedRect(-half + 4, -half + 4, size - 8, size * 0.46, r - 4);
  g.fillStyle(0xffffff, 0.18);
  g.fillRoundedRect(-half + 8, -half + 7, size * 0.42, 7, 4);
  g.lineStyle(2, shade(color, 1.18), 1);
  g.strokeRoundedRect(-half, -half, size, size, r);
}

function drawFog(g, size) {
  const r = Math.max(8, Math.round(size * 0.24));
  const half = size / 2;
  g.clear();
  g.fillStyle(0x3a2a22, 1);
  g.fillRoundedRect(-half, -half, size, size, r);
  g.fillStyle(0x5c4636, 0.55);
  g.fillCircle(-6, -4, 7);
  g.fillCircle(8, 2, 6);
  g.fillCircle(0, 8, 5);
  g.lineStyle(2, 0x8a6a52, 0.45);
  g.strokeRoundedRect(-half, -half, size, size, r);
}

function drawHole(g, size) {
  const r = Math.max(8, Math.round(size * 0.24));
  const half = size / 2;
  g.fillStyle(0x140e0a, 0.94);
  g.fillRoundedRect(-half, -half, size, size, r);
  g.lineStyle(2, 0x6b4b30, 0.7);
  g.strokeRoundedRect(-half + 4, -half + 4, size - 8, size - 8, r - 3);
  g.lineStyle(1, 0x000000, 0.45);
  g.lineBetween(-8, -6, 10, 8);
  g.lineBetween(-4, 10, 8, -4);
}
