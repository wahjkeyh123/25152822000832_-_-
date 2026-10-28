/**
 * 文件：src/ui/ShopPanel.js
 * 作用：书店。用积蓄买职业书，买到后右侧「职业」标签页出现两项专属技能。
 * 志向方向的书打八折，价钱旁边会标出来。
 */

import { COLORS, inkText } from '../config/constants.js';
import { SHEET_LABEL } from '../data/attributes.js';
import { BOOKS } from '../data/books.js';
import { getCareer } from '../data/careers.js';
import { getCareerSkills } from '../data/skills.js';
import { bookPrice } from '../systems/SheetSystem.js';
import BasePanel from './BasePanel.js';
import TextButton from './components/TextButton.js';
import { drawCard } from './theme/frame.js';

export default class ShopPanel extends BasePanel {
  constructor(scene, state, onBuy, onClose) {
    super(scene, { title: '书店', width: 1000, height: 640 });
    this.items = [];
    this.money = this.track(scene.add.text(this.centerX, this.top + 82, '', inkText(18, COLORS.ink)).setOrigin(0.5), 5);
    this.note = this.track(scene.add.text(this.centerX, this.top + 106, '', inkText(14, COLORS.muted)).setOrigin(0.5), 5);

    BOOKS.forEach((book, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = this.left + 40 + col * 470;
      const y = this.top + 128 + row * 108;
      const career = getCareer(book.career);
      const g = scene.add.graphics();
      drawCard(g, x, y, 450, 96, 12);
      this.track(g, 4);
      this.drawCover(x + 14, y + 12, career);
      this.track(scene.add.text(x + 74, y + 18, book.name, inkText(18)).setOrigin(0, 0), 5);
      const needs = Object.keys(career.needs).map((key) => SHEET_LABEL[key]).join('、');
      const skills = getCareerSkills(career.id).map((skill) => skill.name).join('、');
      this.track(scene.add.text(x + 74, y + 46, `${career.name} · 看重${needs}`, inkText(13, '#8a5a36')).setOrigin(0, 0), 5);
      this.track(scene.add.text(x + 74, y + 66, `解锁：${skills}`, inkText(12, COLORS.muted)).setOrigin(0, 0), 5);
      const button = new TextButton(scene, x + 392, y + 48, 96, 52, '', () => {
        if (!this.canClick()) return;
        onBuy(book.id);
      }, { fontSize: 16, depth: 206, color: 0x3f8f4f, hoverColor: 0x337a41 });
      this.objects.push(...button.nodes());
      this.items.push({ book, button });
    });

    const close = new TextButton(scene, this.centerX, this.top + this.height - 40, 200, 48, '返回', () => {
      if (!this.canClick()) return;
      scene.time.delayedCall(0, () => onClose());
    }, { fontSize: 18, depth: 206, color: 0x4a3424, hoverColor: 0x6b4b30 });
    this.objects.push(...close.nodes());
    this.refresh(state);
  }

  /** 一本书的小封面：职业颜色的书脊 + 职业名的第一个字。 */
  drawCover(x, y, career) {
    const tint = {
      science: 0x3d6ea8, arts: 0xd36b8c, stage: 0x2f7d57, people: 0xc47b2a,
    }[career.direction] || 0x8a5a36;
    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(x + 3, y + 4, 46, 70, 4);
    g.fillStyle(tint, 1);
    g.fillRoundedRect(x, y, 46, 70, 4);
    g.fillStyle(0xffffff, 0.22);
    g.fillRect(x + 6, y, 4, 70);
    this.track(g, 4);
    this.track(this.scene.add.text(x + 26, y + 35, career.name.slice(0, 1), inkText(24, '#fff8ee')).setOrigin(0.5), 5);
  }

  refresh(state, message = '') {
    this.money.setText(`积蓄 ${state.household.money}`);
    this.note.setText(message || '买书花积蓄，学书里的技能还要花悟性。志向方向的书打八折。');
    this.note.setColor(message ? '#a33b32' : COLORS.muted);
    this.items.forEach(({ book, button }) => {
      const owned = state.books.includes(book.id);
      const price = bookPrice(state, book);
      const sale = price < book.price ? '\n八折' : '';
      button.setLabel(owned ? '已买' : `${price} 元${sale}`);
      button.setEnabled(!owned && state.household.money >= price);
    });
  }
}
