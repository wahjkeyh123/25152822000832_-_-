/**
 * 文件：src/scenes/GameScene.js
 * 作用：培养界面。左边属性、安排、商店和当前期望，中间点孩子进脑洞，右边用悟性学习。
 * 底部正中是「结束本回合」。属性怎么加减，写在 systems/。这里只接收点击、调用规则、刷新画面。
 */

import { SCENE, SCHEDULES_PER_ROUND, inkText } from '../config/constants.js';
import { playBgm, playSfx } from '../audio/AudioManager.js';
import { getStage } from '../data/stages.js';
import { learnedSkillList } from '../data/skills.js';
import BaseScene from '../core/BaseScene.js';
import EventBus from '../core/EventBus.js';
import GameState from '../core/GameState.js';
import { saveState } from '../core/SaveManager.js';
import { spawnStatChanges } from '../effects/FloatingText.js';
import { answerAspire } from '../systems/AspirationSystem.js';
import { getEventById } from '../systems/EventSystem.js';
import {
  buyBook,
  buyItem,
  clearPlan,
  commitPlan,
  digHole,
  learnSkill,
  planSkill,
  repeatLastPlan,
  unplanAt,
} from '../systems/SheetSystem.js';
import { advance, endRound, resolveEventChoice } from '../systems/TimeSystem.js';
import ArrangePanel from '../ui/ArrangePanel.js';
import AspirationPanel from '../ui/AspirationPanel.js';
import AttributePanel from '../ui/AttributePanel.js';
import BrainHolePanel from '../ui/BrainHolePanel.js';
import CenterChild from '../ui/CenterChild.js';
import EventPanel from '../ui/EventPanel.js';
import ExpectBox from '../ui/ExpectBox.js';
import PausePanel from '../ui/PausePanel.js';
import ProfilePanel from '../ui/ProfilePanel.js';
import RoomBackdrop from '../ui/RoomBackdrop.js';
import RoundBanner from '../ui/RoundBanner.js';
import ShopPanel from '../ui/ShopPanel.js';
import SkillPanel from '../ui/SkillPanel.js';
import StageIntro from '../ui/StageIntro.js';
import { showNotices } from '../ui/Toast.js';
import TopBar from '../ui/TopBar.js';
import TextButton from '../ui/components/TextButton.js';

const PANELS = ['eventPanel', 'pausePanel', 'arrangePanel', 'profilePanel', 'brainPanel', 'shopPanel', 'aspirePanel', 'intro'];

export default class GameScene extends BaseScene {
  constructor() {
    super(SCENE.GAME);
  }

  create() {
    if (!this.bus) this.registry.set('bus', new EventBus());
    if (!this.state) this.setState(GameState.createNew());

    this.busy = false;
    PANELS.forEach((key) => { this[key] = null; });

    this.room = new RoomBackdrop(this);
    this.room.show(getStage(this.state.yearIndex).id, false);
    this.topBar = new TopBar(this, {
      onAvatar: () => this.openProfile(),
      onPause: () => this.togglePause(),
    });
    this.banner = new RoundBanner(this);
    this.attributes = new AttributePanel(this, {
      onArrange: () => this.openArrange(),
      onShop: () => this.openShop(),
    });
    this.expectBox = new ExpectBox(this);
    this.childView = new CenterChild(this, () => this.openBrain());
    this.skills = new SkillPanel(this, (skill) => this.onLearn(skill));
    this.endButton = new TextButton(this, 640, 642, 250, 52, '结束本回合', () => this.onEndRound(), {
      fontSize: 20,
      depth: 6,
      color: 0x2f7d57,
      hoverColor: 0x256746,
    });
    const logBg = this.add.graphics().setDepth(4);
    logBg.fillStyle(0x2c1d12, 0.55);
    logBg.fillRoundedRect(330, 680, 620, 28, 14);
    this.logText = this.add.text(640, 694, '', inkText(14, '#fff6e6')).setOrigin(0.5).setDepth(5);

    this.offState = this.bus.on('state-changed', (payload) => {
      this.refresh();
      if (payload?.changes) {
        spawnStatChanges(this, payload.changes, payload.x ?? 640, payload.y ?? 340);
      }
    });

    this.bindKeys();
    this.refresh();
    this.events.once('shutdown', () => this.teardown());
    playBgm(this);
    this.resumePending();
  }

  /** 读档或刚开局时，接上没走完的事件、过场或志向问题。 */
  resumePending() {
    const state = this.state;
    if (state.pendingEventId) {
      const event = getEventById(state.pendingEventId);
      if (event) {
        this.showEvent(event);
        return;
      }
      state.pendingEventId = null;
    }
    if (state.pendingIntro) {
      this.showIntro();
      return;
    }
    if (state.pendingAspire) this.showAspire(state.pendingAspire);
  }

