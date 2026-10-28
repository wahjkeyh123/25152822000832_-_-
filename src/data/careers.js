/**
 * 文件：src/data/careers.js
 * 作用：八个职业，也是八种大结局的「去向」。
 * needs 里写七项属性的门槛，全部达到才算够格。exam 是高考分数的门槛，只有医生要。
 * 想让某个职业更容易：把 needs 里的数字调小。
 */

export const CAREERS = [
  {
    id: 'scientist',
    name: '科学家',
    direction: 'science',
    needs: { iq: 52, memory: 40 },
    line: '实验室的灯，总比别处晚关一点。',
    story: '小满把小时候拆坏的那只闹钟留到了现在。\n现在他拆的是更难的东西，也会装回去了。',
  },
  {
    id: 'doctor',
    name: '医生',
    direction: 'science',
    needs: { iq: 46, eq: 40 },
    exam: 70,
    line: '先听你说哪里疼。',
    story: '白大褂第一次穿上有点大。\n他记得小时候发烧，你在床边坐了一整夜。',
  },
  {
    id: 'writer',
    name: '作家',
    direction: 'arts',
    needs: { imagination: 52, eq: 36 },
    line: '这一章，写的是晚饭前的厨房。',
    story: '第一本书的扉页写着：给那个总问「然后呢」的人。\n你知道那说的是你。',
  },
  {
    id: 'designer',
    name: '设计师',
    direction: 'arts',
    needs: { imagination: 46, charm: 38 },
    line: '把每天要用的东西，做得好看一点。',
    story: '他设计的第一把椅子，放在了家里的饭桌旁。\n坐上去刚刚好。',
  },
  {
    id: 'athlete',
    name: '运动员',
    direction: 'stage',
    needs: { physique: 52, charm: 30 },
    line: '最后一百米，我听得见看台。',
    story: '奖牌挂在门口的鞋柜上面。\n球鞋还是乱丢，你没再说他。',
  },
  {
    id: 'host',
    name: '主持人',
    direction: 'stage',
    needs: { charm: 46, face: 30 },
    line: '大家好，欢迎收看今晚的节目。',
    story: '幼儿园那次只唱了一句，就跑下台了。\n现在他一个人站在灯下，说得很稳。',
  },
  {
    id: 'lawyer',
    name: '律师',
    direction: 'people',
    needs: { eq: 40, face: 30, memory: 42 },
    line: '请让我把话说完。',
    story: '他替别人把话说清楚。\n回家以后，也会先听你把话说完。',
  },
  {
    id: 'teacher',
    name: '教师',
    direction: 'people',
    needs: { eq: 46, memory: 36 },
    line: '这道题，我们换个方法再看一遍。',
    story: '讲台下坐着四十个和他当年一样大的孩子。\n他记得哪句话让人想举手。',
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
