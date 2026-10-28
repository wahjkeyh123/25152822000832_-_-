/**
 * 文件：src/models/Child.js
 * 作用：孩子的数据，不是画面。
 * stats 是内部的四项（学识、体质、心情、压力），心情和压力决定会不会崩溃。sheet 是画面左边的七项。
 * gender 是 'boy' 或 'girl'，决定立绘和文案里的「他 / 她」。
 */

import { CHILD_NAME, START_STATS } from '../config/constants.js';
import { START_GROWTH, START_SHEET, sheetFromCore } from '../data/attributes.js';

export default class Child {
  constructor(raw = {}) {
    this.name = raw.name || CHILD_NAME;
    this.gender = raw.gender === 'girl' ? 'girl' : 'boy';
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
      gender: this.gender,
      stats: { ...this.stats },
      sheet: { ...this.sheet },
      growth: { ...this.growth },
    };
  }
}
