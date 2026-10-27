/**
 * 文件：src/scenes/GameScene.js
 * 作用：培养界面。左边属性与安排，中间点孩子进脑洞，右边用悟性学习。
 * 属性怎么加减，写在 systems/。这里只接收点击、调用规则、刷新画面。
 */

import { GAME_HEIGHT, GAME_WIDTH, SCENE, inkText } from '../config/constants.js';
import { learnedSkillList } from '../data/skills.js';
import BaseScene from '../core/BaseScene.js';
import EventBus from '../core/EventBus.js';
import GameState from '../core/GameState.js';
import { saveState } from '../core/SaveManager.js';
import { spawnStatChanges } from '../effects/FloatingText.js';
import { getEventById } from '../systems/EventSystem.js';
import { clearPlan, commitPlan, digHole, learnSkill, planSkill, unplanAt } from '../systems/SheetSystem.js';
import { beginYearEnd, resolveEventChoice, settleYear } from '../systems/TimeSystem.js';
import ArrangePanel from '../ui/ArrangePanel.js';
import AttributePanel from '../ui/AttributePanel.js';
import BrainHolePanel from '../ui/BrainHolePanel.js';
import CenterChild from '../ui/CenterChild.js';
import EventPanel from '../ui/EventPanel.js';
import PausePanel from '../ui/PausePanel.js';
import ProfilePanel from '../ui/ProfilePanel.js';
import SkillPanel from '../ui/SkillPanel.js';
import TopBar from '../ui/TopBar.js';

export default class GameScene extends BaseScene {
  constructor() {
    super(SCENE.GAME);
  }

  create() {
    if (!this.bus) this.registry.set('bus', new EventBus());
    if (!this.state) this.setState(GameState.createNew());

    this.busy = false;
    this.eventPanel = null;
    this.pausePanel = null;
    this.arrangePanel = null;
    this.profilePanel = null;
    this.brainPanel = null;

    this.paintRoom();
    this.topBar = new TopBar(this, {
      onAvatar: () => this.openProfile(),
      onPause: () => this.togglePause(),
    });
    this.attributes = new AttributePanel(this, () => this.openArrange());
    this.childView = new CenterChild(this, () => this.openBrain());
    this.skills = new SkillPanel(this, (skill) => this.onLearn(skill));
    this.logText = this.add.text(640, 688, '', inkText(14, '#2c2416')).setOrigin(0.5).setDepth(5);

    this.offState = this.bus.on('state-changed', (payload) => {
      this.refresh();
      if (payload?.changes) {
        spawnStatChanges(this, payload.changes, payload.x ?? 640, payload.y ?? 340);
      }
    });

    this.bindKeys();
    this.refresh();
    this.events.once('shutdown', () => this.teardown());

    if (this.state.pendingEventId) {
      const event = getEventById(this.state.pendingEventId);
      if (event) this.showEvent(event);
    }
  }

