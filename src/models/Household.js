/**
 * 文件：src/models/Household.js
 * 作用：家长手里的资源。金钱跨年保留。精力用来点脑洞，每期回复一半。
 */

import { ENERGY_MAX, INSIGHT_MAX, START_INSIGHT, START_MONEY } from '../config/constants.js';

export default class Household {
  constructor(raw = {}) {
    this.money = raw.money ?? START_MONEY;
    this.energy = raw.energy ?? ENERGY_MAX;
    this.energyMax = raw.energyMax ?? ENERGY_MAX;
    this.insight = raw.insight ?? START_INSIGHT;
    this.insightMax = raw.insightMax ?? INSIGHT_MAX;
  }

  toJSON() {
    return {
      money: this.money,
      energy: this.energy,
      energyMax: this.energyMax,
      insight: this.insight,
      insightMax: this.insightMax,
    };
  }
}
