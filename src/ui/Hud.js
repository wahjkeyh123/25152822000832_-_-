/**
 * 文件：src/ui/Hud.js
 * 作用：顶上那一排：几年级、积蓄、精力、四条属性，以及暂停按钮。
 * 它只显示 GameState，不自己改规则。
 */

import { COLORS, STAT_KEYS, inkText } from '../config/constants.js';
import { getStage } from '../data/stages.js';
import StatBar from './components/StatBar.js';
import TextButton from './components/TextButton.js';

export default class Hud {
  constructor(scene, { onPause }) {
    this.scene = scene;
    const barWidth = 270;
    const gap = 24;
    const startX = 32;
    this.bars = STAT_KEYS.map((key, index) => new StatBar(
      scene,
      startX + index * (barWidth + gap),
      70,
      barWidth,
      key,
    ));

    this.gradeText = scene.add.text(32, 22, '', inkText(26)).setDepth(4);
    this.moneyText = scene.add.text(860, 28, '', inkText(20)).setDepth(4);
    this.energyText = scene.add.text(1040, 28, '', inkText(20)).setDepth(4);
    this.legend = scene.add.text(
      32,
      118,
      '学识、体质、心情越高越好。压力越高越危险。',
      inkText(15, COLORS.muted),
    ).setDepth(4);

    this.pauseButton = new TextButton(
      scene,
      1208,
      34,
      96,
      36,
      '暂停',
      () => onPause(),
      { fontSize: 16, depth: 6 },
    );
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    this.gradeText.setText(`${stage.grade} · ${stage.age} 岁`);
    this.moneyText.setText(`积蓄 ${state.household.money} 元`);
    this.energyText.setText(`精力 ${state.household.energy}/${state.household.energyMax}`);
    this.bars.forEach((bar) => bar.setValue(state.child.stats[bar.key]));
    this.pauseButton.setVisible(!state.endingId);
  }
}
