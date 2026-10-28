/**
 * 文件：src/data/stages.js
 * 作用：四个成长时期。顺序就是游戏推进的顺序。
 *
 * 字段说明：
 * - rounds：这个时期有几个回合。婴儿 3、幼儿园 4、初中 5、高中 7。
 * - allowance：进入这个时期时家里进账多少。
 * - drift：每回合结束时孩子自己的变化（主要是压力慢慢往上走）。
 * - satDrift：每回合父母满意度自己掉多少。孩子越大，父母越着急。
 * - expect：左下角的「当前期望」。这个时期最后一回合结束时，key 达到 target 就发 reward。
 * - blurb：换期过场上的一句话。{name} 是孩子的名字，{ta} 是他 / 她。
 */

export const STAGES = [
  {
    index: 0,
    id: 'baby',
    grade: '婴儿',
    age: 1,
    rounds: 3,
    faceOk: '👶',
    faceBad: '😭',
    blurb: '{name}还不会说话。你安排的每一件事，都是{ta}认识这个家的方式。',
    allowance: 0,
    expect: { title: '健康长大', key: 'physique', target: 40, reward: { insight: 6 } },
    drift: { stress: 1 },
    satDrift: -1,
  },
  {
    index: 1,
    id: 'kinder',
    grade: '幼儿园',
    age: 5,
    rounds: 4,
    faceOk: '🧒',
    faceBad: '😣',
    blurb: '{name}开始有了自己的不愿意。兴趣班和午睡，第一次要你选。',
    allowance: 40,
    expect: { title: '脑子里有画', key: 'imagination', target: 60, reward: { money: 30 } },
    drift: { stress: 2 },
    satDrift: -2,
  },
  {
    index: 2,
    id: 'middle',
    grade: '初中',
    age: 13,
    rounds: 5,
    faceOk: '🙂',
    faceBad: '😐',
    blurb: '作业、同学和补习挤在同一张桌子上。{name}开始看你的脸色。商店开门了。',
    allowance: 60,
    expect: { title: '记得住事', key: 'memory', target: 90, reward: { insight: 8 } },
    drift: { stress: 3 },
    satDrift: -3,
  },
  {
    index: 3,
    id: 'high',
    grade: '高中',
    age: 17,
    rounds: 7,
    faceOk: '🧑',
    faceBad: '😫',
    blurb: '最后一段。卷子和睡眠在抢同一个晚上，七个回合之后就是高考。',
    allowance: 60,
    expect: { title: '能好好说话', key: 'eq', target: 120, reward: { money: 40 } },
    drift: { stress: 3 },
    satDrift: -3,
  },
];

export function stageCount() {
  return STAGES.length;
}

export function getStage(yearIndex) {
  return STAGES[yearIndex] || STAGES[STAGES.length - 1];
}

/** 一局一共多少回合。 */
export function totalRounds() {
  return STAGES.reduce((sum, stage) => sum + stage.rounds, 0);
}

/** 从现在到高考还剩几个回合（含当前回合）。 */
export function roundsLeft(yearIndex, round) {
  let left = getStage(yearIndex).rounds - round + 1;
  for (let index = yearIndex + 1; index < STAGES.length; index += 1) left += STAGES[index].rounds;
  return left;
}
