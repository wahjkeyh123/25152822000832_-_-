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

/** 旧的自动检查仍按每个时期两次旧活动来走，玩家界面不再用这个数。 */
export const ENERGY_PER_YEAR = 2;

/** 精力用来点脑洞。一格 5 点。每进入下一个时期，回复上限的一半。 */
export const ENERGY_MAX = 40;
export const HOLE_ENERGY_COST = 5;
export const SCHEDULES_PER_ROUND = 5;
export const BOARD_COLS = 8;
export const BOARD_ROWS = 9;

export const START_MONEY = 70;

/** 悟性用来在右侧学习技能。脑洞是主要来源。 */
export const START_INSIGHT = 6;
export const INSIGHT_MAX = 30;

export const START_STATS = {
  study: 36,
  body: 44,
  mood: 72,
  stress: 16,
};

export const CHILD_NAME = '小满';

export const SAVE_KEY = 'supper-before-save-v4';
export const SAVE_VERSION = 4;

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

/**
 * 画面坐标集中在这里，方便以后挪位置。
 * x / y 写的是中心点，不是左上角。
 */
export const LAYOUT = {
  frameTop: 148,
  frameHeight: 400,
  action: { y: 616, h: 112, left: 24, gap: 8, rightLimit: 1020 },
  endButton: { x: 1152, y: 616, w: 220, h: 112 },
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
