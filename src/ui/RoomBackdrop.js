/**
 * 文件：src/ui/RoomBackdrop.js
 * 作用：培养界面的房间背景。优先用 assets/images/bg/ 里的图；缺图时四个时期各用 Graphics 画一间。
 * 婴儿：婴儿床和挂铃。幼儿园：小黑板和积木。初中：书桌台灯和书架。高中：堆满卷子的书桌、日历、夜景。
 * 左右两侧会被属性栏和学习栏盖住，所以家具只摆在中间 300～990 这一段。
 */

import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants.js';
import { crossFade } from '../effects/Motion.js';
import { shade } from './theme/frame.js';

const FLOOR_Y = 470;

const PALETTE = {
  baby: { wall: 0xf6e3d3, stripe: 0xf0d3c0, floor: 0xd9b48c, sky: 0xbfe0f2, rug: 0xf3c1c6 },
  kinder: { wall: 0xf4ead0, stripe: 0xe9dcb5, floor: 0xcfa676, sky: 0xa9d6ef, rug: 0xbfe0b5 },
  middle: { wall: 0xe5e8de, stripe: 0xd6dbcc, floor: 0xb98a5e, sky: 0xf2c58e, rug: 0xc9d6e8 },
  high: { wall: 0xd9dbe6, stripe: 0xc9ccdb, floor: 0x9c7552, sky: 0x2b3557, rug: 0xb7b0cf },
};

export default class RoomBackdrop {
  constructor(scene) {
    this.scene = scene;
    this.layer = null;
    this.stageId = null;
  }

  /** 换到某个时期的房间。animate 为 true 时淡入淡出。有 bg-时期 图片就用图，没有就用下面的画法。 */
  show(stageId, animate = false) {
    if (stageId === this.stageId) return;
    this.stageId = stageId;
    const next = this.scene.textures.exists(`bg-${stageId}`)
      ? this.photo(stageId)
      : paintRoom(this.scene.add.graphics(), stageId);
    next.setDepth(0);
    const old = this.layer;
    this.layer = next;
    if (animate && old) crossFade(this.scene, old, next);
    else old?.destroy();
  }

  /** 背景图铺满画面，底部压一层暖色渐暗，让最下面那行记录看得清。 */
  photo(stageId) {
    const image = this.scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, `bg-${stageId}`);
    const cover = Math.max(GAME_WIDTH / image.width, GAME_HEIGHT / image.height);
    image.setScale(cover);
    const shade = this.scene.add.graphics();
    for (let step = 0; step < 12; step += 1) {
      shade.fillStyle(0x2c1a10, 0.03 + step * 0.012);
      shade.fillRect(0, GAME_HEIGHT - 120 + step * 10, GAME_WIDTH, 10);
    }
    shade.fillStyle(0x2c1a10, 0.18);
    shade.fillRect(0, 0, GAME_WIDTH, 100);
    return this.scene.add.container(0, 0, [image, shade]);
  }
}

function paintRoom(g, stageId) {
  const colors = PALETTE[stageId] || PALETTE.baby;
  paintWall(g, colors);
  paintFloor(g, colors);
  if (stageId === 'baby') paintBaby(g, colors);
  else if (stageId === 'kinder') paintKinder(g, colors);
  else if (stageId === 'middle') paintMiddle(g, colors);
  else paintHigh(g, colors);
  paintLight(g, stageId);
  return g;
}

function paintWall(g, colors) {
  g.fillStyle(colors.wall, 1);
  g.fillRect(0, 0, GAME_WIDTH, FLOOR_Y);
  g.fillStyle(colors.stripe, 0.55);
  for (let x = 0; x < GAME_WIDTH; x += 48) g.fillRect(x, 0, 18, FLOOR_Y);
  g.fillStyle(shade(colors.wall, 0.9), 1);
  g.fillRect(0, 86, GAME_WIDTH, 6);
}

