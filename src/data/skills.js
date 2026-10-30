/**
 * 文件：src/data/skills.js
 * 作用：右侧「学习」里的技能。学会要花悟性，效果写在七项属性上。
 * 学会只是解锁。真正加减属性，要在「安排」里排进本回合，结束本回合时才执行。
 *
 * 本期按五个时期换一批。婴儿、幼儿园只出自己的技能。
 * 小学到高中是一条线：学完上一档，下一档可以提前出现；到了该时期即使没学完上一档，新技能也会出现。
 * 每个时期另有两项娱乐技能，减压不超过 10，不锁前置。
 * 换期后，没学的上期技能不再出现；已经学会的仍可在「安排」里排。
 * 职业线在「职业」页，买了任意职业道具后出现。
 * 主加的那项属性越高，实际悟性消耗越低。
 *
 * 字段说明：
 * - stage：这项技能所属时期。小学到高中可以提前出现，见 getSkillsForStage。
 * - track：study 学科，career 职业页。
 * - need：要先学会的那一项 id。跨时期的 need 到了该时期可以跳过。
 * - cost：基础悟性。真正扣多少看 skillLearnCost。
 * - auto：不用花悟性，到了这个时期自动会。
 */

import { COST_STAT_STEP } from '../config/constants.js';
import { getStage } from './stages.js';