  bindKeys() {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'].forEach((name, index) => {
      const press = (event) => {
        if (event && event.repeat) return;
        const skill = learnedSkillList(this.state)[index];
        if (skill) this.onPlan(skill);
      };
      keyboard.on(`keydown-${name}`, press);
      keyboard.on(`keydown-NUMPAD_${name}`, press);
    });
    keyboard.on('keydown-ENTER', (event) => {
      if (event && event.repeat) return;
      this.onEndRound();
    });
    keyboard.on('keydown-ESC', (event) => {
      if (event && event.repeat) return;
      this.togglePause();
    });
  }

  refresh() {
    const state = this.state;
    this.room.show(getStage(state.yearIndex).id, true);
    this.topBar.refresh(state);
    this.banner.refresh(state);
    this.attributes.refresh(state);
    this.expectBox.refresh(state);
    this.childView.refresh(state);
    this.skills.refresh(state);
    const planned = state.plan?.length || 0;
    this.endButton.setLabel(`结束本回合（${planned}/${SCHEDULES_PER_ROUND}）`);
    this.endButton.setVisible(!state.endingId);
    const line = state.log[0] || '';
    this.logText.setText(line.length > 40 ? `${line.slice(0, 40)}…` : line);
  }

  modalOpen() {
    return Boolean(this.eventPanel || this.pausePanel || this.profilePanel
      || this.brainPanel || this.shopPanel || this.aspirePanel || this.intro);
  }

  canOpen() {
    return !this.busy && !this.modalOpen() && !this.arrangePanel;
  }

  openArrange() {
    if (!this.canOpen()) return;
    this.arrangePanel = new ArrangePanel(this, this.state, {
      onPlan: (skill) => this.onPlan(skill),
      onUnplan: (index) => this.onUnplan(index),
      onClear: () => this.onClearPlan(),
      onRepeat: () => this.onRepeatPlan(),
      onEnd: () => this.onEndRound(),
      onClose: () => this.closeArrange(),
    });
  }

  closeArrange() {
    this.arrangePanel?.destroy();
    this.arrangePanel = null;
  }

  openProfile() {
    if (!this.canOpen()) return;
    this.profilePanel = new ProfilePanel(this, this.state, () => {
      this.profilePanel?.destroy();
      this.profilePanel = null;
    });
  }

  openShop() {
    if (!this.canOpen()) return;
    this.shopPanel = new ShopPanel(this, this.state, {
      onBuyBook: (bookId) => this.onBuyBook(bookId),
      onBuyItem: (itemId) => this.onBuyItem(itemId),
      onClose: () => {
        this.shopPanel?.destroy();
        this.shopPanel = null;
      },
    });
  }

  onBuyBook(bookId) {
    if (!this.shopPanel) return;
    const result = buyBook(this.state, bookId);
    if (!result.ok) {
      this.shopPanel.refresh(this.state, result.reason || '现在买不了');
      return;
    }
    saveState(this.state);
    playSfx(this, 'coin');
    this.skills.tab = 'career';
    this.skills.page = 0;
    this.refresh();
    this.shopPanel?.refresh(this.state);
  }

  onBuyItem(itemId) {
    if (!this.shopPanel) return;
    const result = buyItem(this.state, itemId);
    if (!result.ok) {
      this.shopPanel.refresh(this.state, result.reason || '现在买不了');
      return;
    }
    saveState(this.state);
    playSfx(this, 'coin');
    this.refresh();
    this.shopPanel?.refresh(this.state, '');
    spawnStatChanges(this, result.changes, 640, 120);
    showNotices(this, result.notices, 560);
  }

  openBrain() {
    if (!this.canOpen()) return;
    this.brainPanel = new BrainHolePanel(
      this,
      this.state,
      (index) => this.onDig(index),
      () => {
        this.brainPanel?.destroy();
        this.brainPanel = null;
      },
    );
  }

  onDig(index) {
    if (!this.brainPanel) return;
    const result = digHole(this.state, index);
    if (!result.ok) {
      this.brainPanel.refresh(this.state, result.reason || '现在挖不了');
      return;
    }
    saveState(this.state);
    playSfx(this, result.cloud ? 'cloud' : 'dig');
    this.bus.emit('state-changed', { changes: result.changes, x: 640, y: 280 });
    this.brainPanel?.refresh(this.state, result.cloud ? '乌云：精力白花了。压力降下来，乌云就少了。' : '');
  }

  onPlan(skill) {
    if (this.busy || this.modalOpen()) return { ok: false };
    const result = planSkill(this.state, skill);
    if (result.ok) saveState(this.state);
    this.refresh();
    this.arrangePanel?.refresh(this.state);
    if (!result.ok) this.arrangeNote(result.reason || '现在排不了');
    return result;
  }

  arrangeNote(text) {
    if (!this.arrangePanel?.note) return;
    this.arrangePanel.note.setText(text);
    this.arrangePanel.note.setColor('#a33b32');
  }

  onUnplan(index) {
    if (this.busy || this.modalOpen()) return;
    if (!unplanAt(this.state, index).ok) return;
    saveState(this.state);
    this.refresh();
    this.arrangePanel?.refresh(this.state);
  }

  onClearPlan() {
    if (this.busy || this.modalOpen()) return;
    clearPlan(this.state);
    saveState(this.state);
    this.refresh();
    this.arrangePanel?.refresh(this.state);
  }

  onRepeatPlan() {
    if (this.busy || this.modalOpen()) return;
    const result = repeatLastPlan(this.state);
    saveState(this.state);
    this.refresh();
    this.arrangePanel?.refresh(this.state);
    if (!result.ok) this.arrangeNote(result.reason);
  }

  onLearn(skill) {
    if (!this.canOpen()) return;
    this.time.delayedCall(0, () => {
      const result = learnSkill(this.state, skill);
      if (!result.ok) return;
      saveState(this.state);
      playSfx(this, 'learn');
      this.bus.emit('state-changed', { changes: result.changes, x: 1100, y: 200 });
    });
  }

  onEndRound() {
    if (this.busy || this.modalOpen() || this.state.endingId) return;
    const panel = this.arrangePanel;
    this.arrangePanel = null;
    const go = () => {
      this.busy = true;
      const committed = commitPlan(this.state);
      if (committed.count > 0) {
        if (committed.money > 0) playSfx(this, 'coin');
        this.bus.emit('state-changed', { changes: committed.changes, x: 420, y: 360 });
      }
      const outcome = endRound(this.state);
      saveState(this.state);
      showNotices(this, outcome.notices);
      if (outcome.type === 'event') {
        this.refresh();
        this.showEvent(outcome.event);
        return;
      }
      this.afterSettle(outcome);
    };
    if (panel) {
      this.time.delayedCall(0, () => {
        panel.destroy();
        go();
      });
    } else {
      go();
    }
  }

  showEvent(event) {
    this.busy = true;
    this.eventPanel = new EventPanel(this, event, this.state, (index) => this.onEventChoice(index));
  }

  onEventChoice(index) {
    if (!this.eventPanel) return;
    const panel = this.eventPanel;
    this.eventPanel = null;
    this.time.delayedCall(0, () => {
      panel.destroy();
      const { changes, notices } = resolveEventChoice(this.state, index);
      this.bus.emit('state-changed', { changes, x: 640, y: 340 });
      showNotices(this, notices);
      const outcome = advance(this.state);
      saveState(this.state);
      this.afterSettle(outcome);
    });
  }

  afterSettle(outcome) {
    if (outcome.type === 'ending') {
      saveState(this.state);
      this.time.delayedCall(300, () => this.scene.start(SCENE.ENDING));
      return;
    }
    if (outcome.type === 'next') playSfx(this, 'stage');
    this.refresh();
    if (outcome.expectReward) {
      const { insight, money, satisfaction } = outcome.expectReward;
      spawnStatChanges(this, { insight, money, satisfaction }, 155, 600);
    }
    if (this.state.pendingIntro) {
      this.showIntro();
      return;
    }
    if (this.state.pendingAspire) {
      this.showAspire(this.state.pendingAspire);
      return;
    }
    this.busy = false;
  }

  showIntro() {
    this.busy = true;
    this.intro = new StageIntro(this, this.state, () => {
      this.intro = null;
      this.state.pendingIntro = false;
      saveState(this.state);
      this.refresh();
      if (this.state.pendingAspire) {
        this.showAspire(this.state.pendingAspire);
        return;
      }
      this.busy = false;
    });
  }

  showAspire(question) {
    this.busy = true;
    this.aspirePanel = new AspirationPanel(this, this.state, question, (id) => {
      const panel = this.aspirePanel;
      this.aspirePanel = null;
      this.time.delayedCall(0, () => {
        panel?.destroy();
        answerAspire(this.state, question, id);
        saveState(this.state);
        this.busy = false;
        this.refresh();
      });
    });
  }

  togglePause() {
    if (this.eventPanel || this.aspirePanel || this.intro) return;
    if (this.pausePanel) {
      this.pausePanel.destroy();
      this.pausePanel = null;
      this.busy = false;
      this.refresh();
      return;
    }
    this.closeArrange();
    ['profilePanel', 'brainPanel', 'shopPanel'].forEach((key) => {
      this[key]?.destroy();
      this[key] = null;
    });
    this.busy = true;
    this.pausePanel = new PausePanel(this, {
      onResume: () => this.time.delayedCall(0, () => this.togglePause()),
      onRestart: () => this.time.delayedCall(0, () => this.restartGame()),
      onMenu: () => this.time.delayedCall(0, () => this.backToMenu()),
    });
  }

  /** 重新开始：同一个名字、同一个性别，从婴儿重来。 */
  restartGame() {
    const { name, gender } = this.state.child;
    const next = GameState.createNew({ name, gender });
    this.setState(next);
    saveState(next);
    this.scene.start(SCENE.GAME);
  }

  backToMenu() {
    saveState(this.state);
    this.scene.start(SCENE.MENU);
  }

  teardown() {
    if (this.offState) this.offState();
    PANELS.forEach((key) => this[key]?.destroy());
  }
}
