/**
 * 文件：src/data/events.js
 * 作用：每个时期结束时可能插入的二选一。
 * yearIndex 从 0 开始：0 婴儿，1 幼儿园，2 初中，3 高中。
 * priority 越大越优先。高中那一晚的优先级最高，不会被别的事挤掉。
 */

export const EVENTS = [
  {
    id: 'night-cry',
    priority: 5,
    when: (state) => state.yearIndex === 0,
    title: '夜里醒了',
    text: '小满哭出了声。房间很黑，你还没躺下。',
    choices: [
      { text: '抱起来，慢慢拍', money: 0, effects: { mood: 8, stress: -6 } },
      { text: '让他自己哭一会儿', money: 0, effects: { mood: -8, stress: 6, study: 2 } },
    ],
  },
  {
    id: 'skip-class',
    priority: 5,
    when: (state) => state.yearIndex === 1,
    title: '今天不想去',
    text: '兴趣班的包已经背上了。\n小满站在门口，摇头。',
    choices: [
      { text: '今天不去了', money: 0, effects: { mood: 8, stress: -6, study: -2 } },
      { text: '还是得去', money: 0, effects: { study: 6, stress: 8, mood: -6 } },
    ],
  },
  {
    id: 'stomachache',
    priority: 12,
    when: (state) => state.yearIndex === 2 && state.child.stats.stress >= 72,
    title: '门口的书包',
    text: '小满说肚子疼，额头并不烫。\n书包已经背上了，人却站着不动。',
    choices: [
      { text: '请假，在家躺半天', money: 0, effects: { stress: -12, mood: 8, study: -4 } },
      { text: '还是去上学', money: 0, effects: { study: 4, stress: 8, mood: -6 } },
    ],
  },
  {
    id: 'after-school',
    priority: 5,
    when: (state) => state.yearIndex === 2,
    title: '同学在楼下等',
    text: '有人在楼下喊小满的名字。\n作业才写了一半。',
    choices: [
      { text: '下去玩一会儿', money: -6, effects: { mood: 8, stress: -6, study: -2, body: 4 } },
      { text: '把这一页写完', money: 0, effects: { study: 6, stress: 6, mood: -4 } },
    ],
  },
  {
    id: 'last-night',
    priority: 20,
    when: (state) => state.yearIndex === 3,
    title: '高考前一晚',
    text: '灯还亮着。小满问：\n今晚能不能不管我？',
    choices: [
      { text: '再做一套卷子', money: 0, effects: { study: 8, stress: 10, mood: -8 } },
      { text: '准时关灯睡觉', money: 0, effects: { stress: -10, mood: 10 } },
    ],
  },
];

export function getEventById(id) {
  return EVENTS.find((event) => event.id === id) || null;
}