export const SKILLS = [
  // —— 婴儿：感知、动作、依恋。没有读写。 ——
  {
    id: 'eye-meet',
    stage: 'baby',
    track: 'study',
    name: '对视',
    cost: 5,
    energy: 0,
    effects: { eq: 12, charm: 6 },
    core: { mood: 4, stress: 1 },
    detail: '你看{ta}，{ta}也看回来。',
  },
  {
    id: 'call-back',
    stage: 'baby',
    track: 'study',
    need: 'eye-meet',
    name: '转头看',
    cost: 9,
    energy: 0,
    effects: { eq: 14, charm: 8 },
    core: { mood: 4, study: 2 },
    detail: '叫一声，会转头找人，不再只靠哭。',
  },
  {
    id: 'sound-find',
    stage: 'baby',
    track: 'study',
    name: '追声音',
    cost: 5,
    energy: 0,
    effects: { memory: 12, iq: 6 },
    core: { study: 4, stress: 1 },
    detail: '门铃、水壶、雨声，听完会转头找。',
  },
  {
    id: 'grab-self',
    stage: 'baby',
    track: 'study',
    name: '伸手抓',
    cost: 5,
    energy: 0,
    effects: { physique: 14 },
    core: { body: 5, stress: 1 },
    detail: '够得着的东西，让{ta}自己拿。',
  },
  {
    id: 'roll-move',
    stage: 'baby',
    track: 'study',
    need: 'grab-self',
    name: '翻身',
    cost: 9,
    energy: 8,
    effects: { physique: 16, charm: 6 },
    core: { body: 6, mood: 2 },
    detail: '从垫子这头挪到那头，不再等人抱。',
  },
  {
    id: 'name-point',
    stage: 'baby',
    track: 'study',
    name: '会指',
    cost: 6,
    energy: 0,
    effects: { iq: 14, memory: 8 },
    core: { study: 5, stress: 2 },
    detail: '灯、碗、手，一个名字对上一样东西。',
  },
  {
    id: 'soothe-pace',
    stage: 'baby',
    track: 'study',
    name: '拍背',
    cost: 5,
    energy: 8,
    effects: { eq: 12 },
    core: { mood: 5, stress: -5 },
    detail: '哭过之后能慢慢停下来，不必一直抱着。',
  },
  {
    id: 'water-play',
    stage: 'baby',
    track: 'play',
    name: '玩水',
    cost: 4,
    energy: 8,
    effects: { imagination: 10, physique: 6 },
    core: { mood: 4, body: 2, stress: -7 },
    detail: '洗手池里拍水，溅出来也不骂。',
  },
  {
    id: 'hide-face',
    stage: 'baby',
    track: 'play',
    name: '藏猫猫',
    cost: 4,
    energy: 8,
    effects: { eq: 10, charm: 8 },
    core: { mood: 5, stress: -8 },
    detail: '手掌一开一合，{ta}笑出声。',
  },
  {
    id: 'listen-talk',
    stage: 'baby',
    track: 'study',
    name: '听说话',
    cost: 5,
    energy: 0,
    effects: { memory: 12, iq: 6 },
    core: { study: 4, stress: 1 },
    detail: '你说话时{ta}盯着嘴看。',
  },
  {
    id: 'sit-up',
    stage: 'baby',
    track: 'study',
    name: '学坐',
    cost: 5,
    energy: 0,
    effects: { physique: 14 },
    core: { body: 5, stress: 1 },
    detail: '背后垫个枕头，自己坐一会儿。',
  },
  {
    id: 'crawl-to',
    stage: 'baby',
    track: 'study',
    need: 'roll-move',
    name: '爬过去',
    cost: 9,
    energy: 8,
    effects: { physique: 16, memory: 6 },
    core: { body: 6, mood: 2 },
    detail: '玩具放远一点，让{ta}自己爬过去拿。',
  },
  {
    id: 'look-mirror',
    stage: 'baby',
    track: 'study',
    name: '看镜子',
    cost: 5,
    energy: 0,
    effects: { eq: 12, imagination: 6 },
    core: { mood: 4, stress: 1 },
    detail: '镜子里也有一张脸，{ta}会伸手去摸。',
  },
  {
    id: 'clap-along',
    stage: 'baby',
    track: 'study',
    name: '学拍手',
    cost: 5,
    energy: 0,
    effects: { eq: 12, physique: 6 },
    core: { mood: 3, body: 2 },
    detail: '你拍一下，{ta}也拍。拍不齐也没关系。',
  },
  {
    id: 'watch-move',
    stage: 'baby',
    track: 'study',
    name: '追着看',
    cost: 5,
    energy: 0,
    effects: { memory: 12, iq: 6 },
    core: { study: 4, stress: 1 },
    detail: '眼前晃过去的东西，眼睛会跟着转。',
  },
  {
    id: 'know-face',
    stage: 'baby',
    track: 'study',
    name: '认人',
    cost: 6,
    energy: 0,
    effects: { eq: 14, memory: 6 },
    core: { mood: 3, study: 2 },
    detail: '熟人走近会笑，生人会盯着看。',
  },

  // —— 幼儿园：图、数、规则、同伴。还不碰课文。 ——
  {
    id: 'pic-word',
    stage: 'kinder',
    track: 'study',
    name: '图文对应',
    cost: 6,
    energy: 0,
    effects: { iq: 12, memory: 10 },
    core: { study: 5, stress: 2 },
    detail: '图画和字对上号，不急着写。',
  },
  {
    id: 'simple-tell',
    stage: 'kinder',
    track: 'study',
    need: 'pic-word',
    name: '简单讲述',
    cost: 10,
    energy: 0,
    effects: { eq: 14, charm: 8 },
    core: { mood: 3, study: 3 },
    detail: '把今天发生的事按顺序说完，不跳。',
  },
  {
    id: 'qty-feel',
    stage: 'kinder',
    track: 'study',
    name: '数量感知',
    cost: 6,
    energy: 0,
    effects: { iq: 14, memory: 6 },
    core: { study: 5, stress: 2 },
    detail: '多和少先看出来，再去数。',
  },
  {
    id: 'wait-line',
    stage: 'kinder',
    track: 'study',
    name: '排队等候',
    cost: 5,
    energy: 0,
    effects: { eq: 12, memory: 6 },
    core: { mood: 2, stress: 2 },
    detail: '滑梯前面有人，先站着。',
  },
  {
    id: 'rule-nudge',
    stage: 'kinder',
    track: 'study',
    need: 'wait-line',
    name: '规则提醒',
    cost: 10,
    energy: 0,
    effects: { eq: 14, charm: 6 },
    core: { mood: 2, study: 2, stress: 1 },
    detail: '提醒别人也要排队，自己先做到。',
  },
  {
    id: 'material-form',
    stage: 'kinder',
    track: 'study',
    name: '材料造型',
    cost: 6,
    energy: 8,
    effects: { imagination: 14, memory: 6 },
    core: { mood: 4, study: 2 },
    detail: '纸、积木、橡皮泥，先做出一个能立住的。',
  },
  {
    id: 'outdoor-pace',
    stage: 'kinder',
    track: 'study',
    name: '户外节律',
    cost: 5,
    energy: 16,
    effects: { physique: 14, charm: 6 },
    core: { body: 5, mood: 4, stress: -5 },
    detail: '跑到门口再回来，算一次。',
  },
  {
    id: 'peer-talk',
    stage: 'kinder',
    track: 'study',
    name: '同伴协商',
    cost: 6,
    energy: 0,
    effects: { eq: 14, charm: 8 },
    core: { mood: 4, stress: 1 },
    detail: '玩具只有一个，商量谁先玩。',
  },
  {
    id: 'role-play',
    stage: 'kinder',
    track: 'play',
    name: '角色扮演',
    cost: 4,
    energy: 8,
    effects: { imagination: 12, eq: 6 },
    core: { mood: 5, stress: -8 },
    detail: '今天当医生，明天当司机，演完就收。',
  },
  {
    id: 'yard-stroll',
    stage: 'kinder',
    track: 'play',
    name: '园内闲走',
    cost: 4,
    energy: 16,
    effects: { physique: 10, charm: 6 },
    core: { body: 4, mood: 4, stress: -7 },
    detail: '不跑步，绕着院子慢慢走一圈。',
  },

  // —— 小学：开始碰课文、口算步骤、把话说完整。 ——
  {
    id: 'read-close',
    stage: 'elem',
    track: 'study',
    name: '文本精读',
    cost: 6,
    energy: 0,
    effects: { iq: 14, memory: 8 },
    core: { study: 6, stress: 2 },
    detail: '读完一段，能标出它真正在说什么。',
  },
  {
    id: 'para-sum',
    stage: 'elem',
    track: 'study',
    need: 'read-close',
    name: '段落归纳',
    cost: 11,
    energy: 0,
    effects: { iq: 16, memory: 8 },
    core: { study: 6, stress: 2 },
    detail: '一段话用一句自己的话说完。',
  },
  {
    id: 'compare-read',
    stage: 'elem',
    track: 'study',
    need: 'para-sum',
    name: '比较阅读',
    cost: 15,
    energy: 0,
    effects: { iq: 18, memory: 10 },
    core: { study: 7, stress: 3 },
    detail: '两段材料对着看，找出相同和不同。',
  },
  {
    id: 'num-sense',
    stage: 'elem',
    track: 'study',
    name: '数量直觉',
    cost: 6,
    energy: 0,
    effects: { iq: 14, memory: 6 },
    core: { study: 6, stress: 3 },
    detail: '面对一组数，先判断量级和方向，再动手算。',
  },
  {
    id: 'step-list',
    stage: 'elem',
    track: 'study',
    need: 'num-sense',
    name: '分步列式',
    cost: 11,
    energy: 0,
    effects: { memory: 16, iq: 8 },
    core: { study: 6, stress: 2 },
    detail: '先写出步骤，再代入数字。',
  },
  {
    id: 'full-tell',
    stage: 'elem',
    track: 'study',
    name: '完整陈述',
    cost: 6,
    energy: 0,
    effects: { eq: 14, charm: 8 },
    core: { mood: 3, study: 3, stress: 1 },
    detail: '一件事按顺序讲完，中途不跳，结尾有着落。',
  },
  {
    id: 'write-org',
    stage: 'elem',
    track: 'study',
    need: 'full-tell',
    name: '书面组织',
    cost: 11,
    energy: 0,
    effects: { memory: 16, iq: 6 },
    core: { study: 5, stress: 2 },
    detail: '把能说清的事，写成别人打开就能看懂的一段。',
  },
  {
    id: 'sense-log',
    stage: 'elem',
    track: 'study',
    name: '感官记录',
    cost: 6,
    energy: 8,
    effects: { memory: 14, imagination: 8 },
    core: { mood: 3, study: 2 },
    detail: '把今天看到的、听到的记下来，先不解释。',
  },
  {
    id: 'recess-move',
    stage: 'elem',
    track: 'study',
    name: '课间释放',
    cost: 5,
    energy: 16,
    effects: { physique: 14, charm: 6 },
    core: { body: 6, mood: 4, stress: -5 },
    detail: '下课十分钟，到走廊或操场走一圈再回来。',
  },
  {
    id: 'error-look',
    stage: 'elem',
    track: 'study',
    name: '错因回看',
    cost: 6,
    energy: 0,
    effects: { memory: 14, iq: 6 },
    core: { study: 5, stress: 2 },
    detail: '错了先标出哪一步，不急着改成正确答案。',
  },
  {
    id: 'doodle-free',
    stage: 'elem',
    track: 'play',
    name: '课余涂绘',
    cost: 4,
    energy: 8,
    effects: { imagination: 12, charm: 6 },
    core: { mood: 4, stress: -8 },
    detail: '本子最后一页随便画，不交、不评。',
  },
  {
    id: 'peer-chat',
    stage: 'elem',
    track: 'play',
    name: '同伴闲聊',
    cost: 4,
    energy: 8,
    effects: { eq: 12, charm: 6 },
    core: { mood: 4, stress: -7 },
    detail: '放学路上说些不相干的事，说到家门口为止。',
  },

  // —— 初中：论证、建模、当众把话说清。 ——
  {
    id: 'arg-break',
    stage: 'middle',
    track: 'study',
    need: 'compare-read',
    name: '论证拆解',
    cost: 7,
    energy: 0,
    effects: { iq: 16, memory: 6 },
    core: { study: 6, stress: 3 },
    detail: '把观点、证据和情绪分开看，不混在一起。',
  },
  {
    id: 'issue-map',
    stage: 'middle',
    track: 'study',
    need: 'arg-break',
    name: '议题梳理',
    cost: 12,
    energy: 0,
    effects: { iq: 18, memory: 8 },
    core: { study: 7, stress: 3 },
    detail: '一件有争议的事，先列出双方在争什么。',
  },
  {
    id: 'rel-model',
    stage: 'middle',
    track: 'study',
    need: 'step-list',
    name: '关系建模',
    cost: 7,
    energy: 0,
    effects: { iq: 16, memory: 8 },
    core: { study: 6, stress: 3 },
    detail: '把题目里的关系理成一条能往下推的链。',
  },
  {
    id: 'qty-check',
    stage: 'middle',
    track: 'study',
    need: 'rel-model',
    name: '定量验证',
    cost: 12,
    energy: 0,
    effects: { memory: 18, iq: 8 },
    core: { study: 7, stress: 3 },
    detail: '算出结果后，换一种方法核对，不靠感觉收工。',
  },
  {
    id: 'write-long',
    stage: 'middle',
    track: 'study',
    need: 'write-org',
    name: '书面表达',
    cost: 7,
    energy: 0,
    effects: { memory: 12, imagination: 10 },
    core: { study: 5, stress: 2 },
    detail: '八百字能把一件事写完，开头先别写天气。',
  },
  {
    id: 'speak-out',
    stage: 'middle',
    track: 'study',
    need: 'write-long',
    name: '当众说明',
    cost: 12,
    energy: 0,
    effects: { eq: 16, memory: 8 },
    core: { mood: 3, study: 3, stress: 2 },
    detail: '在小组或家里把分歧摊开，让每个人听见同一件事。',
  },
  {
    id: 'peer-work',
    stage: 'middle',
    track: 'study',
    name: '同伴协作',
    cost: 6,
    energy: 0,
    effects: { eq: 14, charm: 6 },
    core: { mood: 3, study: 2 },
    detail: '小组作业开工前，先说清各自负责哪一块。',
  },
  {
    id: 'load-sense',
    stage: 'middle',
    track: 'study',
    need: 'recess-move',
    name: '负荷察觉',
    cost: 6,
    energy: 8,
    effects: { physique: 14, eq: 6 },
    core: { body: 4, stress: -3, mood: 2 },
    detail: '知道这周作业叠在一起会垮，先把能砍的砍掉。',
  },
  {
    id: 'error-file',
    stage: 'middle',
    track: 'study',
    need: 'error-look',
    name: '错题归档',
    cost: 7,
    energy: 0,
    effects: { memory: 16, iq: 6 },
    core: { study: 6, stress: 2 },
    detail: '错题按类型收进一本，下次只翻它。',
  },
  {
    id: 'headphone-rest',
    stage: 'middle',
    track: 'play',
    name: '耳机放空',
    cost: 5,
    energy: 8,
    effects: { eq: 10, imagination: 8 },
    core: { mood: 5, stress: -9 },
    detail: '作业合上，听完两首歌再打开。',
  },
  {
    id: 'downstairs-walk',
    stage: 'middle',
    track: 'play',
    name: '楼下慢走',
    cost: 5,
    energy: 16,
    effects: { physique: 12, eq: 6 },
    core: { body: 4, mood: 3, stress: -8 },
    detail: '下楼绕小区一圈，手机放口袋里。',
  },

  // —— 高中：研判、限时、作息、志愿。 ——
  {
    id: 'judge-alone',
    stage: 'high',
    track: 'study',
    need: 'issue-map',
    name: '独立研判',
    cost: 8,
    energy: 0,
    effects: { iq: 16, memory: 8 },
    core: { study: 6, stress: 3 },
    detail: '材料不够时，先写清缺什么，再决定信不信。',
  },
  {
    id: 'note-margin',
    stage: 'high',
    track: 'study',
    need: 'judge-alone',
    name: '材料评注',
    cost: 12,
    energy: 0,
    effects: { iq: 18, memory: 10 },
    core: { study: 7, stress: 3 },
    detail: '在材料空白处写下判断依据，不抄原句。',
  },
  {
    id: 'synth-essay',
    stage: 'high',
    track: 'study',
    need: 'note-margin',
    name: '综合论述',
    cost: 16,
    energy: 0,
    effects: { iq: 20, eq: 8 },
    core: { study: 7, stress: 3 },
    detail: '把几份材料收成一个自己的结论，八百字说完。',
  },
  {
    id: 'timed-solve',
    stage: 'high',
    track: 'study',
    need: 'qty-check',
    name: '限时求解',
    cost: 8,
    energy: 0,
    effects: { iq: 16, memory: 8 },
    core: { study: 7, stress: 3 },
    detail: '先做会的，卡着的做记号，到点收卷。',
  },
  {
    id: 'topic-survey',
    stage: 'high',
    track: 'study',
    name: '专题综述',
    cost: 8,
    energy: 0,
    effects: { memory: 16, iq: 8 },
    core: { study: 6, stress: 2 },
    detail: '把一个月的笔记收成一份能交的。',
  },
  {
    id: 'timed-speak',
    stage: 'high',
    track: 'study',
    need: 'speak-out',
    name: '限时陈述',
    cost: 8,
    energy: 0,
    effects: { eq: 14, memory: 8 },
    core: { mood: 2, study: 3, stress: 2 },
    detail: '两分钟把观点说完，不看稿，手可以抖。',
  },
  {
    id: 'rest-bound',
    stage: 'high',
    track: 'study',
    need: 'load-sense',
    name: '作息边界',
    cost: 6,
    energy: 8,
    effects: { physique: 12, eq: 8 },
    core: { body: 3, mood: 3, stress: -4 },
    detail: '几点关灯写在墙上，到点合上笔。',
  },
  {
    id: 'pace-reset',
    stage: 'high',
    track: 'study',
    need: 'rest-bound',
    name: '压力复位',
    cost: 11,
    energy: 16,
    effects: { eq: 12, physique: 10 },
    core: { mood: 5, stress: -6, body: 2 },
    detail: '高强度之后主动停下来，把睡眠和运动补回去。',
  },
  {
    id: 'choice-scan',
    stage: 'high',
    track: 'study',
    name: '志愿比对',
    cost: 7,
    energy: 0,
    effects: { memory: 12, iq: 10 },
    core: { study: 4, stress: 1 },
    detail: '简章摊开，只看条件，先不定。',
  },
  {
    id: 'error-rework',
    stage: 'high',
    track: 'study',
    need: 'error-file',
    name: '错题回炉',
    cost: 8,
    energy: 0,
    effects: { memory: 18, iq: 8 },
    core: { study: 7, stress: 3 },
    detail: '同一道题隔三天再做，仍错就换一种解法。',
  },
  {
    id: 'weekend-blank',
    stage: 'high',
    track: 'play',
    name: '周末放空',
    cost: 5,
    energy: 16,
    effects: { eq: 10, imagination: 8 },
    core: { mood: 6, stress: -10 },
    detail: '周六上午不打开书包，睡到自然醒。',
  },
  {
    id: 'night-walk',
    stage: 'high',
    track: 'play',
    name: '夜风慢走',
    cost: 5,
    energy: 16,
    effects: { physique: 10, eq: 8 },
    core: { body: 3, mood: 4, stress: -8 },
    detail: '晚饭后下楼走二十分钟，不讨论成绩。',
  },

  // —— 职业：买任意职业道具后出现，不跟年龄走。 ——
  {
    id: 'need-clear',
    track: 'career',
    name: '需求澄清',
    cost: 6,
    energy: 0,
    effects: { memory: 14, iq: 8 },
    core: { study: 5, stress: 2 },
    detail: '动手前先问清：这次到底要解决哪一件事。',
  },
  {
    id: 'plan-land',
    track: 'career',
    need: 'need-clear',
    name: '方案落地',
    cost: 11,
    energy: 0,
    effects: { iq: 16, memory: 10 },
    core: { study: 6, stress: 2 },
    detail: '把口头上的想法写成步骤、节点和负责人。',
  },
  {
    id: 'review-done',
    track: 'career',
    need: 'plan-land',
    name: '交付复盘',
    cost: 16,
    energy: 0,
    effects: { iq: 20, memory: 8 },
    core: { study: 7, stress: 3 },
    detail: '做完对照目标看一遍，记下下次只改那一条。',
  },
  {
    id: 'collab-align',
    track: 'career',
    name: '协作对齐',
    cost: 6,
    energy: 0,
    effects: { eq: 14, charm: 6 },
    core: { mood: 3, study: 2 },
    detail: '开工前把各自负责的部分说清楚，少一次返工。',
  },
  {
    id: 'conflict-handle',
    track: 'career',
    need: 'collab-align',
    name: '分歧处理',
    cost: 11,
    energy: 0,
    effects: { eq: 16, charm: 8 },
    core: { mood: 3, stress: 1 },
    detail: '意见不合时，先对齐事实，再谈立场。',
  },
  {
    id: 'field-decide',
    track: 'career',
    need: 'conflict-handle',
    name: '现场决策',
    cost: 16,
    energy: 0,
    effects: { iq: 16, memory: 8 },
    core: { mood: 2, study: 3, stress: 2 },
    detail: '信息不完整时，仍给出一个今晚就能执行的下一步。',
  },
  {
    id: 'industry-read',
    track: 'career',
    name: '行业阅读',
    cost: 6,
    energy: 0,
    effects: { iq: 14, memory: 8 },
    core: { study: 5, stress: 2 },
    detail: '定期读本行的通报和报告，知道眼下在争什么。',
  },
  {
    id: 'method-shift',
    track: 'career',
    need: 'industry-read',
    name: '方法迁移',
    cost: 11,
    energy: 0,
    effects: { imagination: 16, memory: 8 },
    core: { study: 4, mood: 2 },
    detail: '把一个项目里用过的办法，改一改用到下一件。',
  },
  {
    id: 'pro-judge',
    track: 'career',
    need: 'method-shift',
    name: '专业判断',
    cost: 16,
    energy: 0,
    effects: { iq: 20, charm: 8 },
    core: { study: 6, stress: 2 },
    detail: '别人问「这样做行不行」时，能给出有依据的答复。',
  },
  {
    id: 'load-manage',
    track: 'career',
    name: '负荷管理',
    cost: 6,
    energy: 8,
    effects: { physique: 16, eq: 6 },
    core: { body: 5, stress: -3 },
    detail: '知道这周的精力边界在哪，不把所有事叠在同一天。',
  },
  {
    id: 'stress-reset',
    track: 'career',
    need: 'load-manage',
    name: '节奏复位',
    cost: 11,
    energy: 16,
    effects: { eq: 12, physique: 8 },
    core: { mood: 5, stress: -6, body: 2 },
    detail: '高强度之后主动停下来，把睡眠和运动补回去。',
  },

  {
    id: 'parttime',
    stage: 'high',
    name: '周末打零工',
    cost: 0,
    energy: 0,
    money: 22,
    auto: true,
    effects: {},
    core: { stress: 1 },
    detail: '奶茶店站一下午，钱是自己挣的。',
  },
];

