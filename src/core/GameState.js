/**
 * 文件：src/core/GameState.js
 * 作用：这一局的全部进度。存档就是把它变成普通对象放进浏览器。
 * 场景可以读它、通过系统函数改它，不要在界面文件里直接写属性公式。
 */

import { SAVE_VERSION } from '../config/constants.js';
import { buildBoard } from '../data/board.js';
import Child from '../models/Child.js';
import Household from '../models/Household.js';

export default class GameState {
  constructor(raw = {}) {
    this.version = SAVE_VERSION;
    this.seed = raw.seed ?? (Date.now() % 1000000);
    this.yearIndex = raw.yearIndex ?? 0;
    this.child = raw.child instanceof Child ? raw.child : new Child(raw.child);
    this.household = raw.household instanceof Household ? raw.household : new Household(raw.household);
    this.log = Array.isArray(raw.log) ? [...raw.log] : ['从小满还是婴儿开始。这一轮可以安排 5 个学会的技能。'];
    this.seenEvents = Array.isArray(raw.seenEvents) ? [...raw.seenEvents] : [];
    this.pendingEventId = raw.pendingEventId ?? null;
    this.actionsThisYear = Array.isArray(raw.actionsThisYear) ? [...raw.actionsThisYear] : [];
    this.plan = Array.isArray(raw.plan) ? [...raw.plan] : [];
    this.learnedSkills = Array.isArray(raw.learnedSkills) ? [...raw.learnedSkills] : [];
    const savedBoard = Array.isArray(raw.board) && raw.board.length === 72 ? raw.board : null;
    const boardReady = Boolean(savedBoard && savedBoard.includes('insight'));
    this.board = boardReady ? [...savedBoard] : buildBoard(this.seed, this.yearIndex);
    this.dug = boardReady && Array.isArray(raw.dug) ? [...raw.dug] : [];
    this.exam = raw.exam ?? null;
    this.endingId = raw.endingId ?? null;
  }

  static createNew() {
    return new GameState({
      seed: Date.now() % 1000000,
      log: ['从小满还是婴儿开始。这一轮可以安排 5 个学会的技能。'],
    });
  }

  static fromJSON(raw) {
    return new GameState(raw);
  }

  toJSON() {
    return {
      version: this.version,
      seed: this.seed,
      yearIndex: this.yearIndex,
      child: this.child.toJSON(),
      household: this.household.toJSON(),
      log: this.log,
      seenEvents: this.seenEvents,
      pendingEventId: this.pendingEventId,
      actionsThisYear: this.actionsThisYear,
      plan: this.plan,
      learnedSkills: this.learnedSkills,
      dug: this.dug,
      board: this.board,
      exam: this.exam,
      endingId: this.endingId,
    };
  }

  /** 最新的一句放在最前面，只留 5 句，避免界面被旧记录撑满。 */
  pushLog(line) {
    this.log.unshift(line);
    this.log = this.log.slice(0, 5);
  }
}
