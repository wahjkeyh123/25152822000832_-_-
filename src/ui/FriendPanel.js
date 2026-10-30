/**
 * 文件：src/ui/FriendPanel.js
 * 作用：初中起左边「朋友」打开的面板。三个同学会，每回合只能找一个人。
 * 左边点人，右边用卡片做事。说明、效果和点击区分开，避免字叠在按钮上。
 */

import { COLORS, STAT_LABEL, inkText } from '../config/constants.js';
import {
  CLOSENESS_MAX, FRIENDS, closenessOf, closenessWord, getPal, palActions,
} from '../data/friends.js';
import BasePanel from './BasePanel.js';
import TextButton from './components/TextButton.js';
import { shade } from './theme/frame.js';

const CARD_W = 332;
const CARD_H = 132;
const CARD_GAP = 12;

export default class FriendPanel extends BasePanel {
  constructor(scene, state, { onAct, onClose }) {
    super(scene, { title: '朋友', width: 980, height: 640 });
    this.state = state;
    this.onAct = onAct;
    this.focusId = state.friend?.focusId || FRIENDS[0].id;
    this.tabs = [];
    this.cards = [];

    this.paintSide();
    FRIENDS.forEach((pal, index) => this.paintTab(pal, index));
    this.paintHeader();
    for (let i = 0; i < 4; i += 1) this.cards.push(this.makeCard());

    const close = new TextButton(scene, this.centerX, this.top + this.height - 30, 200, 42, '返回', () => {
      if (!this.canClick()) return;
      scene.time.delayedCall(0, () => onClose());
    }, { fontSize: 18, depth: 206, color: 0x4a3424, hoverColor: 0x6b4b30 });
    this.objects.push(...close.nodes());
    this.refresh(state);
  }

  paintSide() {
    const g = this.scene.add.graphics();
    g.fillStyle(0xf3e6d2, 0.9);
    g.fillRoundedRect(this.left + 22, this.top + 78, 204, 500, 16);
    this.track(g, 3);
  }