function paintFloor(g, colors) {
  g.fillStyle(colors.floor, 1);
  g.fillRect(0, FLOOR_Y, GAME_WIDTH, GAME_HEIGHT - FLOOR_Y);
  g.lineStyle(2, shade(colors.floor, 0.82), 1);
  for (let y = FLOOR_Y + 34; y < GAME_HEIGHT; y += 36) g.lineBetween(0, y, GAME_WIDTH, y);
  for (let row = 0; row < 7; row += 1) {
    const y = FLOOR_Y + row * 36;
    const offset = (row % 2) * 90;
    for (let x = offset; x < GAME_WIDTH; x += 180) g.lineBetween(x, y, x, y + 34);
  }
  g.fillStyle(shade(colors.floor, 0.7), 1);
  g.fillRect(0, FLOOR_Y - 10, GAME_WIDTH, 12);
  g.fillStyle(colors.rug, 0.9);
  g.fillEllipse(640, 560, 420, 110);
  g.lineStyle(3, shade(colors.rug, 0.8), 1);
  g.strokeEllipse(640, 560, 380, 90);
}

function paintWindow(g, x, y, w, h, sky, night = false) {
  g.fillStyle(0x000000, 0.12);
  g.fillRoundedRect(x + 6, y + 8, w, h, 10);
  g.fillStyle(sky, 1);
  g.fillRoundedRect(x, y, w, h, 10);
  if (night) {
    g.fillStyle(0xf4e6a8, 1);
    g.fillCircle(x + w - 40, y + 34, 16);
    g.fillStyle(sky, 1);
    g.fillCircle(x + w - 33, y + 29, 14);
    g.fillStyle(0xffffff, 0.85);
    [[30, 26], [70, 52], [110, 22], [52, 88], [140, 80]].forEach(([dx, dy]) => g.fillCircle(x + dx, y + dy, 2));
  } else {
    g.fillStyle(0xffffff, 0.85);
    g.fillEllipse(x + 52, y + 42, 60, 22);
    g.fillEllipse(x + 74, y + 34, 44, 22);
    g.fillEllipse(x + w - 50, y + h - 34, 50, 18);
  }
  g.lineStyle(8, 0xc4a484, 1);
  g.strokeRoundedRect(x, y, w, h, 10);
  g.lineStyle(5, 0xc4a484, 1);
  g.lineBetween(x + w / 2, y, x + w / 2, y + h);
  g.lineBetween(x, y + h / 2, x + w, y + h / 2);
  g.fillStyle(0xb08a66, 1);
  g.fillRect(x - 14, y + h + 2, w + 28, 10);
}

function paintCurtains(g, x, y, w, h, color) {
  g.fillStyle(color, 1);
  g.fillRoundedRect(x - 30, y - 16, 40, h + 40, 12);
  g.fillRoundedRect(x + w - 10, y - 16, 40, h + 40, 12);
  g.fillStyle(shade(color, 0.85), 1);
  for (let step = 0; step < 3; step += 1) {
    g.fillRect(x - 22 + step * 10, y - 10, 3, h + 30);
    g.fillRect(x + w - 2 + step * 10, y - 10, 3, h + 30);
  }
  g.fillStyle(0x9a7350, 1);
  g.fillRect(x - 44, y - 22, w + 88, 8);
}

