/**
 * 文件：src/ui/AttributePanel.js
 * 作用：培养界面左边的属性卡，下面是「安排」「书店」两个按钮和本期提示。
 * 它只读孩子的七项属性，不在这里改数字。数字变了会跳一下。
 */

import { COLORS, inkText } from '../config/constants.js';
import { ATTRIBUTES } from '../data/attributes.js';
import { stageCount, getStage } from '../data/stages.js';
import { pulse } from '../effects/Motion.js';
import { schedulesLeft } from '../systems/SheetSystem.js';
import { paintIcon } from './paintIcon.js';
import TextButton from './components/TextButton.js';
import { drawWoodFrame } from './theme/frame.js';

export default class AttributePanel {
  constructor(scene, { onArrange, onShop }) {
    this.scene = scene;
    this.last = {};
    const cardX = 16;
    const cardY = 102;
    const cardW = 278;
    const cardH = 364;
    const g = scene.add.graphics().setDepth(4);
    drawWoodFrame(g, cardX, cardY, cardW, cardH, { radius: 16, border: 9 });

    this.rows = ATTRIBUTES.map((attr, index) => {
      const y = cardY + 34 + index * 47;
      if (index % 2 === 1) {
        g.fillStyle(0xf1e2c8, 0.6);
        g.fillRoundedRect(cardX + 14, y - 20, cardW - 28, 40, 8);
      }
      paintIcon(scene, attr, cardX + 36, y, 22, 6);
      const name = scene.add.text(cardX + 56, y, attr.label, inkText(16)).setOrigin(0, 0.5).setDepth(6);
      const value = scene.add.text(cardX + 168, y, '0', inkText(19, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0.5).setDepth(6);
      const growth = scene.add.text(cardX + 196, y, '', inkText(13, '#2f7d57')).setOrigin(0, 0.5).setDepth(6);
      return { key: attr.key, name, value, growth };
    });

    this.arrange = new TextButton(scene, 106, 508, 170, 62, '安排', onArrange, {
      fontSize: 28,
      color: 0x3f8f4f,
      hoverColor: 0x337a41,
      depth: 6,
    });
    this.shop = new TextButton(scene, 240, 508, 92, 62, '书店', onShop, {
      fontSize: 20,
      color: 0x8a5a36,
      hoverColor: 0x6e4529,
      depth: 6,
    });
    this.remain = scene.add.text(155, 556, '', inkText(14, '#2c2416')).setOrigin(0.5).setDepth(6);
    this.untilExam = scene.add.text(155, 576, '', inkText(13, '#6e6256')).setOrigin(0.5).setDepth(6);
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    this.rows.forEach((row) => {
      const value = state.child.sheet[row.key] ?? 0;
      const growth = state.child.growth[row.key] ?? 0;
      row.value.setText(String(value));
      if (this.last[row.key] !== undefined && this.last[row.key] !== value) pulse(this.scene, row.value);
      this.last[row.key] = value;
      row.growth.setText(`+${growth}/回合`);
    });
    const stagesLeft = stageCount() - state.yearIndex - 1;
    const examLine = stagesLeft <= 0 ? '这个时期结束就高考' : `距离高考还有 ${stagesLeft} 个时期`;
    const slots = schedulesLeft(state);
    this.remain.setText(`${stage.grade} · 还能安排 ${slots} 个技能`);
    this.untilExam.setText(examLine);
    this.arrange.setEnabled(!state.endingId);
    this.shop.setEnabled(!state.endingId);
  }
}
