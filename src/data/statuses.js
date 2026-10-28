/**
 * 文件：src/data/statuses.js
 * 作用：孩子身上的状态。有好有坏，持续几个回合，到期自动消失。
 * 什么时候触发写在 systems/MoodSystem.js：
 * - 压力满 100 → 心力交瘁（坏）
 * - 压力降到 0 → 无忧无虑（好）
 * - 父母满意度满 100 → 家里和睦（好），另外发随机属性和钱
 * - 父母满意度掉到 0 → 家里冷冰冰（坏）
 *
 * 效果字段：
 * - gainScale：技能和脑洞加的属性乘以这个数。
 * - skillBonus：每次执行技能，主加属性额外多加几点。
 * - digBonus：脑洞属性格额外多加几点。
 * - energyBonus：每回合额外回复的精力（负数就是少回复）。
 * - satScale：技能带来的满意度变化乘以这个数。
 * - perRound：每回合结束时对学识 / 体质 / 心情 / 压力的直接变化。
 */

export const STATUSES = {
  overwhelmed: {
    id: 'overwhelmed',
    label: '心力交瘁',
    kind: 'bad',
    rounds: 3,
    desc: '压力满了。技能和脑洞加的属性减半，精力少回 5 点，每回合心情 -4。',
    gainScale: 0.5,
    energyBonus: -5,
    perRound: { mood: -4 },
  },
  carefree: {
    id: 'carefree',
    label: '无忧无虑',
    kind: 'good',
    rounds: 2,
    desc: '一点压力都没有。脑洞属性格每格多加 2 点，每回合精力多回 5 点。',
    digBonus: 2,
    energyBonus: 5,
  },
  harmony: {
    id: 'harmony',
    label: '家里和睦',
    kind: 'good',
    rounds: 3,
    desc: '父母很满意。每次执行技能，主加属性多 2 点；每回合压力 -3。',
    skillBonus: 2,
    perRound: { stress: -3 },
  },
  cold: {
    id: 'cold',
    label: '家里冷冰冰',
    kind: 'bad',
    rounds: 2,
    desc: '父母很失望。技能带来的满意度减半，每回合压力 +4。',
    satScale: 0.5,
    perRound: { stress: 4 },
  },
};

export function getStatus(id) {
  return STATUSES[id] || null;
}
