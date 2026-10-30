/**
 * 文件：src/ui/ShopPanel.js
 * 作用：商店，小学才开门。上面八个道具买了立刻用；下面是职业实物道具（初中才能买）。
 * 道具每样每回合限买一次。职业道具买到后，右侧「职业」标签页出现职业技能线，志向方向打八折。
 */

import { COLORS, STAT_LABEL, inkText } from '../config/constants.js';
import { SHEET_LABEL } from '../data/attributes.js';
import { BOOKS } from '../data/books.js';
import { getCareer } from '../data/careers.js';
import { ITEMS } from '../data/items.js';
import { bookOpen, bookPrice } from '../systems/SheetSystem.js';
import BasePanel from './BasePanel.js';
import TextButton from './components/TextButton.js';
import { drawCard } from './theme/frame.js';

const ITEM_TINT = {
  console: 0x3d6ea8, park: 0xd36b8c, workbook: 0xc47b2a, frame: 0xb8862b,
  telescope: 0x6a7c8a, paint: 0xd36b8c, football: 0x3d4a3a, musicbox: 0xa67c52,
};

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
    this.money = this.track(scene.add.text(this.centerX, this.top + 72, '', inkText(18, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0.5), 5);
    this.note = this.track(scene.add.text(this.centerX, this.top + 94, '', inkText(13, COLORS.muted)).setOrigin(0.5), 5);

    this.heading(this.left + 36, this.top + 118, '道具 · 买了马上用，每样每回合限一次');
    ITEMS.forEach((item, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      this.addItem(item, this.left + 36 + col * 258, this.top + 132 + row * 108, onBuyItem);
    });

    this.heading(this.left + 36, this.top + 356, '职业道具 · 初中起可买，买到后解锁职业技能线');
    BOOKS.forEach((book, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      this.addBook(book, this.left + 36 + col * 258, this.top + 370 + row * 112, onBuyBook);
    });

    const close = new TextButton(scene, this.centerX, this.top + this.height - 24, 200, 38, '返回', () => {
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
    this.track(this.scene.add.text(x + 16, y, text, inkText(15, '#6b4b30', { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
  }

  addItem(item, x, y, onBuy) {
    const scene = this.scene;
    const w = 248;
    const h = 100;
    const g = scene.add.graphics();
    drawCard(g, x, y, w, h, 12);
    g.fillStyle(item.kind === 'fun' ? 0xe5f2e4 : 0xfbeedd, 1);
    g.fillRoundedRect(x + 3, y + 3, w - 6, 20, { tl: 10, tr: 10, bl: 0, br: 0 });
    this.track(g, 4);
    this.track(scene.add.text(x + 12, y + 13, item.kind === 'fun' ? '给孩子减压' : '让父母满意', inkText(11, item.kind === 'fun' ? '#2f7d57' : '#a35a1f', { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    this.drawShopIcon(`shop-${item.id}`, x + 36, y + 58, 48, item);
    this.track(scene.add.text(x + 68, y + 36, item.name, inkText(15, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    this.track(scene.add.text(x + 68, y + 52, itemEffectLine(item), inkText(11, '#8a5a36')).setOrigin(0, 0.5), 5);
    const button = new TextButton(scene, x + w / 2, y + h - 16, w - 24, 24, '', () => {
      if (!this.canClick()) return;
      onBuy(item.id);
    }, { fontSize: 13, depth: 206, color: 0x3f8f4f, hoverColor: 0x337a41 });
    this.objects.push(...button.nodes());
    this.goods.push({ item, button });
  }

  drawShopIcon(key, cx, cy, size, fallbackItem) {
    if (this.scene.textures.exists(key)) {
      const img = this.scene.add.image(cx, cy, key);
      const frame = img.width / Math.max(1, img.height);
      const height = size;
      const width = Math.min(size + 8, height * frame);
      img.setDisplaySize(width, height);
      this.track(img, 5);
      return;
    }
    if (fallbackItem) this.drawItemIcon(fallbackItem, cx, cy);
  }

  /** 缺图时用几何形状顶一下。 */
  drawItemIcon(item, cx, cy) {
    const g = this.scene.add.graphics();
    const tint = ITEM_TINT[item.id] || 0x8a5a36;
    g.fillStyle(0x000000, 0.15);
    g.fillCircle(cx + 2, cy + 3, 22);
    g.fillStyle(0xfff8ee, 1);
    g.fillCircle(cx, cy, 22);
    g.lineStyle(3, tint, 1);
    g.strokeCircle(cx, cy, 22);
    g.fillStyle(tint, 1);
    g.fillRoundedRect(cx - 12, cy - 8, 24, 16, 4);
    this.track(g, 5);
  }

  addBook(book, x, y, onBuy) {
    const scene = this.scene;
    const career = getCareer(book.career);
    const w = 248;
    const h = 104;
    const g = scene.add.graphics();
    drawCard(g, x, y, w, h, 12);
    this.track(g, 4);
    if (book.icon) this.drawShopIcon(book.icon, x + 36, y + 44, 52);
    else this.drawCover(x + 12, y + 12, career);
    this.track(scene.add.text(x + 68, y + 12, book.name, inkText(14, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0, 0), 5);
    this.track(scene.add.text(x + 68, y + 34, career.name, inkText(12, '#8a5a36')).setOrigin(0, 0), 5);
    this.track(scene.add.text(x + 68, y + 50, '买到后解锁职业技能线', inkText(10, COLORS.muted, {
      wordWrap: { width: w - 80, useAdvancedWrap: true },
    })).setOrigin(0, 0), 5);
    const button = new TextButton(scene, x + w / 2, y + h - 16, w - 24, 24, '', () => {
      if (!this.canClick()) return;
      onBuy(book.id);
    }, { fontSize: 13, depth: 206, color: 0x3f8f4f, hoverColor: 0x337a41 });
    this.objects.push(...button.nodes());
    this.books.push({ book, button });
  }

  /** 没有实物图时，画职业色块和第一个字。 */
  drawCover(x, y, career) {
    const tint = {
      science: 0x3d6ea8, arts: 0xd36b8c, stage: 0x2f7d57, people: 0xc47b2a,
    }[career.direction] || 0x8a5a36;
    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(x + 3, y + 3, 40, 52, 6);
    g.fillStyle(tint, 1);
    g.fillRoundedRect(x, y, 40, 52, 6);
    this.track(g, 4);
    this.track(this.scene.add.text(x + 20, y + 26, career.name.slice(0, 1), inkText(18, '#fff8ee')).setOrigin(0.5), 5);
  }

  refresh(state, message = '') {
    const money = state.household.money;
    this.money.setText(`积蓄 ${money}　　父母满意度 ${state.household.satisfaction}　　压力 ${state.child.stats.stress}`);
    this.note.setText(message || '花的是积蓄。学技能还要花悟性，志向方向的职业道具打八折。');
    this.note.setColor(message ? '#a33b32' : COLORS.muted);
    this.goods.forEach(({ item, button }) => {
      const used = state.itemsThisRound.includes(item.id);
      button.setLabel(used ? '本回合已用' : `买 · ${item.price} 元`);
      button.setEnabled(!used && money >= item.price);
    });
    const booksReady = bookOpen(state);
    this.books.forEach(({ book, button }) => {
      const owned = state.books.includes(book.id);
      const price = bookPrice(state, book);
      const sale = price < book.price ? ' 八折' : '';
      if (!booksReady) {
        button.setLabel('初中开');
        button.setEnabled(false);
        return;
      }
      button.setLabel(owned ? '已买' : `${price} 元${sale}`);
      button.setEnabled(!owned && money >= price);
    });
  }
}