function paintBaby(g, colors) {
  paintCurtains(g, 760, 130, 190, 130, 0xf2b8b8);
  paintWindow(g, 760, 130, 190, 130, colors.sky);
  // 墙上的星星贴纸
  g.fillStyle(0xf5d26b, 1);
  [[360, 150], [420, 210], [480, 140], [540, 230]].forEach(([x, y]) => star(g, x, y, 14));
  // 婴儿床
  const cx = 860;
  g.fillStyle(0x000000, 0.12);
  g.fillEllipse(cx, FLOOR_Y + 12, 230, 24);
  g.fillStyle(0xf8efe2, 1);
  g.fillRoundedRect(cx - 110, 330, 220, 120, 10);
  g.fillStyle(0xe8a9a9, 1);
  g.fillRoundedRect(cx - 100, 378, 200, 36, 8);
  g.fillStyle(0xc99a6c, 1);
  g.fillRect(cx - 116, 300, 12, 170);
  g.fillRect(cx + 104, 300, 12, 170);
  g.fillRect(cx - 116, 324, 232, 8);
  g.fillRect(cx - 116, 440, 232, 10);
  for (let x = cx - 96; x <= cx + 92; x += 22) g.fillRect(x, 332, 6, 108);
  // 挂铃
  g.lineStyle(2, 0x9a7350, 1);
  g.lineBetween(cx, 220, cx, 262);
  g.lineBetween(cx - 50, 262, cx + 50, 262);
  [[-50, 0xf28b82], [0, 0x8ecae6], [50, 0xf5d26b]].forEach(([dx, color]) => {
    g.lineBetween(cx + dx, 262, cx + dx, 286);
    g.fillStyle(color, 1);
    g.fillCircle(cx + dx, 294, 10);
  });
}

function paintKinder(g, colors) {
  paintWindow(g, 780, 120, 180, 130, colors.sky);
  // 小黑板
  g.fillStyle(0x000000, 0.12);
  g.fillRoundedRect(338, 128, 220, 140, 8);
  g.fillStyle(0x8a5a36, 1);
  g.fillRoundedRect(330, 120, 220, 140, 8);
  g.fillStyle(0x2f5845, 1);
  g.fillRect(342, 132, 196, 116);
  g.lineStyle(3, 0xf3f1e6, 0.9);
  g.strokeCircle(390, 175, 18);
  g.lineBetween(430, 160, 500, 160);
  g.lineBetween(430, 186, 486, 186);
  g.lineBetween(372, 222, 512, 222);
  g.fillStyle(0xf3f1e6, 1);
  g.fillRect(470, 250, 24, 6);
  // 积木
  const blocks = [
    [840, 434, 0xe76f51], [884, 434, 0x2a9d8f], [928, 434, 0xe9c46a],
    [862, 392, 0x8ecae6], [906, 392, 0xf4a261], [884, 350, 0xb5838d],
  ];
  blocks.forEach(([x, y, color]) => {
    g.fillStyle(shade(color, 0.75), 1);
    g.fillRect(x - 20, y - 18, 40, 40);
    g.fillStyle(color, 1);
    g.fillRect(x - 20, y - 20, 40, 36);
    g.fillStyle(0xffffff, 0.25);
    g.fillRect(x - 16, y - 16, 12, 8);
  });
  // 小椅子
  g.fillStyle(0xf4a261, 1);
  g.fillRoundedRect(380, 360, 70, 16, 4);
  g.fillRect(384, 300, 10, 70);
  g.fillRect(384, 376, 8, 86);
  g.fillRect(438, 376, 8, 86);
}

