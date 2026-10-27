/**
 * 文件：src/data/stages.js
 * 作用：四个成长时期。顺序就是游戏推进的顺序。
 * 每个时期有自己的年龄、说明、生活费、自动变化，以及能安排的活动 id。
 * 活动的具体效果在 actions.js。这里只决定「这个时期看得到哪些按钮」。
 */

export const STAGES = [
  {
    index: 0,
    id: 'baby',
    grade: '婴儿',
    age: 1,
    faceOk: '👶',
    faceBad: '😭',
    blurb: '小满还不会说话。你安排的每一件事，都是他认识这个家的方式。',
    allowance: 0,
    drift: { stress: 4 },
    actionIds: ['soothe', 'early-edu', 'toy', 'food', 'baby-class'],
  },
  {
    index: 1,
    id: 'kinder',
    grade: '幼儿园',
    age: 5,
    faceOk: '🧒',
    faceBad: '😣',
    blurb: '小满开始有了自己的不愿意。兴趣班和午睡，第一次要你选。',
    allowance: 40,
    drift: { stress: 6, study: -2 },
    actionIds: ['play', 'letters', 'park', 'hobby', 'nap'],
  },
  {
    index: 2,
    id: 'middle',
    grade: '初中',
    age: 13,
    faceOk: '🙂',
    faceBad: '😐',
    blurb: '作业、同学和补习挤在同一张桌子上。小满开始看你的脸色。',
    allowance: 45,
    drift: { stress: 8, study: -3 },
    actionIds: ['homework', 'tutor', 'sport', 'rest', 'outing'],
  },
  {
    index: 3,
    id: 'high',
    grade: '高中',
    age: 17,
    faceOk: '🧑',
    faceBad: '😫',
    blurb: '最后一段。卷子和睡眠在抢同一个晚上，选完就去高考。',
    allowance: 50,
    drift: { stress: 10, study: -4 },
    actionIds: ['drill', 'cram', 'run', 'sleep', 'walk'],
  },
];

export function stageCount() {
  return STAGES.length;
}

export function getStage(yearIndex) {
  return STAGES[yearIndex] || STAGES[STAGES.length - 1];
}