  paintHeader() {
    const scene = this.scene;
    const right = this.left + 248;
    this.portrait = this.paintPortrait(right + 44, this.top + 128);
    this.pname = this.track(scene.add.text(right + 100, this.top + 96, '', inkText(28, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    this.ptitle = this.track(scene.add.text(right + 100, this.top + 126, '', inkText(15, '#8a5a36')).setOrigin(0, 0.5), 5);
    this.closeness = this.track(scene.add.text(right + 100, this.top + 154, '', inkText(15)).setOrigin(0, 0.5), 5);
    this.word = this.track(scene.add.text(right + 100, this.top + 176, '', inkText(13, COLORS.muted)).setOrigin(0, 0.5), 5);
    const track = scene.add.rectangle(right + 100, this.top + 196, 400, 8, 0xe6d3ba).setOrigin(0, 0.5);
    this.bar = scene.add.rectangle(right + 100, this.top + 196, 0, 8, 0x3d6ea8).setOrigin(0, 0.5);
    this.track(track, 5);
    this.track(this.bar, 6);
    this.line = this.track(scene.add.text(right + 16, this.top + 216, '', inkText(14, COLORS.ink, {
      wordWrap: { width: 680, useAdvancedWrap: true },
    })).setOrigin(0, 0), 5);
    this.note = this.track(scene.add.text(right + 16, this.top + 250, '', inkText(13, COLORS.muted, {
      wordWrap: { width: 680, useAdvancedWrap: true },
    })).setOrigin(0, 0), 5);
  }

  paintTab(pal, index) {
    const scene = this.scene;
    const x = this.left + 32;
    const y = this.top + 96 + index * 118;
    const g = scene.add.graphics();
    this.track(g, 4);
    const hit = scene.add.rectangle(x + 92, y + 50, 184, 100, 0xffffff, 0.001).setOrigin(0.5);
    hit.setInteractive({ useHandCursor: true });
    hit.on('pointerup', () => {
      if (!this.canClick()) return;
      this.focusId = pal.id;
      if (this.state.friend) this.state.friend.focusId = pal.id;
      this.refresh(this.state);
    });
    this.track(hit, 6);
    this.track(scene.add.text(x + 36, y + 50, pal.glyph, inkText(18, '#fff8ee', { fontStyle: 'bold' })).setOrigin(0.5), 5);
    this.track(scene.add.text(x + 78, y + 32, pal.name, inkText(18, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    this.track(scene.add.text(x + 78, y + 54, pal.title, inkText(13, '#8a5a36')).setOrigin(0, 0.5), 5);
    const close = this.track(scene.add.text(x + 78, y + 76, '', inkText(12, COLORS.muted)).setOrigin(0, 0.5), 5);
    this.tabs.push({ pal, g, x, y, close });
  }

  paintPortrait(x, y) {
    const g = this.scene.add.graphics();
    this.track(g, 4);
    this.glyph = this.track(this.scene.add.text(x, y - 4, '', inkText(24, '#3d6ea8', { fontStyle: 'bold' })).setOrigin(0.5), 5);
    return { g, x, y };
  }

  makeCard() {
    const scene = this.scene;
    const g = scene.add.graphics();
    this.track(g, 4);
    const tag = this.track(scene.add.text(0, 0, '', inkText(12, '#8a5a36', { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    const name = this.track(scene.add.text(0, 0, '', inkText(18, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    const detail = this.track(scene.add.text(0, 0, '', inkText(13, COLORS.muted, {
      wordWrap: { width: CARD_W - 32, useAdvancedWrap: true },
      lineSpacing: 3,
    })).setOrigin(0, 0), 5);
    const effects = this.track(scene.add.text(0, 0, '', inkText(12, '#3d5a7a', {
      wordWrap: { width: CARD_W - 32, useAdvancedWrap: true },
    })).setOrigin(0, 1), 5);
    const hit = scene.add.rectangle(0, 0, CARD_W, CARD_H, 0xffffff, 0.001).setOrigin(0);
    this.track(hit, 6);
    const slot = {
      g, tag, name, detail, effects, hit, action: null, x: 0, y: 0, locked: false, used: false, hover: false, weekend: false, color: 0x3d6ea8,
    };
    hit.on('pointerover', () => {
      if (!slot.action || slot.locked || slot.used) return;
      slot.hover = true;
      this.paintCard(slot);
    });
    hit.on('pointerout', () => {
      slot.hover = false;
      this.paintCard(slot);
    });
    hit.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      if (!this.canClick() || !slot.action || slot.locked || slot.used) return;
      this.onAct(slot.action.id, this.focusId);
    });
    return slot;
  }

  cardLayout(count) {
    const areaX = this.left + 244;
    const areaY = this.top + 278;
    const areaW = 704;
    const rowW = count === 1 ? CARD_W : CARD_W * 2 + CARD_GAP;
    const startX = areaX + Math.round((areaW - rowW) / 2);
    const spots = [];
    for (let i = 0; i < count; i += 1) {
      let x;
      let y;
      if (count === 3 && i === 2) {
        x = startX + Math.round((rowW - CARD_W) / 2);
        y = areaY + CARD_H + CARD_GAP;
      } else {
        x = startX + (i % 2) * (CARD_W + CARD_GAP);
        y = areaY + Math.floor(i / 2) * (CARD_H + CARD_GAP);
      }
      spots.push({ x, y });
    }
    return spots;
  }

  paintCard(slot) {
    const { g, x, y, locked, used, hover, weekend, color } = slot;
    g.clear();
    const idle = weekend ? 0x8a5a36 : color;
    const fill = locked || used ? 0xf0e4d2 : hover ? 0xfff1dc : 0xfff8ee;
    g.fillStyle(0x000000, 0.12);
    g.fillRoundedRect(x + 2, y + 5, CARD_W, CARD_H, 14);
    g.fillStyle(fill, 1);
    g.fillRoundedRect(x, y, CARD_W, CARD_H, 14);
    g.fillStyle(idle, locked || used ? 0.28 : 1);
    g.fillRoundedRect(x + 3, y + 3, CARD_W - 6, 8, { tl: 10, tr: 10, bl: 0, br: 0 });
    g.lineStyle(2, locked || used ? 0xd2c2aa : idle, 0.9);
    g.strokeRoundedRect(x, y, CARD_W, CARD_H, 14);
  }

  drawPortrait(pal) {
    const { g, x, y } = this.portrait;
    g.clear();
    g.fillStyle(0x000000, 0.16);
    g.fillCircle(x + 3, y + 5, 42);
    g.fillStyle(0xf3e2c8, 1);
    g.fillCircle(x, y, 40);
    g.lineStyle(4, pal.color, 1);
    g.strokeCircle(x, y, 40);
    g.fillStyle(shade(pal.color, 0.85), 1);
    g.fillRoundedRect(x - 14, y + 6, 28, 16, 7);
    this.glyph.setText(pal.glyph);
    this.glyph.setColor(`#${shade(pal.color, 0.72).toString(16).padStart(6, '0')}`);
  }

  drawTab(tab, selected, closeness) {
    const { g, x, y, pal } = tab;
    g.clear();
    g.fillStyle(selected ? 0xfff4e4 : 0xf6ead8, 1);
    g.fillRoundedRect(x, y, 184, 100, 14);
    g.lineStyle(selected ? 3 : 1, selected ? pal.color : 0xd4c0a4, 1);
    g.strokeRoundedRect(x, y, 184, 100, 14);
    g.fillStyle(pal.color, 1);
    g.fillCircle(x + 36, y + 50, 22);
    tab.close.setText(`亲密度 ${closeness}`);
  }

  refresh(state, message = '') {
    this.state = state;
    const pal = getPal(this.focusId);
    const closeness = closenessOf(state, pal.id);
    this.drawPortrait(pal);
    this.pname.setText(pal.name);
    this.ptitle.setText(pal.title);
    this.closeness.setText(`亲密度 ${closeness}/${CLOSENESS_MAX}`);
    this.word.setText(closenessWord(pal, closeness));
    this.bar.width = Math.round(400 * Math.min(1, closeness / CLOSENESS_MAX));
    this.bar.setFillStyle(pal.color);
    this.line.setText(pal.line);
    this.tabs.forEach((tab) => this.drawTab(tab, tab.pal.id === pal.id, closenessOf(state, tab.pal.id)));

    const used = Boolean(state.friend?.actedThisRound);
    const last = state.friend?.lastId ? getPal(state.friend.lastId).name : '';
    this.note.setText(message || (used
      ? `这回合已经找过${last}了。结束本回合后，${last}更容易出现在当天的事里。`
      : '每回合只能找一个人。亲密度到 45 可约周末。'));
    this.note.setColor(message ? '#a33b32' : COLORS.muted);

    const list = palActions(pal);
    const spots = this.cardLayout(list.length);
    this.cards.forEach((slot, index) => {
      const action = list[index];
      slot.action = action || null;
      if (!action) {
        this.showCard(slot, false);
        return;
      }
      const pos = spots[index];
      slot.x = pos.x;
      slot.y = pos.y;
      slot.weekend = Boolean(action.need);
      slot.color = pal.color;
      slot.locked = Boolean(action.need && closeness < action.need);
      slot.used = used || Boolean(state.endingId);
      slot.hover = false;
      this.showCard(slot, true);
      this.placeCard(slot);
      this.paintCard(slot);
      slot.tag.setText(slot.locked ? `周末 · 亲密度 ${action.need} 解锁` : (slot.weekend ? '周末' : '校内'));
      slot.tag.setColor(slot.locked ? '#a35a1f' : (slot.weekend ? '#8a5a36' : '#3d6ea8'));
      slot.name.setText(action.name);
      slot.detail.setText(action.detail.replace(/\{name\}/g, state.child?.name || '孩子'));
      slot.effects.setText(effectsLine(action));
      slot.effects.setColor(slot.locked || slot.used ? '#8a7a68' : '#3d5a7a');
      slot.hit.disableInteractive();
      if (!slot.locked && !slot.used) slot.hit.setInteractive({ useHandCursor: true });
    });
  }

  placeCard(slot) {
    const { x, y } = slot;
    slot.hit.setPosition(x, y);
    slot.tag.setPosition(x + 16, y + 24);
    slot.name.setPosition(x + 16, y + 46);
    slot.detail.setPosition(x + 16, y + 62);
    slot.effects.setPosition(x + 16, y + CARD_H - 12);
  }

  showCard(slot, visible) {
    slot.g.setVisible(visible);
    slot.tag.setVisible(visible);
    slot.name.setVisible(visible);
    slot.detail.setVisible(visible);
    slot.effects.setVisible(visible);
    slot.hit.setVisible(visible);
    if (!visible) slot.hit.disableInteractive();
  }
}

function effectsLine(action) {
  const bits = [];
  Object.entries(action.effects || {}).forEach(([key, value]) => {
    bits.push(`${STAT_LABEL[key] || key}${value > 0 ? '+' : ''}${value}`);
  });
  if (action.closeness) bits.push(`亲密度+${action.closeness}`);
  if (action.energy) bits.push(`精力-${action.energy}`);
  if (action.money) bits.push(`积蓄${action.money > 0 ? '+' : ''}${action.money}`);
  if (action.sat) bits.push(`满意度${action.sat > 0 ? '+' : ''}${action.sat}`);
  return bits.join('  ');
}
