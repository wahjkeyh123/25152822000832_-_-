/**
 * 文件：src/config/constants.js
 * 作用：全游戏共用的名字、颜色、开局数字。
 * 改平衡时，优先改本文件和 src/data/ 里的表，不要先去改画面。
 */

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const GAME_TITLE = '成长答卷';

/** 场景的身份证。main.js 用这些名字把场景串起来。 */
export const SCENE = {
  BOOT: 'Boot',
  PRELOAD: 'Preload',
  MENU: 'Menu',
  GAME: 'Game',
  ENDING: 'Ending',
};

export const STAT_KEYS = ['study', 'body', 'mood', 'stress'];

export const STAT_LABEL = {
  study: '学识',
  body: '体质',
  mood: '心情',
  stress: '压力',
};

export const STAT_MIN = 0;
export const STAT_MAX = 100;

/** 精力用来点脑洞。一格 5 点。每个新回合回复 ROUND_ENERGY 点。 */
export const ENERGY_MAX = 30;
export const ROUND_ENERGY = 15;
export const HOLE_ENERGY_COST = 5;
/** 每回合最多安排几个技能。一局有 19 个回合，所以一回合排 3 个就够忙了。 */
export const SCHEDULES_PER_ROUND = 3;
export const BOARD_COLS = 8;
export const BOARD_ROWS = 9;

/** 脑洞里的属性格，每格随机加这个范围里的点数。 */
export const DIG_GAIN_MIN = 3;
export const DIG_GAIN_MAX = 5;

/** 左边七项属性的上限。 */
export const SHEET_MAX = 200;

export const START_MONEY = 70;

/** 悟性用来在右侧学习技能。脑洞是主要来源。 */
export const START_INSIGHT = 8;
export const INSIGHT_MAX = 30;

/** 父母满意度：0 到 100，开局 50。满了发奖励，空了全家冷下来。 */
export const SAT_MAX = 100;
export const START_SATISFACTION = 50;

export const START_STATS = {
  study: 36,
  body: 44,
  mood: 72,
  stress: 16,
};

export const CHILD_NAME = '小满';

export const SAVE_KEY = 'supper-before-save-v5';
export const SAVE_VERSION = 5;

export const FONT = '"Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif';

export const COLORS = {
  bg: 0xf4e4cc,
  ink: '#2c2416',
  muted: '#6e6256',
  panel: 0xfff9f0,
  panelEdge: 0xd9c4a8,
  accent: 0xc45c26,
  accentHover: 0xa84b1c,
  good: 0x2f7d57,
  goodHover: 0x256746,
  barBg: 0xe6d3ba,
  disabled: 0xc8b8a4,
  dim: 0x2c2416,
  paper: '#fff8ee',
};

/** 生成 Phaser 文字样式。颜色用 CSS 字符串，例如 #2c2416。 */
export function inkText(size, color = COLORS.ink, extra = {}) {
  return {
    fontFamily: FONT,
    fontSize: `${size}px`,
    color,
    resolution: 2,
    ...extra,
  };
}
