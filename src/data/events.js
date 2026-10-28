/**
 * 文件：src/data/events.js
 * 作用：回合结束时可能插入的二选一。每件事只会出现一次。
 * yearIndex 从 0 开始：0 婴儿，1 幼儿园，2 初中，3 高中。round 是这个时期里的第几回合。
 * priority 越大越优先。高考前一晚的优先级最高，不会被别的事挤掉。
 *
 * 选项字段：effects 改学识 / 体质 / 心情 / 压力；money 改积蓄；sat 改父母满意度。
 * 文案里 {name} 是孩子的名字，{ta} 是他 / 她。
 */

const at = (yearIndex, round) => (state) => state.yearIndex === yearIndex && state.round === round;

export const EVENTS = [
  {
    id: 'first-step',
    priority: 5,
    when: at(0, 2),
    title: '扶着桌子站起来',
    text: '{name}抓着桌腿，晃了两下，站住了。\n你的手已经伸出去一半。',
    choices: [
      { text: '扶{ta}一把', money: 0, sat: 2, effects: { mood: 4, stress: -2 } },
      { text: '让{ta}自己试', money: 0, sat: 4, effects: { body: 4, stress: 2 } },
    ],
  },
  {
    id: 'night-cry',
    priority: 5,
    when: at(0, 3),
    title: '夜里醒了',
    text: '{name}哭出了声。房间很黑，你还没躺下。',
    choices: [
      { text: '抱起来，慢慢拍', money: 0, sat: -2, effects: { mood: 8, stress: -6 } },
      { text: '让{ta}自己哭一会儿', money: 0, sat: 3, effects: { mood: -8, stress: 6, study: 2 } },
    ],
  },
  {
    id: 'drawing-wall',
    priority: 5,
    when: at(1, 2),
    title: '墙上的画',
    text: '客厅的白墙上多了一只紫色的大象。\n{name}拿着蜡笔，看着你。',
    choices: [
      { text: '说清楚：墙不能画', money: 0, sat: 4, effects: { study: 2, mood: -4, stress: 3 } },
      { text: '给{ta}贴一张大白纸', money: -5, sat: -2, effects: { mood: 8, stress: -4 } },
    ],
  },
  {
    id: 'skip-class',
    priority: 5,
    when: at(1, 4),
    title: '今天不想去',
    text: '兴趣班的包已经背上了。\n{name}站在门口，摇头。',
    choices: [
      { text: '今天不去了', money: 0, sat: -5, effects: { mood: 8, stress: -6, study: -2 } },
      { text: '还是得去', money: 0, sat: 5, effects: { study: 6, stress: 8, mood: -6 } },
    ],
  },
  {
    id: 'after-school',
    priority: 5,
    when: at(2, 3),
    title: '同学在楼下等',
    text: '有人在楼下喊{name}的名字。\n作业才写了一半。',
    choices: [
      { text: '下去玩一会儿', money: -6, sat: -4, effects: { mood: 8, stress: -8, study: -2, body: 4 } },
      { text: '把这一页写完', money: 0, sat: 5, effects: { study: 6, stress: 6, mood: -4 } },
    ],
  },
  {
    id: 'stomachache',
    priority: 12,
    when: (state) => state.yearIndex === 2 && state.round === 5 && state.child.stats.stress >= 72,
    title: '门口的书包',
    text: '{name}说肚子疼，额头并不烫。\n书包已经背上了，人却站着不动。',
    choices: [
      { text: '请假，在家躺半天', money: 0, sat: -6, effects: { stress: -14, mood: 8, study: -4 } },
      { text: '还是去上学', money: 0, sat: 4, effects: { study: 4, stress: 8, mood: -6 } },
    ],
  },
  {
    id: 'parent-meeting',
    priority: 5,
    when: at(2, 5),
    title: '家长会',
    text: '排名贴在黑板旁边。\n别的家长在小声对比，{name}在走廊等你。',
    choices: [
      { text: '先问{ta}这学期开不开心', money: 0, sat: -3, effects: { mood: 8, stress: -6 } },
      { text: '回家把名次再往前提', money: 0, sat: 6, effects: { study: 5, stress: 8, mood: -5 } },
    ],
  },
  {
    id: 'mock-exam',
    priority: 5,
    when: at(3, 4),
    title: '一模没考好',
    text: '卷子折成了很小的一块，塞在书包最里面。\n{name}说：下次一定。',
    choices: [
      { text: '周末去爬山，不提分数', money: -10, sat: -5, effects: { mood: 10, stress: -10, body: 3 } },
      { text: '报一个冲刺班', money: -20, sat: 8, effects: { study: 8, stress: 10, mood: -6 } },
    ],
  },
  {
    id: 'last-night',
    priority: 20,
    when: at(3, 7),
    title: '高考前一晚',
    text: '灯还亮着。{name}问：\n今晚能不能不管我？',
    choices: [
      { text: '再做一套卷子', money: 0, sat: 4, effects: { study: 8, stress: 10, mood: -8 } },
      { text: '准时关灯睡觉', money: 0, sat: 0, effects: { stress: -10, mood: 10 } },
    ],
  },
];

export function getEventById(id) {
  return EVENTS.find((event) => event.id === id) || null;
}
