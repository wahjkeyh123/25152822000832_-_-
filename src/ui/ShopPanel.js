/**
 * 文件：src/ui/ShopPanel.js
 * 作用：商店，初中才开门。上面一排是四个道具，买了立刻用；下面是八本职业书。
 * 道具每样每回合限买一次。书买到后，右侧「职业」标签页出现两项专属技能，志向方向的书打八折。
 */

import { COLORS, STAT_LABEL, inkText } from '../config/constants.js';
import { SHEET_LABEL } from '../data/attributes.js';
import { BOOKS } from '../data/books.js';
import { getCareer } from '../data/careers.js';
import { ITEMS } from '../data/items.js';
import { getCareerSkills } from '../data/skills.js';
import { bookPrice } from '../systems/SheetSystem.js';
import BasePanel from './BasePanel.js';
import TextButton from './components/TextButton.js';
import { drawCard } from './theme/frame.js';

const ITEM_TINT = { console: 0x3d6ea8, park: 0xd36b8c, workbook: 0xc47b2a, frame: 0xb8862b };

/** 道具效果写成一行：压力-15  心情+6  满意度-3。 */
export function itemEffectLine(item) {
  const parts = [];
  Object.entries(item.core || {}).forEach(([key, value]) => parts.push(`${STAT_LABEL[key] || key}${value > 0 ? '+' : ''}${value}`));
  Object.entries(item.sheet || {}).forEach(([key, value]) => parts.push(`${SHEET_LABEL[key]}+${value}`));
  if (item.sat) parts.push(`满意度${item.sat > 0 ? '+' : ''}${item.sat}`);
  return parts.join('  ');
}

