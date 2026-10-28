/**
 * 文件：src/models/Household.js
 * 作用：家长手里的资源。金钱跨期保留。精力用来点脑洞，每回合回复一些。
 * satisfaction 是父母满意度，0 到 100。
 */

import {
  ENERGY_MAX, INSIGHT_MAX, START_INSIGHT, START_MONEY, START_SATISFACTION,
} from '../config/constants.js';

export default class Household {
  constructor(raw = {}) {
    this.money = raw.money ?? START_MONEY;
    this.energy = raw.energy ?? ENERGY_MAX;
    this.energyMax = raw.energyMax ?? ENERGY_MAX;
    this.insight = raw.insight ?? START_INSIGHT;
    this.insightMax = raw.insightMax ?? INSIGHT_MAX;
    this.satisfaction = raw.satisfaction ?? START_SATISFACTION;
  }

  toJSON() {
    return {
      money: this.money,
      energy: this.energy,
      energyMax: this.energyMax,
      insight: this.insight,
      insightMax: this.insightMax,
      satisfaction: this.satisfaction,
    };
  }
}
