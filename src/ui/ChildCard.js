/**
 * 文件：src/ui/ChildCard.js
 * 作用：右侧的孩子卡片。表情和一句话会跟着属性变，让反馈不只是数字。
 */

import { COLORS, LAYOUT, inkText } from '../config/constants.js';
import { getStage } from '../data/stages.js';
import { describeChild, faceFor } from '../systems/StatSystem.js';

export default class ChildCard {
  constructor(scene) {
    const x = 860;
    const top = LAYOUT.frameTop;
    this.nameText = scene.add.text(x, top + 24, '', inkText(28)).setDepth(4);
    this.face = scene.add.text(1030, top + 150, '🙂', inkText(72)).setOrigin(0.5).setDepth(4);
    this.sentence = scene.add.text(x, top + 250, '', inkText(20, COLORS.ink, {
      wordWrap: { width: 360 },
      lineSpacing: 8,
    })).setDepth(4);
  }

  refresh(state) {
    const stats = state.child.stats;
    const stage = getStage(state.yearIndex);
    this.nameText.setText(state.child.name);
    this.face.setText(faceFor(stats, stage));
    this.sentence.setText(describeChild(stats, stage));
  }
}