export default class ShopPanel extends BasePanel {
  constructor(scene, state, { onBuyBook, onBuyItem, onClose }) {
    super(scene, { title: '商店', width: 1100, height: 680 });
    this.books = [];
    this.goods = [];
    this.money = this.track(scene.add.text(this.centerX, this.top + 78, '', inkText(20, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0.5), 5);
    this.note = this.track(scene.add.text(this.centerX, this.top + 104, '', inkText(14, COLORS.muted)).setOrigin(0.5), 5);

    this.heading(this.left + 42, this.top + 132, '道具 · 买了马上用，每样每回合限一次');
    ITEMS.forEach((item, index) => this.addItem(item, this.left + 42 + index * 257, this.top + 150, onBuyItem));

    this.heading(this.left + 42, this.top + 304, '职业书 · 买到后解锁两项职业技能');
    BOOKS.forEach((book, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      this.addBook(book, this.left + 42 + col * 512, this.top + 320 + row * 78, onBuyBook);
    });

    const close = new TextButton(scene, this.centerX, this.top + this.height - 26, 200, 40, '返回', () => {
      if (!this.canClick()) return;
      scene.time.delayedCall(0, () => onClose());
    }, { fontSize: 18, depth: 206, color: 0x4a3424, hoverColor: 0x6b4b30 });
    this.objects.push(...close.nodes());
    this.refresh(state);
  }

  heading(x, y, text) {
    const g = this.scene.add.graphics();
    g.fillStyle(0xc45c26, 1);
    g.fillRoundedRect(x, y - 11, 6, 22, 3);
    this.track(g, 4);
    this.track(this.scene.add.text(x + 16, y, text, inkText(16, '#6b4b30', { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
  }

  addItem(item, x, y, onBuy) {
    const scene = this.scene;
    const w = 245;
    const h = 136;
    const g = scene.add.graphics();
    drawCard(g, x, y, w, h, 14);
    g.fillStyle(item.kind === 'fun' ? 0xe5f2e4 : 0xfbeedd, 1);
    g.fillRoundedRect(x + 4, y + 4, w - 8, 26, { tl: 12, tr: 12, bl: 0, br: 0 });
    this.track(g, 4);
    this.track(scene.add.text(x + 14, y + 17, item.kind === 'fun' ? '给孩子减压' : '让父母满意', inkText(12, item.kind === 'fun' ? '#2f7d57' : '#a35a1f', { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    this.drawItemIcon(item, x + 40, y + 66);
    this.track(scene.add.text(x + 76, y + 46, item.name, inkText(17, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    this.track(scene.add.text(x + 76, y + 66, itemEffectLine(item), inkText(12, '#8a5a36')).setOrigin(0, 0.5), 5);
    this.track(scene.add.text(x + 76, y + 78, item.detail, inkText(11, COLORS.muted, {
      wordWrap: { width: w - 86, useAdvancedWrap: true },
    })).setOrigin(0, 0), 5);
    const button = new TextButton(scene, x + w / 2, y + h - 18, w - 28, 28, '', () => {
      if (!this.canClick()) return;
      onBuy(item.id);
    }, { fontSize: 14, depth: 206, color: 0x3f8f4f, hoverColor: 0x337a41 });
    this.objects.push(...button.nodes());
    this.goods.push({ item, button });
  }

  /** 四个道具的小图标，用几何形状画，不用额外图片。 */
  drawItemIcon(item, cx, cy) {
    const g = this.scene.add.graphics();
    const tint = ITEM_TINT[item.id] || 0x8a5a36;
    g.fillStyle(0x000000, 0.15);
    g.fillCircle(cx + 2, cy + 3, 26);
    g.fillStyle(0xfff8ee, 1);
    g.fillCircle(cx, cy, 26);
    g.lineStyle(3, tint, 1);
    g.strokeCircle(cx, cy, 26);
    g.fillStyle(tint, 1);
    if (item.id === 'console') {
      g.fillRoundedRect(cx - 17, cy - 11, 34, 22, 6);
      g.fillStyle(0xcfe6ff, 1);
      g.fillRect(cx - 7, cy - 7, 14, 12);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx - 12, cy, 2.5);
      g.fillCircle(cx + 12, cy, 2.5);
    } else if (item.id === 'park') {
      g.fillTriangle(cx - 16, cy + 14, cx, cy - 16, cx + 16, cy + 14);
      g.fillStyle(0xf3cf5c, 1);
      g.fillCircle(cx, cy - 16, 4);
      g.fillStyle(0xffffff, 1);
      g.fillRect(cx - 4, cy + 4, 8, 10);
    } else if (item.id === 'workbook') {
      g.fillRoundedRect(cx - 13, cy - 16, 26, 32, 3);
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(cx - 8, cy - 9, 16, 3);
      g.fillRect(cx - 8, cy - 3, 16, 3);
      g.fillRect(cx - 8, cy + 3, 10, 3);
    } else {
      g.fillRect(cx - 16, cy - 13, 32, 26);
      g.fillStyle(0xfff8ee, 1);
      g.fillRect(cx - 11, cy - 8, 22, 16);
      g.fillStyle(0xd0563b, 1);
      g.fillCircle(cx, cy, 5);
    }
    this.track(g, 5);
  }

  addBook(book, x, y, onBuy) {
    const scene = this.scene;
    const career = getCareer(book.career);
    const g = scene.add.graphics();
    drawCard(g, x, y, 500, 70, 12);
    this.track(g, 4);
    this.drawCover(x + 12, y + 8, career);
    this.track(scene.add.text(x + 62, y + 14, book.name, inkText(16, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0, 0), 5);
    const needs = Object.keys(career.needs).map((key) => SHEET_LABEL[key]).join('、');
    const skills = getCareerSkills(career.id).map((skill) => skill.name).join('、');
    this.track(scene.add.text(x + 62, y + 38, `${career.name} · 看重${needs}`, inkText(12, '#8a5a36')).setOrigin(0, 0), 5);
    this.track(scene.add.text(x + 62, y + 54, `解锁：${skills}`, inkText(11, COLORS.muted)).setOrigin(0, 0), 5);
    const button = new TextButton(scene, x + 448, y + 36, 88, 46, '', () => {
      if (!this.canClick()) return;
      onBuy(book.id);
    }, { fontSize: 14, depth: 206, color: 0x3f8f4f, hoverColor: 0x337a41 });
    this.objects.push(...button.nodes());
    this.books.push({ book, button });
  }

  /** 一本书的小封面：职业颜色的书脊 + 职业名的第一个字。 */
  drawCover(x, y, career) {
    const tint = {
      science: 0x3d6ea8, arts: 0xd36b8c, stage: 0x2f7d57, people: 0xc47b2a,
    }[career.direction] || 0x8a5a36;
    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(x + 3, y + 3, 38, 54, 4);
    g.fillStyle(tint, 1);
    g.fillRoundedRect(x, y, 38, 54, 4);
    g.fillStyle(0xffffff, 0.22);
    g.fillRect(x + 5, y, 3, 54);
    this.track(g, 4);
    this.track(this.scene.add.text(x + 21, y + 27, career.name.slice(0, 1), inkText(20, '#fff8ee')).setOrigin(0.5), 5);
  }

  refresh(state, message = '') {
    const money = state.household.money;
    this.money.setText(`积蓄 ${money}　　父母满意度 ${state.household.satisfaction}　　压力 ${state.child.stats.stress}`);
    this.note.setText(message || '花的是积蓄。学书里的技能还要花悟性，志向方向的书打八折。');
    this.note.setColor(message ? '#a33b32' : COLORS.muted);
    this.goods.forEach(({ item, button }) => {
      const used = state.itemsThisRound.includes(item.id);
      button.setLabel(used ? '本回合已用' : `买 · ${item.price} 元`);
      button.setEnabled(!used && money >= item.price);
    });
    this.books.forEach(({ book, button }) => {
      const owned = state.books.includes(book.id);
      const price = bookPrice(state, book);
      const sale = price < book.price ? ' 八折' : '';
      button.setLabel(owned ? '已买' : `${price} 元${sale}`);
      button.setEnabled(!owned && money >= price);
    });
  }
}