function paintMiddle(g, colors) {
  paintCurtains(g, 770, 120, 180, 130, 0x8fb3c9);
  paintWindow(g, 770, 120, 180, 130, colors.sky);
  // 书架
  g.fillStyle(0x000000, 0.12);
  g.fillRect(338, 138, 140, 330);
  g.fillStyle(0x8a5a36, 1);
  g.fillRect(330, 130, 140, 334);
  g.fillStyle(0x6b4429, 1);
  [130, 214, 298, 382].forEach((y) => g.fillRect(330, y + 76, 140, 8));
  const spines = [0xc45c26, 0x3d6ea8, 0x2f7d57, 0xe2b325, 0x8d4ad8, 0xa33b32];
  [140, 224, 308].forEach((y, shelf) => {
    let x = 340;
    for (let index = 0; index < 7; index += 1) {
      const w = 12 + ((index + shelf) % 3) * 3;
      const h = 54 + ((index * 7 + shelf) % 4) * 4;
      g.fillStyle(spines[(index + shelf) % spines.length], 1);
      g.fillRect(x, y + 66 - h, w, h);
      x += w + 3;
    }
  });
  // 海报
  g.fillStyle(0xfff6e6, 1);
  g.fillRect(560, 140, 110, 140);
  g.fillStyle(0xf2c58e, 1);
  g.fillCircle(615, 190, 28);
  g.fillStyle(0x3d6ea8, 1);
  g.fillTriangle(570, 270, 615, 220, 660, 270);
  // 书桌和台灯
  paintDesk(g, 860, 0x9c6b43);
  g.fillStyle(0x3d6ea8, 1);
  g.fillRect(912, 308, 8, 52);
  g.fillTriangle(890, 314, 950, 314, 920, 284);
  g.fillStyle(0x2f5684, 1);
  g.fillEllipse(916, 362, 40, 10);
  g.fillStyle(0xf6f1e4, 1);
  g.fillRect(812, 350, 64, 10);
  g.fillStyle(0xc45c26, 1);
  g.fillRect(820, 340, 48, 10);
}

function paintHigh(g, colors) {
  paintCurtains(g, 770, 120, 180, 130, 0x6c6f94);
  paintWindow(g, 770, 120, 180, 130, colors.sky, true);
  // 日历
  g.fillStyle(0xfff6e6, 1);
  g.fillRect(360, 140, 140, 150);
  g.fillStyle(0xa33b32, 1);
  g.fillRect(360, 140, 140, 30);
  g.fillStyle(0xd9cbb5, 1);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 5; col += 1) g.fillRect(372 + col * 25, 182 + row * 25, 16, 14);
  }
  g.lineStyle(3, 0xa33b32, 1);
  g.strokeCircle(455, 240, 13);
  // 钟
  g.fillStyle(0xfff6e6, 1);
  g.fillCircle(600, 170, 34);
  g.lineStyle(4, 0x5b4632, 1);
  g.strokeCircle(600, 170, 34);
  g.lineBetween(600, 170, 600, 146);
  g.lineBetween(600, 170, 618, 178);
  // 书桌、成堆的卷子
  paintDesk(g, 860, 0x7d5234);
  [[820, 350], [826, 338], [818, 326], [824, 314]].forEach(([x, y]) => {
    g.fillStyle(0xf6f1e4, 1);
    g.fillRect(x - 34, y, 68, 10);
    g.lineStyle(1, 0xc8b8a4, 1);
    g.strokeRect(x - 34, y, 68, 10);
  });
  g.fillStyle(0xf5d26b, 1);
  g.fillRect(912, 304, 8, 56);
  g.fillTriangle(890, 310, 950, 310, 920, 282);
  g.fillStyle(0x7a5a3c, 1);
  g.fillRoundedRect(880, 344, 46, 16, 4);
}

function paintDesk(g, cx, color) {
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(cx, FLOOR_Y + 10, 260, 22);
  g.fillStyle(color, 1);
  g.fillRect(cx - 120, 360, 240, 18);
  g.fillStyle(shade(color, 0.8), 1);
  g.fillRect(cx - 112, 378, 14, 92);
  g.fillRect(cx + 98, 378, 14, 92);
  g.fillRect(cx + 20, 378, 78, 56);
  g.fillStyle(shade(color, 1.15), 1);
  g.fillRect(cx + 50, 400, 18, 4);
}

function paintLight(g, stageId) {
  const warm = stageId === 'high' ? 0xffe9a8 : 0xfff3d1;
  g.fillStyle(warm, stageId === 'high' ? 0.14 : 0.1);
  g.fillCircle(640, 360, 260);
  g.fillStyle(warm, 0.08);
  g.fillCircle(640, 360, 360);
}

function star(g, x, y, r) {
  const points = [];
  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? r : r * 0.45;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    points.push({ x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius });
  }
  g.fillPoints(points, true);
}
