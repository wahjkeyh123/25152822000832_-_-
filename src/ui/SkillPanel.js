/**
 * 文件：src/ui/SkillPanel.js
 * 作用：画面右侧的学习栏。点一张卡就花悟性，学会的不能再点。
 * 先学基础，再进阶，再高阶。主加的那项属性越高，悟性越便宜。
 * 上面两个标签：「本期」随时期换一批，「职业」是买了职业道具后解锁的技能线。
 * 一页放 6 张卡，多了就翻页。
 */

import { COLORS, inkText } from '../config/constants.js';
import { attributeByKey } from '../data/attributes.js';
import { canLearnSkill, getCareerSkills, getSkillsForStage, isLearned, mainEffect, skillLearnCost } from '../data/skills.js';
import { paintSkillDoodle } from './skillDoodle.js';
import { drawCard, drawTab, drawWoodFrame } from './theme/frame.js';

const PER_PAGE = 6;
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
    if (this.tab === 'stage') return getSkillsForStage(state.yearIndex, state);
    if (!state.books.length) return [];
    return getCareerSkills();
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
      ? '还没有职业道具。\n初中起去左边「商店」用积蓄买，\n买到后这里会出现职业技能线。'
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
        card.learn.setText('自动');
        card.cost.setText(`+${skill.money}`);
        card.paintLearn(0x8a9a6a);
        card.setDim(false);
        return;
      }
      const learned = isLearned(state, skill);
      if (learned) {
        card.learn.setText('已学会');
        card.cost.setText('');
        card.paintLearn(0xb9a58a);
        card.setDim(true);
        return;
      }
      const gate = canLearnSkill(state, skill);
      const price = skillLearnCost(state, skill);
      if (gate.locked) {
        card.learn.setText('未解锁');
        card.cost.setText('');
        card.paintLearn(0xb9a58a);
        card.setDim(true);
        return;
      }
      card.learn.setText('学习');
      card.cost.setText(`${price}`);
      card.paintLearn(gate.ok ? 0x4a90c8 : 0xb9a58a);
      card.setDim(false);
      if (gate.ok) card.hit.setInteractive({ useHandCursor: true });
    });
  }

  createCard(skill, index) {
    const x = X + 22;
    const y = Y + 62 + index * 84;
    const w = W - 44;
    const h = 80;
    const g = this.scene.add.graphics().setDepth(5);
    drawCard(g, x, y, w, h, 10);
    const main = mainEffect(skill);
    const attr = main ? attributeByKey(main.key) : null;
    const doodle = paintSkillDoodle(this.scene, skill, x + 30, y + h / 2, 48, 6);
    const name = this.scene.add.text(x + 60, y + 12, skill.name, inkText(15, undefined, {
      wordWrap: { width: 108 },
    })).setDepth(6);
    let focusText = attr ? attr.label : (skill.money ? '积蓄' : '');
    const focus = this.scene.add.text(
      x + 60,
      y + 40,
      focusText,
      inkText(13, attr ? colorHex(attr.color) : '#8a5a36'),
    ).setDepth(6);
    const learnG = this.scene.add.graphics().setDepth(6);
    const bx = x + w - 62;
    const by = y + 12;
    const paintLearn = (color) => {
      learnG.clear();
      learnG.fillStyle(color, 1);
      learnG.fillRoundedRect(bx, by, 54, 56, 10);
    };
    paintLearn(0x4a90c8);
    const learn = this.scene.add.text(bx + 27, by + 16, '学习', inkText(13, '#fff8ee')).setOrigin(0.5).setDepth(7);
    const bulb = this.scene.add.circle(bx + 16, by + 40, 5, 0xf3d48a).setDepth(7);
    const cost = this.scene.add.text(bx + 36, by + 40, '', inkText(14, '#fff8ee', { fontStyle: 'bold' })).setOrigin(0.5).setDepth(7);
    const hit = this.scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0.001).setDepth(8);
    hit.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.onLearn(skill);
    });
    hit.on('pointerover', () => g.setAlpha(0.85));
    hit.on('pointerout', () => g.setAlpha(1));
    const parts = [g, doodle, name, focus, learnG, learn, bulb, cost, hit];
    return {
      skill,
      cost,
      learn,
      hit,
      paintLearn,
      setDim(dim) {
        [name, focus, doodle].forEach((item) => item.setAlpha(dim ? 0.55 : 1));
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
