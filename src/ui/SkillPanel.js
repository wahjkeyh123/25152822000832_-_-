/**
 * 文件：src/ui/SkillPanel.js
 * 作用：画面右侧的学习栏。点一张卡就花悟性，学会的不能再点。
 */

import { COLORS, inkText } from '../config/constants.js';
import { attributeByKey } from '../data/attributes.js';
import { getSkillsForStage, mainEffect } from '../data/skills.js';
import { paintIcon } from './paintIcon.js';

export default class SkillPanel {
  constructor(scene, onLearn) {
    this.scene = scene;
    this.onLearn = onLearn;
    this.cards = [];
    this.signature = '';
    const x = 996;
    const y = 96;
    const w = 268;
    const h = 600;
    const g = scene.add.graphics().setDepth(4);
    g.fillStyle(0xc45c26, 1);
    g.fillRoundedRect(x + 16, y - 18, 120, 36, 10);
    g.fillStyle(0xf3e6d4, 0.96);
    g.fillRoundedRect(x, y, w, h, 18);
    g.lineStyle(2, 0xd7c4aa, 1);
    g.strokeRoundedRect(x, y, w, h, 18);
    scene.add.text(x + 76, y - 10, '学习', inkText(18, '#fff8ee')).setOrigin(0.5).setDepth(6);
    this.hint = scene.add.text(x + 16, y + 28, '学会后，到安排里执行', inkText(14, COLORS.muted)).setDepth(6);
  }

  refresh(state) {
    const skills = getSkillsForStage(state.yearIndex);
    const signature = skills.map((skill) => skill.id).join(',');
    if (signature !== this.signature) {
      this.cards.forEach((card) => card.destroy());
      this.signature = signature;
      this.cards = skills.map((skill, index) => this.createCard(skill, index));
    }
    this.cards.forEach((card) => {
      const learned = state.learnedSkills.includes(card.skill.id);
      const enough = state.household.insight >= card.skill.cost;
      const rest = card.skill.energy > 0 ? ' · 能回精力' : '';
      card.cost.setText(learned ? `已学会${rest}` : `悟性 -${card.skill.cost}`);
      card.cost.setColor(learned || !enough ? '#a33b32' : '#2f7d57');
      card.hit.disableInteractive();
      if (!learned && enough) card.hit.setInteractive({ useHandCursor: true });
    });
  }

  createCard(skill, index) {
    const x = 1012;
    const y = 158 + index * 126;
    const bg = this.scene.add.rectangle(x + 118, y + 56, 236, 114, 0xfff9f0)
      .setStrokeStyle(2, 0xe2d2bc)
      .setDepth(5);
    const main = mainEffect(skill);
    const attr = main ? attributeByKey(main.key) : null;
    const name = this.scene.add.text(x + 12, y + 8, skill.name, inkText(18)).setDepth(6);
    const icon = attr ? paintIcon(this.scene, attr, x + 20, y + 40, 18, 6) : null;
    const focus = this.scene.add.text(
      x + (attr ? 34 : 12),
      y + 30,
      attr ? `主加 ${attr.label}` : '',
      inkText(14, attr ? colorHex(attr.color) : COLORS.muted),
    ).setDepth(6);
    const detail = this.scene.add.text(x + 12, y + 52, skill.detail, inkText(12, COLORS.muted, {
      wordWrap: { width: 210 },
    })).setDepth(6);
    const cost = this.scene.add.text(x + 12, y + 90, '', inkText(14, '#2f7d57')).setDepth(6);
    const hit = this.scene.add.rectangle(x + 118, y + 56, 236, 114, 0xffffff, 0.001).setDepth(7);
    hit.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.onLearn(skill);
    });
    return {
      skill,
      cost,
      hit,
      destroy() {
        bg.destroy();
        name.destroy();
        icon?.destroy();
        focus.destroy();
        detail.destroy();
        cost.destroy();
        hit.destroy();
      },
    };
  }
}

function colorHex(color) {
  return `#${color.toString(16).padStart(6, '0')}`;
}
