/**
 * 文件：src/data/endings.js
 * 作用：结局表。判断时从上到下，第一条成立的就是结局。
 * 所以「崩溃」必须写在「高分胜利」前面，否则压力爆了的人也会被算成赢。
 *
 * 想让某种结局更容易：改 test 里的数字。
 * 想加结局：插入一块，并决定它放在哪一条前面。最后一条建议保持「其余情况」。
 *
 * result 只能是 win 或 lose。结局页用它显示「赢 / 输」，并允许重开。
 */

export const ENDINGS = [
  {
    id: 'burnout',
    result: 'lose',
    title: '台灯下的空座位',
    badge: '输',
    text: '压力把作息压垮了。小满后来几天没有进教室。\n毕业考那一栏是空的。卷子还没发，人先不在座位上。',
    test: (stats) => stats.stress >= 90 || stats.mood <= 20,
  },
  {
    id: 'empty',
    result: 'lose',
    title: '通知书是凉的',
    badge: '输',
    text: '分数很高，小满却不跟你说话。\n通知书放在桌上，晚饭是各自吃完的。\n你赢了排名，没留住这个晚上。',
    test: (stats) => stats.study >= 80 && (stats.mood <= 48 || stats.stress >= 76),
  },
  {
    id: 'steady',
    result: 'win',
    title: '准时开饭',
    badge: '赢',
    text: '小满走进了想去的学校。\n晚上六点，晚饭还是热的。\n这一局，分数和人一起到了终点。',
    test: (stats) => stats.study >= 70 && stats.mood >= 45 && stats.stress <= 72,
  },
  {
    id: 'childhood',
    result: 'win',
    title: '球场比奖状响',
    badge: '赢',
    text: '通知书不是最亮的那一张。\n可小满还愿意把球鞋丢在门口。\n人先回到家，分数排在后面。',
    test: (stats) => stats.study >= 32 && stats.study < 70 && stats.mood >= 68 && stats.stress <= 60 && stats.body >= 52,
  },
  {
    id: 'unprepared',
    result: 'lose',
    title: '差一次举手',
    badge: '输',
    text: '该熟悉的内容还不熟，名单上没有小满的名字。\n四个时期里，有的练习被一次次让开了。',
    test: () => true,
  },
];
