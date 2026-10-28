/**
 * 文件：src/core/GameState.js
 * 作用：这一局的全部进度。存档就是把它变成普通对象放进浏览器。
 * 场景可以读它、通过系统函数改它，不要在界面文件里直接写属性公式。
 */

import { SAVE_VERSION } from '../config/constants.js';
import { BOARD_SIZE, buildBoard } from '../data/board.js';
import Child from '../models/Child.js';
import Household from '../models/Household.js';

const FIRST_LOG = '从小满还是婴儿开始。先学技能，再到「安排」里排进本轮。';

export default class GameState {
  constructor(raw = {}) {
    this.version = SAVE_VERSION;
    this.seed = raw.seed ?? (Date.now() % 1000000);
    this.yearIndex = raw.yearIndex ?? 0;
    this.child = raw.child instanceof Child ? raw.child : new Child(raw.child);
    this.household = raw.household instanceof Household ? raw.household : new Household(raw.household);
    this.log = Array.isArray(raw.log) ? [...raw.log] : [FIRST_LOG];
    this.seenEvents = Array.isArray(raw.seenEvents) ? [...raw.seenEvents] : [];
    this.pendingEventId = raw.pendingEventId ?? null;
    this.actionsThisYear = Array.isArray(raw.actionsThisYear) ? [...raw.actionsThisYear] : [];
    this.plan = Array.isArray(raw.plan) ? [...raw.plan] : [];
    this.learnedSkills = Array.isArray(raw.learnedSkills) ? [...raw.learnedSkills] : [];
    /** 买过的职业书 id。 */
    this.books = Array.isArray(raw.books) ? [...raw.books] : [];
    /** 初中选的方向、高中选的职业。没选时是 null。 */
    this.aspiration = { direction: null, career: null, ...(raw.aspiration || {}) };
    /** 进入初中或高中时还没回答的志向问题：'direction' 或 'career'。 */
    this.pendingAspire = raw.pendingAspire ?? null;
    /** 已经完成的「当前期望」，记的是时期 id。 */
    this.expectDone = Array.isArray(raw.expectDone) ? [...raw.expectDone] : [];
    const savedBoard = Array.isArray(raw.board) && raw.board.length === BOARD_SIZE ? raw.board : null;
    this.board = savedBoard ? [...savedBoard] : buildBoard(this.seed, this.yearIndex, this.child.stats.stress);
    this.dug = savedBoard && Array.isArray(raw.dug) ? [...raw.dug] : [];
    this.exam = raw.exam ?? null;
    this.endingId = raw.endingId ?? null;
    /** 结局落在哪个职业上。没有够格的职业时是 null。 */
    this.career = raw.career ?? null;
  }

  static createNew() {
    return new GameState({
      seed: Date.now() % 1000000,
      log: [FIRST_LOG],
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
      books: this.books,
      aspiration: this.aspiration,
      pendingAspire: this.pendingAspire,
      expectDone: this.expectDone,
      dug: this.dug,
      board: this.board,
      exam: this.exam,
      endingId: this.endingId,
      career: this.career,
    };
  }

  /** 最新的一句放在最前面，只留 5 句，避免界面被旧记录撑满。 */
  pushLog(line) {
    this.log.unshift(line);
    this.log = this.log.slice(0, 5);
  }
}
