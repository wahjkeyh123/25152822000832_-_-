/**
 * 文件：src/ui/AttributePanel.js
 * 作用：培养界面左边的属性卡，和下面的「安排」按钮。
 * 它只读孩子的七项属性，不在这里改数字。
 */

import { COLORS, inkText } from '../config/constants.js';
import { ATTRIBUTES } from '../data/attributes.js';
import { stageCount, getStage } from '../data/stages.js';
import { schedulesLeft } from '../systems/SheetSystem.js';
import { paintIcon } from './paintIcon.js';
import TextButton from './components/TextButton.js';

export default class AttributePanel {
  constructor(scene, onArrange) {
    this.scene = scene;
    const cardX = 20;
    const cardY = 108;
    const cardW = 270;
    const cardH = 392;
    const g = scene.add.graphics().setDepth(4);
    g.fillStyle(0x000000, 0.08);
    g.fillRoundedRect(cardX + 4, cardY + 6, cardW, cardH, 16);
    g.fillStyle(0xfff9f0, 0.96);
    g.fillRoundedRect(cardX, cardY, cardW, cardH, 16);
    g.lineStyle(2, COLORS.panelEdge, 1);
    g.strokeRoundedRect(cardX, cardY, cardW, cardH, 16);

    this.rows = ATTRIBUTES.map((attr, index) => {
      const y = cardY + 36 + index * 52;
      paintIcon(scene, attr, cardX + 28, y, 22, 6);
      const name = scene.add.text(cardX + 50, y, attr.label, inkText(16)).setOrigin(0, 0.5).setDepth(6);
      const value = scene.add.text(cardX + 148, y, '0', inkText(18)).setOrigin(0, 0.5).setDepth(6);
      const growth = scene.add.text(cardX + 186, y, '', inkText(13, '#2f7d57')).setOrigin(0, 0.5).setDepth(6);
      return { key: attr.key, name, value, growth };
    });

    this.arrange = new TextButton(scene, 155, 548, 250, 72, '安排', onArrange, {
      fontSize: 28,
      color: 0x6e675f,
      hoverColor: 0x564f48,
      depth: 6,
    });
    this.remain = scene.add.text(155, 612, '', inkText(14, '#2c2416')).setOrigin(0.5).setDepth(6);
    this.untilExam = scene.add.text(155, 636, '', inkText(14, '#6e6256')).setOrigin(0.5).setDepth(6);
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    this.rows.forEach((row) => {
      const value = state.child.sheet[row.key] ?? 0;
      const growth = state.child.growth[row.key] ?? 0;
      row.value.setText(String(value));
      row.growth.setText(`+${growth}/回合`);
    });
    const stagesLeft = stageCount() - state.yearIndex - 1;
    const examLine = stagesLeft <= 0 ? '这个时期结束就高考' : `距离高考还有 ${stagesLeft} 个时期`;
    const slots = schedulesLeft(state);
    this.remain.setText(`${stage.grade} · 还能安排 ${slots} 个技能`);
    this.untilExam.setText(examLine);
    this.arrange.setEnabled(!state.endingId && state.household.energy >= 0);
  }
}