export function getSkillById(id) {
  return SKILLS.find((skill) => skill.id === id) || null;
}

const SCHOOL_STAGE = { elem: 0, middle: 1, high: 2 };

function schoolIndex(id) {
  return SCHOOL_STAGE[id] ?? -1;
}

function isSchoolStage(id) {
  return schoolIndex(id) >= 0;
}

/** 跨时期前置：到了这项技能自己的时期，没学过上一时期的也可以学。 */
function crossStageWaived(state, skill, prev) {
  if (!state || !skill || !prev) return false;
  if (prev.stage === skill.stage) return false;
  const current = getStage(state.yearIndex).id;
  const cur = schoolIndex(current);
  const skillIx = schoolIndex(skill.stage);
  const prevIx = schoolIndex(prev.stage);
  if (cur < 0 || skillIx < 0 || prevIx < 0) return false;
  return skillIx <= cur;
}

function predecessorLearned(state, skill) {
  if (!state || !skill?.need) return false;
  const prev = getSkillById(skill.need);
  return Boolean(prev && isLearned(state, prev));
}

/** 本期列表：当前时期必出；小学到高中学完上一档，下一档可以提前出现。 */
export function skillListedInStage(skill, stageId, state) {
  if (!skill || skill.track === 'career') return false;
  if (skill.auto) return skill.stage === stageId;
  if (skill.stage === stageId) return true;
  if (!state || !isSchoolStage(stageId) || !isSchoolStage(skill.stage)) return false;
  if (schoolIndex(skill.stage) <= schoolIndex(stageId)) return false;
  return predecessorLearned(state, skill);
}

