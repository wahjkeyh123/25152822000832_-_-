/**
 * 文件：src/ui/AspirationPanel.js
 * 作用：「你更想成为什么」。初中开头选方向，高中开头选职业。
 * 必须选一个才能关，选完相关两项属性每回合成长 +1。
 */

import { COLORS, inkText } from '../config/constants.js';
import { SHEET_LABEL } from '../data/attributes.js';
import { aspireOptions } from '../systems/AspirationSystem.js';
import BasePanel from './BasePanel.js';
import TextButton from './components/TextButton.js';

const COLORS_BY_INDEX = [
  [0x3d6ea8, 0x2f5684],
  [0xd36b8c, 0xb45574],
  [0x2f7d57, 0x256746],
  [0xc47b2a, 0xa5651f],
];

export default class AspirationPanel extends BasePanel {
  constructor(scene, state, question, onPick) {
    const options = aspireOptions(state, question);
    const cols = 2;
    const rows = Math.ceil(options.length / cols);
    const cellH = rows > 2 ? 90 : 120;
    super(scene, { title: '你更想成为什么', width: 900, height: 160 + rows * (cellH + 14) + 30 });
    const lead = question === 'direction'
      ? '小满上初中了。饭桌上，他第一次说起以后。'
      : '高中最后一段。小满说，他想好要做什么了。';
    this.track(scene.add.text(this.centerX, this.top + 92, lead, inkText(20, COLORS.ink)).setOrigin(0.5), 5);
    this.track(scene.add.text(this.centerX, this.top + 122, '选中后，相关的两项属性每回合多长 1 点。', inkText(15, COLORS.muted)).setOrigin(0.5), 5);

    options.forEach((option, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const keys = option.keys.map((key) => SHEET_LABEL[key]).join('、');
      const [color, hover] = COLORS_BY_INDEX[(question === 'direction' ? index : Math.floor(index / 2)) % COLORS_BY_INDEX.length];
      const button = new TextButton(
        scene,
        this.centerX - 205 + col * 410,
        this.top + 160 + cellH / 2 + row * (cellH + 14),
        390,
        cellH,
        `${option.label}\n${option.blurb}\n成长：${keys} +1`,
        () => {
          if (!this.canClick()) return;
          onPick(option.id);
        },
        { fontSize: 17, depth: 206, color, hoverColor: hover },
      );
      this.objects.push(...button.nodes());
    });
  }
}
