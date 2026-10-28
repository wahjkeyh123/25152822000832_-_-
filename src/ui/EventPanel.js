/**
 * 文件：src/ui/EventPanel.js
 * 作用：弹出一件必须二选一的事。两个选项的结果不同，这是游戏里「真正要做决定」的地方。
 */

import { COLORS, inkText } from '../config/constants.js';
import { canChoose } from '../systems/EventSystem.js';
import { formatEffectLines } from '../systems/StatSystem.js';
import { fillName, wrapChinese } from '../utils/text.js';
import BasePanel from './BasePanel.js';
import TextButton from './components/TextButton.js';

function choiceLabel(choice, affordable, child) {
  const parts = formatEffectLines(choice.effects || {}, 3);
  if (choice.sat) parts.push(`满意度${choice.sat > 0 ? '+' : ''}${choice.sat}`);
  let cost = '不花钱';
  if (choice.money < 0) cost = `花费 ${-choice.money} 元`;
  if (choice.money > 0) cost = `得到 ${choice.money} 元`;
  const footer = affordable ? `${parts.join('  ')} · ${cost}` : '钱不够，选不了';
  return `${fillName(choice.text, child)}\n${footer}`;
}

export default class EventPanel extends BasePanel {
  constructor(scene, event, state, onChoose) {
    super(scene, { title: event.title, width: 820, height: 460 });
    this.buttons = [];
    const body = wrapChinese(fillName(event.text, state.child), 24);
    this.track(
      scene.add.text(this.centerX, this.top + 110, body, inkText(22, COLORS.ink, {
        align: 'center',
        lineSpacing: 8,
      })).setOrigin(0.5, 0),
      4,
    );

    event.choices.forEach((choice, index) => {
      const affordable = canChoose(state, choice);
      const button = new TextButton(
        scene,
        this.centerX,
        this.top + 250 + index * 88,
        700,
        76,
        choiceLabel(choice, affordable, state.child),
        () => {
          if (!this.canClick() || !canChoose(state, choice)) return;
          onChoose(index);
        },
        { fontSize: 18, depth: 206, color: index === 0 ? 0xc45c26 : 0x3d6ea8, hoverColor: index === 0 ? 0xa84b1c : 0x2f5684 },
      );
      button.setEnabled(affordable);
      this.buttons.push(button);
      this.objects.push(...button.nodes());
    });
  }
}
