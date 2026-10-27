/**
 * 文件：src/ui/ArrangePanel.js
 * 作用：安排这一轮要做的技能。
 * 左边是已经学会的全部技能，点中以后按「安排」放进右边。
 * 右边是本轮列表，最多 5 个。结束这个时期时才真正执行。
 */

import { COLORS, SCHEDULES_PER_ROUND, inkText } from '../config/constants.js';
import { attributeByKey } from '../data/attributes.js';
import { getSkillById, learnedSkillList, mainEffect } from '../data/skills.js';
import { formatSheetLines } from '../systems/SheetSystem.js';
import BasePanel from './BasePanel.js';
import TextButton from './components/TextButton.js';
import { paintIcon } from './paintIcon.js';

export default class ArrangePanel extends BasePanel {
  constructor(scene, state, onPlan, onUnplan, onClear, onEnd, onClose) {
    super(scene, { width: 1160, height: 660 });
    this.scene = scene;
    this.onPlan = onPlan;
    this.selectedId = null;
    this.rows = [];
    this.slots = [];
    this.skills = learnedSkillList(state);
    if (this.skills.length > 0) this.selectedId = this.skills[0].id;

    this.track(scene.add.text(this.left + 36, this.top + 28, '会的技能', inkText(26)).setOrigin(0, 0.5), 5);
    this.track(scene.add.text(this.left + 760, this.top + 28, '本轮安排', inkText(26)).setOrigin(0, 0.5), 5);

    this.buildList();
    this.buildDetail();
    this.buildSchedule(onUnplan, onClear, onEnd, onClose);
    this.refresh(state);
  }

