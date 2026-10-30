/**
 * 文件：src/ui/ProfilePanel.js
 * 作用：点左上角头像后的个人信息。
 * 分块是：他是谁、朋友、心理、家里、心结、下一步建议。
 */

import { COLORS, inkText } from '../config/constants.js';
import { buildProfile } from '../data/profileText.js';
import { faceFor } from '../systems/StatSystem.js';
import { getStage } from '../data/stages.js';
import { wrapChinese } from '../utils/text.js';
import BasePanel from './BasePanel.js';
import { addPortrait, childArtKey } from './childArt.js';
import TextButton from './components/TextButton.js';

export default class ProfilePanel extends BasePanel {
  constructor(scene, state, onClose) {
    super(scene, { title: '个人信息', width: 1040, height: 640 });
    const profile = buildProfile(state);
    const stage = getStage(state.yearIndex);
    const left = this.left + 28;
    const right = this.left + 530;

    this.section(left, this.top + 78, 470, 150, '孩子');
    this.section(right, this.top + 78, 470, 150, '最亲密的朋友');
    this.section(left, this.top + 244, 470, 150, '心理状态');
    this.section(right, this.top + 244, 470, 170, '家里');
    this.section(left, this.top + 410, 470, 190, '心结');
    this.section(right, this.top + 430, 470, 170, '下一步');

    if (childArtKey(scene, state.child, stage.id)) {
      addPortrait(scene, state.child, stage.id, left + 60, this.top + 158, 46, 5).forEach((node) => this.track(node, 5));
    } else {
      this.track(scene.add.text(left + 60, this.top + 158, faceFor(state.child.stats, stage), inkText(42)).setOrigin(0.5), 5);
    }
    this.track(scene.add.text(left + 124, this.top + 136, profile.name, inkText(26)).setOrigin(0, 0.5), 5);
    this.track(scene.add.text(left + 124, this.top + 176, `${profile.gender}    ${profile.age}    ${profile.place}`, inkText(18, COLORS.muted)).setOrigin(0, 0.5), 5);

    this.block(right + 18, this.top + 124, profile.friends, 22);
    this.block(left + 18, this.top + 290, profile.mood, 20);
    this.block(right + 18, this.top + 290, `${profile.temper}\n${profile.style}`, 22);

    const knot = profile.knot;
    this.track(scene.add.circle(left + 90, this.top + 508, 42, knot.fill).setStrokeStyle(3, 0xd9c4a8), 5);
    this.track(scene.add.text(left + 90, this.top + 508, String(state.child.stats.stress), inkText(26, knot.color, { fontStyle: 'bold' })).setOrigin(0.5), 5);
    this.track(scene.add.text(left + 150, this.top + 458, knot.label, inkText(18, knot.color, { fontStyle: 'bold' })).setOrigin(0, 0), 5);
    this.block(left + 150, this.top + 488, knot.text, 16);

    this.block(right + 18, this.top + 478, profile.advice, 16);

    const close = new TextButton(scene, this.left + this.width - 48, this.top + 28, 56, 40, '关', () => {
      if (!this.canClick()) return;
      scene.time.delayedCall(0, () => onClose());
    }, { fontSize: 16, depth: 206, color: 0xa33b32, hoverColor: 0x7d2d27 });
    this.objects.push(...close.nodes());
  }

  section(x, y, w, h, title) {
    const g = this.scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(x, y, w, h, 12);
    g.lineStyle(2, COLORS.panelEdge, 1);
    g.strokeRoundedRect(x, y, w, h, 12);
    g.fillStyle(0xc45c26, 1);
    g.fillRoundedRect(x + 12, y + 10, Math.min(168, 28 + title.length * 22), 28, 8);
    this.track(g, 4);
    this.track(this.scene.add.text(x + 24, y + 24, title, inkText(16, '#fff8ee')).setOrigin(0, 0.5), 5);
  }

  block(x, y, text, maxChars) {
    this.track(this.scene.add.text(x, y, wrapChinese(text, maxChars), inkText(16, COLORS.ink, {
      lineSpacing: 6,
    })).setOrigin(0, 0), 5);
  }
}
