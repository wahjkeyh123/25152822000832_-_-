/**
 * 文件：src/data/endings.js
 * 作用：四类大结局。具体落在哪个职业，看 careers.js 里的门槛。
 * 判断顺序写在 systems/EndingSystem.js：
 * 1. 崩溃：压力或心情到了底线，不管属性多高都算输。
 * 2. 梦想成真：高中选的那个职业够格了。
 * 3. 换了一条路：志向没够上，但够上了别的职业。
 * 4. 还没想好的明天：一个职业都没够上。
 *
 * result 只能是 win 或 lose。结局页用它显示「赢 / 输」，并允许重开。
 */

export const ENDINGS = [
  {
    id: 'burnout',
    result: 'lose',
    title: '台灯下的空座位',
    badge: '输',
    text: '压力把作息压垮了。{name}后来几天没有进教室。\n离{near}最近，可毕业那一栏是空的。卷子还没发，人先不在座位上。',
  },
  {
    id: 'dream',
    result: 'win',
    title: '说到做到',
    badge: '赢',
    open: {
      barely: '高中那年选的路，{name}是擦着门槛走进去的。够上了，还要再走几年才稳。',
      solid: '高中那年说过的话，{name}真的做到了。',
      peak: '不止是够上了。{name}把这条路走成了别人会回头看的样子。',
    },
  },
  {
    id: 'detour',
    result: 'win',
    title: '换了一条路',
    badge: '赢',
    open: {
      barely: '和当初想的不一样。这条路也只是刚刚够到门口，可是{ta}自己走进去的。',
      solid: '和当初想的不一样。\n可这条路是{ta}自己走出来的，走得很稳。',
      peak: '不是当初那张志愿。可{name}走得比那张纸更远，也更像{ta}自己。',
    },
  },
  {
    id: 'drift',
    result: 'lose',
    title: '还没想好的明天',
    badge: '输',
    text: '毕业照拍完了，{name}还不知道明天去哪。\n离{near}最近，可十几年里哪一样都碰过，哪一样都没走深。',
  },
];

/** 压力或心情到了这条线，就是崩溃。 */
export function isBurnout(stats) {
  return stats.stress >= 90 || stats.mood <= 20;
}