  buildList() {
    const columns = this.skills.length > 6 ? 2 : 1;
    const rowCount = Math.max(1, Math.ceil(this.skills.length / columns));
    const listTop = this.top + 68;
    const listBottom = this.top + this.height - 176;
    const rowH = Math.min(58, Math.floor((listBottom - listTop) / rowCount));
    const colW = columns === 2 ? 340 : 640;

    this.skills.forEach((skill, index) => {
      const col = columns === 2 ? index % 2 : 0;
      const row = columns === 2 ? Math.floor(index / 2) : index;
      const x = this.left + 36 + col * (colW + 16) + colW / 2;
      const y = listTop + row * rowH + rowH / 2;
      const bg = this.track(this.scene.add.rectangle(x, y, colW, rowH - 8, 0xfff9f0).setStrokeStyle(2, 0xe2d2bc), 5);
      const main = mainEffect(skill);
      const attr = main ? attributeByKey(main.key) : null;
      if (attr) this.track(paintIcon(this.scene, attr, x - colW / 2 + 28, y, 26, 206), 6);
      const name = this.track(this.scene.add.text(x - colW / 2 + 50, y, skill.name, inkText(18)).setOrigin(0, 0.5), 6);
      const tag = this.track(this.scene.add.text(
        x + colW / 2 - 16,
        y,
        attr ? attr.label : '',
        inkText(15, attr ? colorHex(attr.color) : COLORS.muted),
      ).setOrigin(1, 0.5), 6);
      const hit = this.track(this.scene.add.rectangle(x, y, colW, rowH - 8, 0xffffff, 0.001), 12);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerup', (pointer, localX, localY, event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        if (!this.canClick()) return;
        this.selectedId = skill.id;
        this.onPlan(skill);
      });
      this.rows.push({ skill, bg, name, tag, hit });
    });

    this.empty = this.track(this.scene.add.text(
      this.left + 360,
      this.top + 180,
      '还没有学会的技能。\n先到右侧学习栏花悟性。',
      inkText(20, COLORS.muted, { align: 'center', lineSpacing: 8 }),
    ).setOrigin(0.5), 6);
  }

  buildDetail() {
    const y = this.top + this.height - 92;
    this.track(this.scene.add.rectangle(this.left + 270, y, 480, 100, 0xfff3e4).setStrokeStyle(2, 0xe2d2bc), 5);
    this.detailName = this.track(this.scene.add.text(this.left + 40, y - 24, '', inkText(20)).setOrigin(0, 0.5), 6);
    this.detailBody = this.track(this.scene.add.text(this.left + 40, y + 16, '', inkText(16, COLORS.muted, {
      lineSpacing: 4,
    })).setOrigin(0, 0.5), 6);
    this.planButton = new TextButton(this.scene, this.left + 590, y, 120, 64, '安排', () => {
      if (!this.canClick()) return;
      const skill = this.skills.find((item) => item.id === this.selectedId);
      if (skill) this.onPlan(skill);
    }, { fontSize: 22, depth: 208, color: 0x2f7d57, hoverColor: 0x256746 });
    this.objects.push(...this.planButton.nodes());
  }

  buildSchedule(onUnplan, onClear, onEnd, onClose) {
    const clear = new TextButton(this.scene, this.left + 1048, this.top + 28, 140, 40, '清空列表', () => {
      if (!this.canClick()) return;
      onClear();
    }, { fontSize: 16, depth: 208, color: 0xc45c26, hoverColor: 0xa84b1c });
    this.objects.push(...clear.nodes());
    this.clearButton = clear;

    for (let index = 0; index < SCHEDULES_PER_ROUND; index += 1) {
      const y = this.top + 96 + index * 78;
      const bg = this.track(this.scene.add.rectangle(this.left + 930, y, 380, 64, 0xf6efe4).setStrokeStyle(2, 0xe2d2bc), 5);
      const label = this.track(this.scene.add.text(this.left + 930, y, '未安排', inkText(18, '#a89880')).setOrigin(0.5), 6);
      const hit = this.track(this.scene.add.rectangle(this.left + 930, y, 380, 64, 0xffffff, 0.001), 8);
      hit.on('pointerup', (pointer, localX, localY, event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        if (!this.canClick()) return;
        onUnplan(index);
      });
      this.slots.push({ bg, label, hit });
    }

    this.note = this.track(this.scene.add.text(
      this.left + 930,
      this.top + 500,
      '点左边的技能，就会加到右边',
      inkText(14, COLORS.muted),
    ).setOrigin(0.5), 6);

    const end = new TextButton(this.scene, this.left + 860, this.top + 580, 250, 52, '结束这个时期', () => {
      if (!this.canClick()) return;
      this.scene.time.delayedCall(0, () => onEnd());
    }, { fontSize: 18, depth: 208, color: 0x2f7d57, hoverColor: 0x256746 });
    const back = new TextButton(this.scene, this.left + 1060, this.top + 580, 130, 52, '返回', () => {
      if (!this.canClick()) return;
      this.scene.time.delayedCall(0, () => onClose());
    }, { fontSize: 18, depth: 208, color: 0x4a3424, hoverColor: 0x6b4b30 });
    this.objects.push(...end.nodes(), ...back.nodes());
    this.endButton = end;
  }

  refresh(state) {
    const plan = state.plan || [];
    this.empty.setVisible(this.skills.length === 0);
    this.rows.forEach((row) => {
      const on = row.skill.id === this.selectedId;
      row.bg.setStrokeStyle(on ? 4 : 2, on ? 0xc45c26 : 0xe2d2bc);
      row.bg.setFillStyle(on ? 0xfff1e4 : 0xfff9f0);
    });

    const skill = this.skills.find((item) => item.id === this.selectedId);
    if (!skill) {
      this.detailName.setText('先学会一项技能');
      this.detailBody.setText('学会以后会出现在左边。');
      this.planButton.setEnabled(false);
    } else {
      const lines = formatSheetLines(skill.effects, 2);
      if (skill.energy > 0) lines.push(`回复精力 +${skill.energy}`);
      this.detailName.setText(skill.name);
      this.detailBody.setText(lines.join('\n'));
      this.planButton.setEnabled(plan.length < SCHEDULES_PER_ROUND);
    }

    this.slots.forEach((slot, index) => {
      const picked = getSkillById(plan[index]);
      slot.label.setText(picked ? picked.name : '未安排');
      slot.label.setColor(picked ? COLORS.ink : '#a89880');
      slot.bg.setFillStyle(picked ? 0xffe3c4 : 0xf6efe4);
      slot.hit.disableInteractive();
      if (picked) slot.hit.setInteractive({ useHandCursor: true });
    });
    this.clearButton.setEnabled(plan.length > 0);
    this.endButton.setLabel(`（${plan.length}/${SCHEDULES_PER_ROUND}）结束这个时期`);
    this.note.setText('点左边的技能，就会加到右边');
    this.note.setColor(COLORS.muted);
  }
}

function colorHex(color) {
  return `#${color.toString(16).padStart(6, '0')}`;
}
