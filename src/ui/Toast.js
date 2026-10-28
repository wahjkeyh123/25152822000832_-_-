/**
 * 文件：src/ui/Toast.js
 * 作用：屏幕上方弹出的提示牌，比如「压力满了」「家里和睦」。几条会排着队一条一条出。
 * 不挡点击，过两秒多自己消失。
 */

import { inkText } from '../config/constants.js';

const COLORS = { good: 0x3f8f4f, bad: 0xa33b32, info: 0x8a5a36 };
const queues = new WeakMap();

/** y 是提示牌的上边。商店开着时放到底部，免得挡住道具。 */
export function showNotices(scene, notices, y = 196) {
  if (!notices || notices.length === 0) return;
  const queue = queues.get(scene) || [];
  queue.push(...notices.map((notice) => ({ ...notice, y })));
  queues.set(scene, queue);
  if (queue.length === notices.length) next(scene);
}

function next(scene) {
  const queue = queues.get(scene);
  if (!queue || queue.length === 0 || !scene.sys.isActive()) return;
  const notice = queue[0];
  const nodes = draw(scene, notice);
  nodes.forEach((node) => node.setAlpha(0));
  scene.tweens.add({ targets: nodes, alpha: 1, y: '+=12', duration: 220, ease: 'Back.easeOut' });
  scene.time.delayedCall(2600, () => {
    scene.tweens.add({
      targets: nodes,
      alpha: 0,
      duration: 260,
      onComplete: () => {
        nodes.forEach((node) => node.destroy());
        queue.shift();
        next(scene);
      },
    });
  });
}

function draw(scene, notice) {
  const color = COLORS[notice.kind] || COLORS.info;
  const w = 540;
  const y = notice.y ?? 196;
  const text = scene.add.text(640 - w / 2 + 32, y + 46, notice.text, inkText(15, '#3b2f25', {
    lineSpacing: 4,
    wordWrap: { width: w - 56, useAdvancedWrap: true },
  })).setOrigin(0, 0).setDepth(331);
  const h = Math.max(84, text.height + 62);
  const g = scene.add.graphics().setDepth(330);
  g.fillStyle(0x000000, 0.25);
  g.fillRoundedRect(640 - w / 2 + 4, y + 6, w, h, 14);
  g.fillStyle(0xfff8ee, 0.98);
  g.fillRoundedRect(640 - w / 2, y, w, h, 14);
  g.fillStyle(color, 1);
  g.fillRoundedRect(640 - w / 2, y, 12, h, { tl: 14, bl: 14, tr: 0, br: 0 });
  g.lineStyle(3, color, 1);
  g.strokeRoundedRect(640 - w / 2, y, w, h, 14);
  const title = scene.add.text(640 - w / 2 + 32, y + 24, notice.title, inkText(20, `#${color.toString(16).padStart(6, '0')}`, { fontStyle: 'bold' }))
    .setOrigin(0, 0.5).setDepth(331);
  return [g, title, text];
}
