/**
 * 文件：src/scenes/MainMenuScene.js
 * 作用：打开游戏后的标题界面。
 * 左边三个主按钮：开始游戏、存档、退出。存档格在弹窗里，不和开始混在一起。
 * 右边是自己画的晚饭桌，不是任何现成游戏的主菜单原画。
 */

import { COLORS, GAME_HEIGHT, GAME_TITLE, GAME_WIDTH, SCENE, inkText } from '../config/constants.js';
import BaseScene from '../core/BaseScene.js';
import GameState from '../core/GameState.js';
import { clearState, hasContinue, loadState, saveState } from '../core/SaveManager.js';
import { getStage } from '../data/stages.js';
import BasePanel from '../ui/BasePanel.js';
import TextButton from '../ui/components/TextButton.js';

const MENU_BUTTON = {
  color: 0x4a3424,
  hoverColor: 0x6b4b30,
  fontSize: 22,
  depth: 8,
};

export default class MainMenuScene extends BaseScene {
  constructor() {
    super(SCENE.MENU);
  }

  create() {
    this.panel = null;
    this.paintRoom();
    this.paintTitle();
    this.addMenuButton(210, 300, '开始游戏', () => this.onStart());
    this.addMenuButton(210, 390, '存档', () => this.openSaves());
    this.addMenuButton(210, 480, '退出', () => this.openExit());
    this.addMenuButton(210, 600, '怎么玩', () => this.showHowTo(), { fontSize: 18, color: 0x3a2c22, hoverColor: 0x564233 });

    this.add.text(210, 660, '四个时期，每个时期安排两次。', inkText(15, '#d9c4a4')).setOrigin(0.5).setDepth(8);
    this.events.once('shutdown', () => this.closePanel());
  }