/** 「本期」技能。职业线不走这里。 */
export function getSkillsForStage(yearIndex, state) {
  const stage = getStage(yearIndex);
  return sortSkillTree(SKILLS.filter((skill) => skillListedInStage(skill, stage.id, state)));
}

/** 买了任意职业道具后出现的职业技能线。careerId 只为兼容商店和检查脚本。 */
export function getCareerSkills(_careerId) {
  return sortSkillTree(SKILLS.filter((skill) => skill.track === 'career'));
}

/** 打零工这类自动会的技能，只在它自己的时期算「会」。 */
export function isLearned(state, skill) {
  if (!skill) return false;
  if (skill.auto) return skill.stage === getStage(state.yearIndex).id;
  return state.learnedSkills.includes(skill.id);
}

/** 这项技能加得最多的那一项。学习卡片上的「主加」用它。 */
export function mainEffect(skill) {
  let key = null;
  let amount = 0;
  Object.entries(skill?.effects || {}).forEach(([stat, value]) => {
    if (value > amount) {
      key = stat;
      amount = value;
    }
  });
  if (!key) return null;
  return { key, amount };
}

export function skillTier(skill, state) {
  let tier = 1;
  let cursor = skill;
  while (cursor?.need) {
    const prev = getSkillById(cursor.need);
    if (!prev) break;
    if (state && crossStageWaived(state, cursor, prev) && !isLearned(state, prev)) break;
    cursor = prev;
    tier += 1;
    if (tier > 8) break;
  }
  return tier;
}

