/**
 * 文件：src/scenes/EndingScene.js
 * 作用：一局的终点。亮明赢或输，展示毕业考和最终属性，并可以立刻重开。
 * 没有「永远玩下去」的出口。
 */

import { COLORS, GAME_HEIGHT, GAME_WIDTH, SCENE, STAT_KEYS, inkText } from '../config/constants.js';
import BaseScene from '../core/BaseScene.js';
import GameState from '../core/GameState.js';
import { saveState } from '../core/SaveManager.js';
import { getEnding } from '../systems/EndingSystem.js';
import { wrapChinese } from '../utils/text.js';
import StatBar from '../ui/components/StatBar.js';
import TextButton from '../ui/components/TextButton.js';

export default class EndingScene extends BaseScene {
  constructor() {
    super(SCENE.ENDING);
  }

  create() {
    if (!this.state || !this.state.endingId) {
      this.scene.start(SCENE.MENU);
      return;
    }

    const ending = getEnding(this.state.endingId);
    const won = ending.result === 'win';
    const g = this.add.graphics();
    g.fillStyle(COLORS.bg, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(won ? 0x2f7d57 : 0xa33b32, 1);
    g.fillRect(0, 0, GAME_WIDTH, 8);
    g.fillStyle(0xfff9f0, 1);
    g.fillRoundedRect(140, 70, 1000, 500, 20);

    this.add.text(GAME_WIDTH / 2, 110, won ? '这一局，你赢了' : '这一局，你输了', inkText(22, won ? '#2f7d57' : '#a33b32')).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 160, ending.title, inkText(40)).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 220, wrapChinese(ending.text, 28), inkText(20, COLORS.ink, {
      align: 'center',
      wordWrap: { width: 860 },
      lineSpacing: 8,
    })).setOrigin(0.5, 0);

    const exam = this.state.exam || { score: 0, comment: '' };
    this.add.text(
      GAME_WIDTH / 2,
      360,
      `高考 ${exam.score} 分。${exam.comment}`,
      inkText(22),
    ).setOrigin(0.5);

    const barWidth = 200;
    STAT_KEYS.forEach((key, index) => {
      const bar = new StatBar(this, 180 + index * 230, 400, barWidth, key);
      bar.setValue(this.state.child.stats[key]);
    });

    new TextButton(this, 520, 520, 220, 60, '再来一局', () => this.again(), {
      fontSize: 22,
      color: 0x2f7d57,
      hoverColor: 0x256746,
    });
    new TextButton(this, 760, 520, 220, 60, '回主菜单', () => this.scene.start(SCENE.MENU), {
      fontSize: 22,
      color: 0x3d6ea8,
      hoverColor: 0x2f5684,
    });

    this.add.text(GAME_WIDTH / 2, 680, '结局之后可以直接重开。上一局的存档不会再被「继续」。', inkText(15, COLORS.muted)).setOrigin(0.5);
  }

  again() {
    const next = GameState.createNew();
    this.setState(next);
    saveState(next);
    this.scene.start(SCENE.GAME);
  }
}
