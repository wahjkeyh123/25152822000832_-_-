/**
 * 文件：src/ui/components/StatBar.js
 * 作用：一条属性条。传入 0 到 100 的数字，它负责画长短和右侧的数字。
 * 顶栏和结局页共用，避免两处各写一套进度条。
 */

import { COLORS, STAT_LABEL, STAT_MAX, inkText } from '../../config/constants.js';

const BAR_COLOR = {
  study: 0x3d6ea8,
  body: 0x2f7d57,
  mood: 0xd39b2a,
  stress: 0xa33b32,
};

export default class StatBar {
  constructor(scene, x, y, width, key) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.key = key;
    this.label = scene.add.text(x, y, STAT_LABEL[key], inkText(16)).setDepth(4);
    this.valueText = scene.add.text(x + width, y, '0', inkText(16)).setOrigin(1, 0).setDepth(4);
    this.graphics = scene.add.graphics().setDepth(3);
    this.setValue(0);
  }

  setValue(value) {
    const safe = Math.max(0, Math.min(STAT_MAX, Math.round(value)));
    this.valueText.setText(String(safe));
    const barY = this.y + 24;
    this.graphics.clear();
    this.graphics.fillStyle(COLORS.barBg, 1);
    this.graphics.fillRoundedRect(this.x, barY, this.width, 12, 6);
    const fillWidth = (this.width * safe) / STAT_MAX;
    if (fillWidth > 0) {
      this.graphics.fillStyle(BAR_COLOR[this.key], 1);
      this.graphics.fillRoundedRect(this.x, barY, Math.max(fillWidth, 8), 12, 6);
    }
  }

  destroy() {
    this.label.destroy();
    this.valueText.destroy();
    this.graphics.destroy();
  }
}