export function skillRootId(skill) {
  let cursor = skill;
  let guard = 0;
  while (cursor?.need && guard < 8) {
    const prev = getSkillById(cursor.need);
    if (!prev) break;
    cursor = prev;
    guard += 1;
  }
  return cursor?.id || skill.id;
}

export function sortSkillTree(list) {
  const order = new Map(SKILLS.map((skill, index) => [skill.id, index]));
  return [...list].sort((left, right) => {
    const root = (order.get(skillRootId(left)) ?? 0) - (order.get(skillRootId(right)) ?? 0);
    if (root !== 0) return root;
    return skillTier(left) - skillTier(right);
  });
}

/**
 * 真正要花的悟性。主加的那项每满 COST_STAT_STEP，少 1 点。
 * 基础课最少 1，进阶最少 3，高阶最少 5，不会免费。
 */
export function skillLearnCost(state, skill) {
  if (!skill || skill.auto) return 0;
  const main = mainEffect(skill);
  const value = main ? (state.child?.sheet?.[main.key] ?? 0) : 0;
  const cut = Math.floor(Math.max(0, value) / COST_STAT_STEP);
  const tier = skillTier(skill, state);
  const sameStageNeed = Boolean(skill.need && getSkillById(skill.need)?.stage === skill.stage);
  const floor = tier >= 3 ? 5 : (sameStageNeed ? 3 : 1);
  return Math.max(floor, skill.cost - cut);
}

export function canLearnSkill(state, skill) {
  if (!skill || skill.auto) return { ok: false, reason: '这项不用学' };
  if (isLearned(state, skill)) return { ok: false, reason: '学过了' };
  if (skill.need) {
    const prev = getSkillById(skill.need);
    if (prev && !isLearned(state, prev) && !crossStageWaived(state, skill, prev)) {
      return { ok: false, reason: `要先学会「${prev.name}」`, locked: true, prev };
    }
  }
  const cost = skillLearnCost(state, skill);
  if ((state.household?.insight ?? 0) < cost) return { ok: false, reason: '悟性不够', cost };
  return { ok: true, cost };
}

/** 已经会的技能，按表里的顺序，不限时期。 */
export function learnedSkillList(state) {
  return SKILLS.filter((skill) => isLearned(state, skill));
}
