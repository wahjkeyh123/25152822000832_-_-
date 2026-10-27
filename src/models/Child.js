/**
 * 文件：src/models/Child.js
 * 作用：孩子的数据，不是画面。
 * stats 是内部的四项，用来判断结局。sheet 是画面左边的七项。
 */

import { CHILD_NAME, START_STATS } from '../config/constants.js';
import { START_GROWTH, START_SHEET, sheetFromCore } from '../data/attributes.js';

export default class Child {
  constructor(raw = {}) {
    this.name = raw.name || CHILD_NAME;
    this.stats = {
      study: START_STATS.study,
      body: START_STATS.body,
      mood: START_STATS.mood,
      stress: START_STATS.stress,
      ...(raw.stats || {}),
    };
    if (raw.sheet) this.sheet = { ...START_SHEET, ...raw.sheet };
    else if (raw.stats) this.sheet = sheetFromCore(this.stats);
    else this.sheet = { ...START_SHEET };
    this.growth = { ...START_GROWTH, ...(raw.growth || {}) };
  }

  toJSON() {
    return {
      name: this.name,
      stats: { ...this.stats },
      sheet: { ...this.sheet },
      growth: { ...this.growth },
    };
  }
}
