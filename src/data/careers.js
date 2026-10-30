/**
 * 文件：src/data/careers.js
 * 作用：八个职业，也是八种大结局的「去向」。
 * needs 里写七项属性的门槛，全部达到才算够格。exam 是高考分数的门槛，只有医生要。
 * stories 按擦线 / 够格 / 远超三档写，结局页按超出门槛最少的那一项来选。
 */

export const CAREERS = [
  {
    id: 'scientist',
    name: '科学家',
    direction: 'science',
    needs: { iq: 150, memory: 120 },
    line: '实验室的灯，总比别处晚关一点。',
    stories: {
      barely: '实验室要到{ta}了。实验记录偶尔写错日期，那只被拆过的闹钟还在抽屉里，盖子有时合不严。',
      solid: '{name}把小时候拆坏的那只闹钟留到了现在。\n现在{ta}拆的是更难的东西，也会装回去了。',
      peak: '导师把钥匙交给{ta}时说：灯可以比别人晚关。\n那只闹钟也修好了，滴答很稳。有人来实验室，会先问{name}。',
    },
  },
  {
    id: 'doctor',
    name: '医生',
    direction: 'science',
    needs: { iq: 140, eq: 115 },
    exam: 70,
    line: '先听你说哪里疼。',
    stories: {
      barely: '白大褂袖口还要挽两道。夜班第一次，{ta}在走廊里把急救步骤又默了一遍。',
      solid: '白大褂第一次穿上有点大。\n{ta}记得小时候发烧，你在床边坐了一整夜。',
      peak: '有人专门来找「那个会先听完的医生」。\n你发烧那一夜，{name}一直记得，也让后来的人少等一会儿。',
    },
  },
  {
    id: 'writer',
    name: '作家',
    direction: 'arts',
    needs: { imagination: 150, eq: 115 },
    line: '这一章，写的是晚饭前的厨房。',
    stories: {
      barely: '第一本薄薄的集子印了八百册。扉页那句「给总问然后呢的人」，编辑说可以再改，{ta}没改。',
      solid: '第一本书的扉页写着：给那个总问「然后呢」的人。\n你知道那说的是你。',
      peak: '有人在书店把那本厨房的故事翻到软了。\n{name}后来写的每一本，开头仍像晚饭前有人在问：然后呢。',
    },
  },
  {
    id: 'designer',
    name: '设计师',
    direction: 'arts',
    needs: { imagination: 140, charm: 115 },
    line: '把每天要用的东西，做得好看一点。',
    stories: {
      barely: '第一把椅子腿还要垫一块纸才稳。放在饭桌旁，你坐上去，说：能用。',
      solid: '{ta}设计的第一把椅子，放在了家里的饭桌旁。\n坐上去刚刚好。',
      peak: '后来有人按{ta}的图，把一整间厨房重新排过。\n家里那把椅子还在原处，漆已经亮了。',
    },
  },
  {
    id: 'athlete',
    name: '运动员',
    direction: 'stage',
    needs: { physique: 150, charm: 95 },
    line: '最后一百米，我听得见看台。',
    stories: {
      barely: '第一次正式上场，名次在中游。球鞋还是乱丢。你没再念{ta}，只把鞋摆回门口。',
      solid: '奖牌挂在门口的鞋柜上面。\n球鞋还是乱丢，你没再说{ta}。',
      peak: '看台喊{name}的名字时，{ta}跑最后一百米仍听得见。\n奖牌不止一块。鞋柜上那双旧鞋，你一直没扔。',
    },
  },
  {
    id: 'host',
    name: '主持人',
    direction: 'stage',
    needs: { charm: 140, face: 100 },
    line: '大家好，欢迎收看今晚的节目。',
    stories: {
      barely: '校园晚会那次，提词卡捏出了褶。说完开场白，{ta}自己都松了一口气。',
      solid: '幼儿园那次只唱了一句，就跑下台了。\n现在{ta}一个人站在灯下，说得很稳。',
      peak: '晚饭时间，有人专门把频道停在{ta}这一档。\n{name}开口仍像对着家里那面镜子，只是灯亮了许多。',
    },
  },
  {
    id: 'lawyer',
    name: '律师',
    direction: 'people',
    needs: { eq: 125, face: 100, memory: 115 },
    line: '请让我把话说完。',
    stories: {
      barely: '第一次开庭，稿子边翻边说。休庭时{ta}在走廊把对方的句子又默了一遍。',
      solid: '{ta}替别人把话说清楚。\n回家以后，也会先听你把话说完。',
      peak: '有人专门来找「能把话说完的那位」。\n{name}在外面替人争完，进门仍先把筷子递给别人。',
    },
  },
  {
    id: 'teacher',
    name: '教师',
    direction: 'people',
    needs: { eq: 135, memory: 105 },
    line: '这道题，我们换个方法再看一遍。',
    stories: {
      barely: '第一堂课，粉笔灰沾了一袖。有个孩子举手又放下，{ta}看见了，把那道题又讲了一遍。',
      solid: '讲台下坐着四十个和{ta}当年一样大的孩子。\n{ta}记得哪句话让人想举手。',
      peak: '有学生毕业以后写信来，说记得{ta}说的那句「换个方法再看」。\n{name}把信放进第一本备课本里。',
    },
  },
];

export function getCareer(id) {
  return CAREERS.find((career) => career.id === id) || null;
}

export function careersOf(direction) {
  return CAREERS.filter((career) => career.direction === direction);
}

/** 七项属性和高考分数是否都够这个职业。 */
export function meetsCareer(career, sheet, examScore = 0) {
  if (!career) return false;
  const statsOk = Object.entries(career.needs).every(([key, need]) => (sheet[key] ?? 0) >= need);
  const examOk = !career.exam || examScore >= career.exam;
  return statsOk && examOk;
}

/** 离门槛还差多少，加总起来。0 表示已经够格。用来挑「最接近」的职业。 */
export function careerGap(career, sheet) {
  return Object.entries(career.needs)
    .reduce((sum, [key, need]) => sum + Math.max(0, need - (sheet[key] ?? 0)), 0);
}

/** 超出门槛多少，加总起来。几个职业都够格时，挑最拿手的那个。 */
export function careerMargin(career, sheet) {
  return Object.entries(career.needs)
    .reduce((sum, [key, need]) => sum + ((sheet[key] ?? 0) - need), 0);
}

/** 擦线：最紧的一项超出不到 15。远超：每一项都超出 40 以上。 */
export function careerTier(career, sheet) {
  if (!career) return 'solid';
  const overs = Object.entries(career.needs).map(([key, need]) => (sheet[key] ?? 0) - need);
  const minOver = Math.min(...overs);
  if (minOver < 15) return 'barely';
  if (minOver >= 40) return 'peak';
  return 'solid';
}

export function careerStory(career, sheet) {
  const tier = careerTier(career, sheet);
  return career.stories?.[tier] || career.stories?.solid || '';
}
