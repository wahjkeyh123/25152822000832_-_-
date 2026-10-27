/**
 * 文件：src/ui/YearPanel.js
 * 作用：中间那块纸，写这一年的情况和最近发生的五件事。
 * 玩家不看文档，也要能从这里知道「刚才那一下造成了什么」。
 */

import { COLORS, LAYOUT, inkText } from '../config/constants.js';
import { getStage } from '../data/stages.js';
import { wrapChinese } from '../utils/text.js';

export default class YearPanel {
  constructor(scene) {
    this.title = scene.add.text(56, LAYOUT.frameTop + 18, '', inkText(28)).setDepth(4);
    this.blurb = scene.add.text(56, LAYOUT.frameTop + 64, '', inkText(18, COLORS.ink, {
      wordWrap: { width: 720 },
      lineSpacing: 6,
    })).setDepth(4);
    this.logTitle = scene.add.text(56, LAYOUT.frameTop + 150, '最近发生的事', inkText(16, COLORS.muted)).setDepth(4);
    this.logText = scene.add.text(56, LAYOUT.frameTop + 180, '', inkText(18, COLORS.ink, {
      lineSpacing: 8,
      wordWrap: { width: 720 },
    })).setDepth(4);
    this.hint = scene.add.text(
      56,
      LAYOUT.frameTop + 360,
      '鼠标点下方活动，或按 1–5。Enter 结束这个时期。Esc 暂停。',
      inkText(15, COLORS.muted),
    ).setDepth(4);
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    this.title.setText(`${stage.grade}，${state.child.name} ${stage.age} 岁`);
    this.blurb.setText(stage.blurb);
    const lines = state.log.map((line, index) => wrapChinese(`${index === 0 ? '· ' : '  '}${line}`, 32));
    this.logText.setText(lines.join('\n'));
  }
}
