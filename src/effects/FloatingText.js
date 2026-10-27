/**
 * 文件：src/effects/FloatingText.js
 * 作用：属性变化时，在点击的位置飘出「学业+10」这样的字。
 * 压力上升用红色，压力下降用绿色。其他属性反过来：上升是好事。
 */

import { STAT_LABEL, inkText } from '../config/constants.js';
import { SHEET_LABEL } from '../data/attributes.js';

function isGood(key, delta) {
  if (key === 'stress') return delta < 0;
  return delta > 0;
}

export function spawnStatChanges(scene, changes, x = 640, y = 420) {
  if (!changes) return;
  Object.keys(changes).forEach((key, index) => {
    const delta = changes[key];
    const label = `${STAT_LABEL[key] || SHEET_LABEL[key] || key}${delta > 0 ? '+' : ''}${delta}`;
    const text = scene.add.text(x, y + index * 26, label, inkText(22, isGood(key, delta) ? '#2f7d57' : '#a33b32', {
      fontStyle: 'bold',
    })).setOrigin(0.5).setDepth(30);

    scene.tweens.add({
      targets: text,
      y: text.y - 46,
      alpha: 0,
      duration: 900,
      ease: 'Quad.easeOut',
      onComplete: () => text.destroy(),
    });
  });
}
