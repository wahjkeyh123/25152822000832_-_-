/**
 * 文件：src/ui/SkillPanel.js
 * 作用：画面右侧的学习栏。点一张卡就花悟性，学会的不能再点。
 * 上面两个标签：「本期」是这个时期的技能，「职业」是买了职业书后解锁的技能。
 * 一页放 4 张卡，多了就翻页。
 */

import { COLORS, inkText } from '../config/constants.js';
import { attributeByKey } from '../data/attributes.js';
import { getBook } from '../data/books.js';
import { getCareer } from '../data/careers.js';
import { getCareerSkills, getSkillsForStage, isLearned, mainEffect } from '../data/skills.js';
import { paintIcon } from './paintIcon.js';
import { drawCard, drawTab, drawWoodFrame } from './theme/frame.js';

const PER_PAGE = 4;
const X = 990;
const Y = 94;
const W = 280;
const H = 610;
const TAB_ON = 0xc45c26;
const TAB_OFF = 0xb9a58a;

export default class SkillPanel {
  constructor(scene, onLearn) {
    this.scene = scene;
    this.onLearn = onLearn;
    this.cards = [];
    this.signature = '';
    this.tab = 'stage';
    this.page = 0;
    this.state = null;

    const g = scene.add.graphics().setDepth(4);
    drawWoodFrame(g, X, Y, W, H, { radius: 18, border: 10 });
    this.tabGfx = scene.add.graphics().setDepth(5);
    this.tabs = [
      this.makeTab('stage', '本期', X + 20),
      this.makeTab('career', '职业', X + 144),
    ];
    this.empty = scene.add.text(X + W / 2, Y + 240, '', inkText(15, COLORS.muted, {
      align: 'center',
      lineSpacing: 8,
    })).setOrigin(0.5).setDepth(6);

    this.pageText = scene.add.text(X + W / 2, Y + H - 28, '', inkText(15, COLORS.ink)).setOrigin(0.5).setDepth(6);
    this.prev = this.makeArrow(X + 60, '‹', -1);
    this.next = this.makeArrow(X + W - 60, '›', 1);
  }

  makeTab(id, label, x) {
    const text = this.scene.add.text(x + 58, Y + 34, label, inkText(17, '#fff8ee')).setOrigin(0.5).setDepth(7);
    const hit = this.scene.add.rectangle(x + 58, Y + 34, 116, 36, 0xffffff, 0.001)
      .setDepth(8)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      if (this.tab === id) return;
      this.tab = id;
      this.page = 0;
      if (this.state) this.refresh(this.state);
    });
    return { id, x, text, hit };
  }

  makeArrow(x, label, step) {
    const text = this.scene.add.text(x, Y + H - 28, label, inkText(28, '#8a5a36')).setOrigin(0.5).setDepth(7);
    const hit = this.scene.add.rectangle(x, Y + H - 28, 44, 34, 0xffffff, 0.001)
      .setDepth(8)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.page += step;
      if (this.state) this.refresh(this.state);
    });
    return { text, hit };
  }

  listFor(state) {
    if (this.tab === 'stage') return getSkillsForStage(state.yearIndex);
    return state.books.flatMap((bookId) => {
      const book = getBook(bookId);
      return book ? getCareerSkills(book.career) : [];
    });
  }

  drawTabs() {
    this.tabGfx.clear();
    this.tabs.forEach((tab) => {
      drawTab(this.tabGfx, tab.x, Y + 16, 116, 36, tab.id === this.tab ? TAB_ON : TAB_OFF);
      tab.text.setColor(tab.id === this.tab ? '#fff8ee' : '#f3ead9');
    });
  }

  refresh(state) {
    this.state = state;
    this.drawTabs();
    const list = this.listFor(state);
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    this.page = Math.max(0, Math.min(this.page, pages - 1));
    const shown = list.slice(this.page * PER_PAGE, this.page * PER_PAGE + PER_PAGE);
    const signature = `${this.tab}|${this.page}|${shown.map((skill) => skill.id).join(',')}`;
    if (signature !== this.signature) {
      this.cards.forEach((card) => card.destroy());
      this.signature = signature;
      this.cards = shown.map((skill, index) => this.createCard(skill, index));
    }

    this.empty.setText(this.tab === 'career' && list.length === 0
      ? '还没有职业书。\n去左边「书店」用积蓄买，\n买到后这里会出现专属技能。'
      : '');
    this.pageText.setText(pages > 1 ? `${this.page + 1} / ${pages}` : '');
    this.prev.text.setVisible(pages > 1 && this.page > 0);
    this.next.text.setVisible(pages > 1 && this.page < pages - 1);
    this.prev.hit.setVisible(this.prev.text.visible);
    this.next.hit.setVisible(this.next.text.visible);

    this.cards.forEach((card) => {
      const skill = card.skill;
      card.hit.disableInteractive();
      if (skill.auto) {
        card.cost.setText(`不用学 · 积蓄+${skill.money}`);
        card.cost.setColor('#2f7d57');
        return;
      }
      const learned = isLearned(state, skill);
      const enough = state.household.insight >= skill.cost;
      const rest = skill.energy > 0 ? ' · 能回精力' : '';
      card.cost.setText(learned ? `已学会${rest}` : `悟性 -${skill.cost}${rest}`);
      card.cost.setColor(learned || !enough ? '#a33b32' : '#2f7d57');
      card.setDim(learned);
      if (!learned && enough) card.hit.setInteractive({ useHandCursor: true });
    });
  }

  createCard(skill, index) {
    const x = X + 22;
    const y = Y + 66 + index * 124;
    const w = W - 44;
    const h = 114;
    const g = this.scene.add.graphics().setDepth(5);
    drawCard(g, x, y, w, h, 12);
    const main = mainEffect(skill);
    const attr = main ? attributeByKey(main.key) : null;
    const name = this.scene.add.text(x + 12, y + 8, skill.name, inkText(18)).setDepth(6);
    const icon = attr ? paintIcon(this.scene, attr, x + 20, y + 41, 18, 6) : null;
    let focusText = '';
    if (attr) focusText = `主加 ${attr.label}`;
    else if (skill.money) focusText = `赚积蓄 +${skill.money}`;
    const career = skill.career ? getCareer(skill.career) : null;
    if (career) focusText += ` · ${career.name}`;
    const focus = this.scene.add.text(
      x + (attr ? 34 : 12),
      y + 32,
      focusText,
      inkText(14, attr ? colorHex(attr.color) : '#8a5a36'),
    ).setDepth(6);
    const detail = this.scene.add.text(x + 12, y + 54, skill.detail, inkText(12, COLORS.muted, {
      wordWrap: { width: w - 24 },
    })).setDepth(6);
    const cost = this.scene.add.text(x + 12, y + 90, '', inkText(14, '#2f7d57')).setDepth(6);
    const hit = this.scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0.001).setDepth(7);
    hit.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.onLearn(skill);
    });
    hit.on('pointerover', () => g.setAlpha(0.85));
    hit.on('pointerout', () => g.setAlpha(1));
    const parts = [g, name, icon, focus, detail, cost, hit].filter(Boolean);
    return {
      skill,
      cost,
      hit,
      setDim(dim) {
        [name, focus, detail].forEach((item) => item.setAlpha(dim ? 0.6 : 1));
        icon?.setAlpha(dim ? 0.6 : 1);
      },
      destroy() {
        parts.forEach((item) => item.destroy());
      },
    };
  }
}

function colorHex(color) {
  return `#${color.toString(16).padStart(6, '0')}`;
}
