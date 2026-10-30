/**
 * 文件：src/scenes/MainMenuScene.js
 * 作用：打开游戏后的标题界面。
 * 左边三个主按钮：开始游戏、存档、退出。存档格在弹窗里，不和开始混在一起。
 * 全屏是厨房插画，菜单半透明叠在左下，不是任何现成游戏的主菜单原画。
 */

import { COLORS, GAME_HEIGHT, GAME_TITLE, GAME_WIDTH, SCENE, inkText } from '../config/constants.js';
import BaseScene from '../core/BaseScene.js';
import GameState from '../core/GameState.js';
import { clearState, hasContinue, loadAlbum, loadState, saveState } from '../core/SaveManager.js';
import { getStage } from '../data/stages.js';
import BasePanel from '../ui/BasePanel.js';
import NewGamePanel from '../ui/NewGamePanel.js';
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
    this.addMenuButton(210, 320, '开始游戏', () => this.onStart());
    this.addMenuButton(210, 400, '存档', () => this.openSaves());
    this.addMenuButton(210, 480, '退出', () => this.openExit());
    this.addMenuButton(210, 560, '怎么玩', () => this.showHowTo(), { fontSize: 18, color: 0x3a2c22, hoverColor: 0x564233 });

    const seen = loadAlbum().length;
    this.add.text(210, 628, seen > 0 ? `已见证 ${seen}/8 种去向。` : '五个时期，八种职业去向。', inkText(15, '#f6e7c1')).setOrigin(0.5).setDepth(8);
    this.events.once('shutdown', () => this.closePanel());
  }

  /** 全屏厨房插画。左下一块半透明木色底，把标题和按钮托住。没图时退回深色底。 */
  paintRoom() {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x2a1c16, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (this.textures.exists('bg-menu')) {
      const photo = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-menu').setDepth(0);
      const cover = Math.max(GAME_WIDTH / photo.width, GAME_HEIGHT / photo.height);
      photo.setScale(cover);
    }
    const shade = this.add.graphics().setDepth(1);
    shade.fillStyle(0x1a120e, 0.28);
    shade.fillRect(0, 0, 460, GAME_HEIGHT);
    shade.fillStyle(0x1c140f, 0.72);
    shade.fillRoundedRect(28, 230, 364, 430, 22);
    shade.lineStyle(2, 0xe2b656, 0.35);
    shade.strokeRoundedRect(28, 230, 364, 430, 22);
  }

  paintTitle() {
    const plate = this.add.graphics().setDepth(7);
    plate.fillStyle(0x1c140f, 0.62);
    plate.fillRoundedRect(28, 36, 364, 168, 18);
    plate.lineStyle(2, 0xe2b656, 0.35);
    plate.strokeRoundedRect(28, 36, 364, 168, 18);
    this.add.text(48, 70, GAME_TITLE, inkText(52, '#f3d48a')).setDepth(8);
    const line = this.add.graphics().setDepth(8);
    line.fillStyle(0xe2b656, 1);
    line.fillRect(48, 122, 220, 4);
    this.add.text(48, 148, '从婴儿带到高中的一份答卷', inkText(17, '#f6e7c1')).setDepth(8);
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
    this.closePanel();
    this.panel = new NewGamePanel(this, {
      onStart: ({ name, gender }) => {
        this.closePanel();
        const state = GameState.createNew({ name, gender });
        this.setState(state);
        saveState(state);
        this.scene.start(SCENE.GAME);
      },
      onClose: () => this.closePanel(),
    });
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
    const panel = new BasePanel(this, { title: '怎么玩', width: 820, height: 600 });
    const lines = [
      '婴儿 3 回合、幼儿园 4、小学 5、初中 5、高中 7，高中结束就高考。',
      '右边花悟性学技能：按时期换一批，有的要先学基础。主加的那项越高，悟性花得越少。',
      '点孩子打开脑洞，精力没了就不能再点。点哪一项只加哪一项。开局只亮中间 4×4。',
      '顶上两条线：父母满意度满了有奖励，见底家里就冷了。',
      '压力满了会心力交瘁，压力清零反而无忧无虑。',
      '小学起「商店」开门。职业道具要到初中才能买。',
      '初中出现三个同学会。每回合只能找一个人，亲密度够了可以约周末。',
      '初中选方向，高中选职业。最后看七项属性够上哪个职业。',
    ];
    panel.track(this.add.text(panel.centerX, panel.top + 82, lines.join('\n'), inkText(19, COLORS.ink, {
      align: 'center',
      lineSpacing: 14,
    })).setOrigin(0.5, 0), 4);
    const close = new TextButton(this, panel.centerX, panel.top + 540, 220, 56, '知道了', () => {
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
  const who = `${state.child.name}（${state.child.gender === 'girl' ? '女孩' : '男孩'}）`;
  if (state.endingId) {
    return `${who} · ${stage.grade}\n上一局已经结束，不能从这里接着玩。`;
  }
  const sheet = state.child.sheet;
  return `${who} · ${stage.grade} · 第 ${state.round} 回合\n智商 ${sheet.iq}　　情商 ${sheet.eq}`;
}
