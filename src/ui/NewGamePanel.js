/**
 * 文件：src/ui/NewGamePanel.js
 * 作用：开新局时给孩子取名字、选男孩还是女孩。
 * 名字用网页自带的输入框，这样中文输入法也能用。最多 6 个字，空着就随机一个。
 * 选了男孩，之后每个时期都是男孩的形象；选了女孩同理。
 */

import { COLORS, inkText } from '../config/constants.js';
import BasePanel from './BasePanel.js';
import { addPortrait } from './childArt.js';
import TextButton from './components/TextButton.js';

export const NAME_MAX = 6;
const NAMES = ['小满', '阿禾', '一一', '朵朵', '安安', '小舟', '乐乐', '知夏', '星河', '米粒', '小树', '嘉禾'];

export function cleanName(raw) {
  const name = String(raw || '').replace(/[\s{}<>]/g, '').slice(0, NAME_MAX);
  return name;
}

export default class NewGamePanel extends BasePanel {
  constructor(scene, { onStart, onClose }) {
    super(scene, { title: '新的一局', width: 820, height: 560 });
    this.gender = 'boy';
    this.cards = {};

    this.track(scene.add.text(this.centerX, this.top + 92, '给孩子取个名字', inkText(20, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0.5), 5);
    this.input = this.makeInput(this.centerX - 40, this.top + 146, this.randomName());
    const dice = new TextButton(scene, this.centerX + 160, this.top + 146, 110, 48, '换一个', () => {
      if (!this.canClick()) return;
      this.input.node.value = this.randomName();
    }, { fontSize: 16, depth: 206, color: 0x8a5a36, hoverColor: 0x6e4529 });
    this.objects.push(...dice.nodes());
    this.track(scene.add.text(this.centerX, this.top + 186, `最多 ${NAME_MAX} 个字，空着就随机取一个`, inkText(13, COLORS.muted)).setOrigin(0.5), 5);

    this.track(scene.add.text(this.centerX, this.top + 226, '是男孩还是女孩', inkText(20, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0.5), 5);
    this.addCard('boy', '男孩', this.centerX - 150, this.top + 340);
    this.addCard('girl', '女孩', this.centerX + 150, this.top + 340);

    const start = new TextButton(scene, this.centerX - 110, this.top + 500, 200, 56, '开始养育', () => {
      if (!this.canClick()) return;
      const name = cleanName(this.input.node.value) || this.randomName();
      scene.time.delayedCall(0, () => onStart({ name, gender: this.gender }));
    }, { fontSize: 20, depth: 206, color: 0xc45c26, hoverColor: 0xa84b1c });
    const back = new TextButton(scene, this.centerX + 110, this.top + 500, 180, 56, '返回', () => {
      if (!this.canClick()) return;
      scene.time.delayedCall(0, () => onClose());
    }, { fontSize: 20, depth: 206, color: 0x4a3424, hoverColor: 0x6b4b30 });
    this.objects.push(...start.nodes(), ...back.nodes());
    this.select('boy');
  }

  randomName() {
    const current = this.input?.node.value;
    const pool = NAMES.filter((name) => name !== current);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  makeInput(x, y, value) {
    const node = document.createElement('input');
    node.type = 'text';
    node.maxLength = NAME_MAX;
    node.value = value;
    node.setAttribute('aria-label', '孩子的名字');
    node.style.cssText = [
      'width:250px', 'height:44px', 'box-sizing:border-box', 'padding:0 12px',
      'font-size:24px', 'text-align:center', 'color:#3b2f25', 'background:#fffaf2',
      'border:3px solid #c45c26', 'border-radius:12px', 'outline:none',
      'font-family:"Microsoft YaHei","PingFang SC",sans-serif',
    ].join(';');
    node.addEventListener('keydown', (event) => event.stopPropagation());
    return this.scene.add.dom(x, y, node).setDepth(210);
  }

  addCard(gender, label, x, y) {
    const scene = this.scene;
    const bg = this.track(scene.add.rectangle(x, y, 230, 190, 0xfff9f0).setStrokeStyle(3, 0xe2d2bc), 4);
    const nodes = addPortrait(scene, { gender }, 'baby', x, y - 18, 62, 5);
    nodes.forEach((node) => this.track(node, 5));
    const text = this.track(scene.add.text(x, y + 70, label, inkText(20, COLORS.ink, { fontStyle: 'bold' })).setOrigin(0.5), 6);
    const hit = this.track(scene.add.rectangle(x, y, 230, 190, 0xffffff, 0.001), 8).setInteractive({ useHandCursor: true });
    hit.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      if (!this.canClick()) return;
      this.select(gender);
    });
    this.cards[gender] = { bg, text };
  }

  select(gender) {
    this.gender = gender;
    Object.entries(this.cards).forEach(([key, card]) => {
      const on = key === gender;
      const tint = key === 'girl' ? 0xd36b8c : 0x3d6ea8;
      card.bg.setStrokeStyle(on ? 5 : 3, on ? tint : 0xe2d2bc);
      card.bg.setFillStyle(on ? 0xfff1e4 : 0xfff9f0);
      card.text.setColor(on ? `#${tint.toString(16)}` : COLORS.ink);
      card.text.setText(on ? `✓ ${key === 'girl' ? '女孩' : '男孩'}` : (key === 'girl' ? '女孩' : '男孩'));
    });
  }

  destroy() {
    this.input?.destroy();
    this.input = null;
    super.destroy();
  }
}