  paintRoom() {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0xf0e2cc, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0xe4d2b4, 1);
    g.fillRect(0, 430, GAME_WIDTH, GAME_HEIGHT - 430);
    g.fillStyle(0x8eb4c9, 1);
    g.fillRoundedRect(760, 120, 190, 130, 8);
    g.lineStyle(8, 0xc4a484, 1);
    g.strokeRoundedRect(760, 120, 190, 130, 8);
    g.fillStyle(0xf2d7a2, 0.9);
    g.fillCircle(980, 150, 22);
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
      this.onEndYear();
    });
    keyboard.on('keydown-ESC', (event) => {
      if (event && event.repeat) return;
      this.togglePause();
    });
  }

  refresh() {
    this.topBar.refresh(this.state);
    this.attributes.refresh(this.state);
    this.childView.refresh(this.state);
    this.skills.refresh(this.state);
    const line = this.state.log[0] || '';
    this.logText.setText(line.length > 36 ? `${line.slice(0, 36)}…` : line);
  }

  modalOpen() {
    return Boolean(this.eventPanel || this.pausePanel || this.profilePanel || this.brainPanel);
  }

  openArrange() {
    if (this.busy || this.modalOpen() || this.arrangePanel) return;
    this.arrangePanel = new ArrangePanel(
      this,
      this.state,
      (skill) => this.onPlan(skill),
      (index) => this.onUnplan(index),
      () => this.onClearPlan(),
      () => this.onEndYear(),
      () => this.closeArrange(),
    );
  }

  closeArrange() {
    this.arrangePanel?.destroy();
    this.arrangePanel = null;
  }

  openProfile() {
    if (this.busy || this.modalOpen() || this.arrangePanel) return;
    this.profilePanel = new ProfilePanel(this, this.state, () => {
      this.profilePanel?.destroy();
      this.profilePanel = null;
    });
  }

  openBrain() {
    if (this.busy || this.modalOpen() || this.arrangePanel) return;
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
      this.brainPanel.hint?.setText(result.reason || '现在挖不了');
      this.brainPanel.hint?.setColor('#a33b32');
      return;
    }
    saveState(this.state);
    this.bus.emit('state-changed', { changes: result.changes, x: 640, y: 280 });
    this.brainPanel?.refresh(this.state);
  }

  onPlan(skill) {
    if (this.busy || this.modalOpen()) return { ok: false };
    const result = planSkill(this.state, skill);
    if (result.ok) saveState(this.state);
    this.refresh();
    this.arrangePanel?.refresh(this.state);
    if (!result.ok && this.arrangePanel?.note) {
      this.arrangePanel.note.setText(result.reason || '现在排不了');
      this.arrangePanel.note.setColor('#a33b32');
    }
    return result;
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

  onLearn(skill) {
    if (this.busy || this.modalOpen() || this.arrangePanel) return;
    this.time.delayedCall(0, () => {
      const result = learnSkill(this.state, skill);
      if (!result.ok) return;
      saveState(this.state);
      this.bus.emit('state-changed', { changes: result.changes, x: 1100, y: 200 });
    });
  }

  onEndYear() {
    if (this.busy || this.modalOpen()) return;
    const panel = this.arrangePanel;
    this.arrangePanel = null;
    const go = () => {
      this.busy = true;
      const committed = commitPlan(this.state);
      this.refresh();
      if (committed.count > 0) {
        this.bus.emit('state-changed', { changes: committed.changes, x: 420, y: 360 });
      }
      const outcome = beginYearEnd(this.state);
      saveState(this.state);
      if (outcome.type === 'event') {
        this.showEvent(outcome.event);
        return;
      }
      this.afterSettle(outcome);
    };
    if (panel) this.time.delayedCall(0, () => {
      panel.destroy();
      go();
    });
    else go();
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
      const { changes } = resolveEventChoice(this.state, index);
      this.bus.emit('state-changed', { changes, x: 640, y: 340 });
      const outcome = settleYear(this.state);
      saveState(this.state);
      this.afterSettle(outcome);
    });
  }

  afterSettle(outcome) {
    if (outcome.type === 'ending') {
      saveState(this.state);
      this.scene.start(SCENE.ENDING);
      return;
    }
    this.busy = false;
    this.refresh();
  }

  togglePause() {
    if (this.eventPanel) return;
    if (this.pausePanel) {
      this.pausePanel.destroy();
      this.pausePanel = null;
      this.busy = false;
      this.refresh();
      return;
    }
    this.closeArrange();
    if (this.profilePanel) {
      this.profilePanel.destroy();
      this.profilePanel = null;
    }
    if (this.brainPanel) {
      this.brainPanel.destroy();
      this.brainPanel = null;
    }
    this.busy = true;
    this.pausePanel = new PausePanel(this, {
      onResume: () => this.time.delayedCall(0, () => this.togglePause()),
      onRestart: () => this.time.delayedCall(0, () => this.restartGame()),
      onMenu: () => this.time.delayedCall(0, () => this.backToMenu()),
    });
  }

  restartGame() {
    const next = GameState.createNew();
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
    this.eventPanel?.destroy();
    this.pausePanel?.destroy();
    this.arrangePanel?.destroy();
    this.profilePanel?.destroy();
    this.brainPanel?.destroy();
  }
}