  /** 自己画的晚饭桌：窗子、圆桌、四盏暖色，不临摹现成游戏的人物。 */
  paintRoom() {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x2a1c16, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0x3d2b22, 1);
    g.fillRect(380, 0, 900, GAME_HEIGHT);
    g.fillStyle(0x1d3148, 1);
    g.fillRoundedRect(860, 70, 280, 180, 12);
    g.fillStyle(0xf2d7a2, 0.35);
    g.fillCircle(1180, 90, 36);
    g.fillStyle(0x6b422c, 1);
    g.fillEllipse(980, 520, 620, 220);
    g.fillStyle(0xf4e4cc, 1);
    g.fillEllipse(980, 470, 150, 70);
    g.fillStyle(0xc45c26, 1);
    g.fillCircle(940, 430, 10);
    g.fillCircle(980, 424, 10);
    g.fillCircle(1020, 430, 10);
    const seats = [760, 900, 1080, 1220];
    const colors = [0xe7b089, 0xd98b6c, 0xc47b63, 0xb56b58];
    seats.forEach((x, index) => {
      g.fillStyle(colors[index], 1);
      g.fillCircle(x, 390, 28);
      g.fillRoundedRect(x - 34, 418, 68, 70, 16);
    });
    g.fillStyle(0x1c140f, 0.72);
    g.fillRect(0, 0, 420, GAME_HEIGHT);
  }

  paintTitle() {
    this.add.text(48, 78, GAME_TITLE, inkText(64, '#f3d48a')).setDepth(8);
    const line = this.add.graphics().setDepth(8);
    line.fillStyle(0xe2b656, 1);
    line.fillRect(48, 132, 250, 4);
    this.add.text(48, 156, '从婴儿带到高中的一份答卷', inkText(18, '#f6e7c1')).setDepth(8);
  }

  addMenuButton(x, y, label, onClick, options = {}) {
    return new TextButton(this, x, y, 250, 58, label, onClick, { ...MENU_BUTTON, ...options });
  }

  closePanel() {
    this.panel?.destroy();
    this.panel = null;
  }

  onStart() {
    if (loadState()) {
      this.openOverwrite();
      return;
    }
    this.startNew();
  }

  startNew() {
    const state = GameState.createNew();
    this.setState(state);
    saveState(state);
    this.scene.start(SCENE.GAME);
  }

  continueGame() {
    const state = loadState();
    if (!state || state.endingId) return;
    this.setState(state);
    this.scene.start(SCENE.GAME);
  }

  openSaves() {
    this.closePanel();
    const state = loadState();
    const panel = new BasePanel(this, { title: '存档', width: 720, height: 460 });
    const summary = describeSave(state);
    panel.track(this.add.text(panel.centerX, panel.top + 110, '存档 1', inkText(16, COLORS.muted)).setOrigin(0.5), 4);
    panel.track(this.add.text(panel.centerX, panel.top + 160, summary, inkText(22, COLORS.ink, {
      align: 'center',
      lineSpacing: 10,
    })).setOrigin(0.5, 0), 4);

    const loadButton = new TextButton(this, panel.centerX, panel.top + 300, 280, 56, '读取存档', () => {
      if (!panel.canClick()) return;
      this.time.delayedCall(0, () => this.continueGame());
    }, { fontSize: 20, depth: 206, color: 0x2f7d57, hoverColor: 0x256746 });
    loadButton.setEnabled(hasContinue());
    panel.objects.push(...loadButton.nodes());

    const deleteButton = new TextButton(this, panel.centerX - 150, panel.top + 380, 200, 52, '删除存档', () => {
      if (!panel.canClick() || !loadState()) return;
      this.time.delayedCall(0, () => {
        clearState();
        this.openSaves();
      });
    }, { fontSize: 18, depth: 206, color: 0xa33b32, hoverColor: 0x7d2d27 });
    deleteButton.setEnabled(Boolean(state));
    panel.objects.push(...deleteButton.nodes());

    const back = new TextButton(this, panel.centerX + 150, panel.top + 380, 200, 52, '返回', () => {
      if (!panel.canClick()) return;
      this.time.delayedCall(0, () => this.closePanel());
    }, { fontSize: 18, depth: 206, color: 0x4a3424, hoverColor: 0x6b4b30 });
    panel.objects.push(...back.nodes());
    this.panel = panel;
  }

  openOverwrite() {
    this.closePanel();
    const panel = new BasePanel(this, { title: '开始新的一局', width: 640, height: 340 });
    panel.track(this.add.text(panel.centerX, panel.top + 120, '现在的存档会被盖掉。\n确定从头开始吗？', inkText(22, COLORS.ink, {
      align: 'center',
      lineSpacing: 12,
    })).setOrigin(0.5, 0), 4);
    const yes = new TextButton(this, panel.centerX - 130, panel.top + 250, 200, 56, '开始游戏', () => {
      if (!panel.canClick()) return;
      this.time.delayedCall(0, () => this.startNew());
    }, { fontSize: 20, depth: 206, color: 0xc45c26, hoverColor: 0xa84b1c });
    const no = new TextButton(this, panel.centerX + 130, panel.top + 250, 200, 56, '留下', () => {
      if (!panel.canClick()) return;
      this.time.delayedCall(0, () => this.closePanel());
    }, { fontSize: 20, depth: 206, color: 0x4a3424, hoverColor: 0x6b4b30 });
    panel.objects.push(...yes.nodes(), ...no.nodes());
    this.panel = panel;
  }

  openExit() {
    this.closePanel();
    const panel = new BasePanel(this, { title: '退出', width: 640, height: 320 });
    panel.track(this.add.text(panel.centerX, panel.top + 120, '退出后会离开这张标题画面。', inkText(22, COLORS.ink)).setOrigin(0.5), 4);
    const yes = new TextButton(this, panel.centerX - 130, panel.top + 230, 200, 56, '退出', () => {
      if (!panel.canClick()) return;
      this.time.delayedCall(0, () => this.leaveGame());
    }, { fontSize: 20, depth: 206, color: 0xa33b32, hoverColor: 0x7d2d27 });
    const no = new TextButton(this, panel.centerX + 130, panel.top + 230, 200, 56, '留下', () => {
      if (!panel.canClick()) return;
      this.time.delayedCall(0, () => this.closePanel());
    }, { fontSize: 20, depth: 206, color: 0x4a3424, hoverColor: 0x6b4b30 });
    panel.objects.push(...yes.nodes(), ...no.nodes());
    this.panel = panel;
  }

  leaveGame() {
    this.closePanel();
    this.children.removeAll(true);
    this.cameras.main.setBackgroundColor('#1a140f');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a140f);
    this.add.text(GAME_WIDTH / 2, 280, '已经退出', inkText(48, '#f3d48a')).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 350, '可以关闭这个浏览器标签页。', inkText(22, '#f6e7c1')).setOrigin(0.5);
    new TextButton(this, GAME_WIDTH / 2, 450, 240, 58, '回到标题', () => {
      this.scene.restart();
    }, MENU_BUTTON);
  }

  showHowTo() {
    this.closePanel();
    const panel = new BasePanel(this, { title: '怎么玩', width: 760, height: 520 });
    const lines = [
      '四个时期：婴儿、幼儿园、初中、高中。',
      '右边花悟性学会技能，卡片上写着它主要加哪项。',
      '「安排」左边是学会的技能，右边是这一轮要做的，最多 5 个。',
      '结束这个时期才执行。放松类会把精力加回来。',
      '点孩子打开脑洞，每格花 5 点精力。点到悟性加 5 点。',
      '每个时期结束回复一半精力，脑洞会重新排列。',
      '高中结束就高考。键盘 1 到 5 把学会的技能放进本轮。',
    ];
    panel.track(this.add.text(panel.centerX, panel.top + 78, lines.join('\n'), inkText(20, COLORS.ink, {
      align: 'center',
      lineSpacing: 14,
    })).setOrigin(0.5, 0), 4);
    const close = new TextButton(this, panel.centerX, panel.top + 460, 220, 56, '知道了', () => {
      if (!panel.canClick()) return;
      this.time.delayedCall(0, () => this.closePanel());
    }, { fontSize: 20, depth: 206, color: 0x2f7d57, hoverColor: 0x256746 });
    panel.objects.push(...close.nodes());
    this.panel = panel;
  }
}

function describeSave(state) {
  if (!state) return '这个格子是空的。\n开始游戏后，进度会记在这里。';
  const stage = getStage(state.yearIndex);
  if (state.endingId) {
    return `小满 · ${stage.grade}\n上一局已经结束，不能从这里接着玩。`;
  }
  const sheet = state.child.sheet;
  return `小满 · ${stage.grade} · ${stage.age} 岁\n智商 ${sheet.iq}　　情商 ${sheet.eq}`;
}
