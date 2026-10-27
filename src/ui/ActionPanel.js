/**
 * 文件：src/ui/ActionPanel.js
 * 作用：屏幕下方的活动按钮。数据来自 src/data/actions.js。
 * 你加一条活动，这里会自动多一个按钮，并按数量把宽度摊开。
 */

import { LAYOUT } from '../config/constants.js';
import { getActionsForStage } from '../data/actions.js';
import { canPerform } from '../systems/ActionSystem.js';
import { formatEffectLines } from '../systems/StatSystem.js';
import TextButton from './components/TextButton.js';

function buildLabel(action, check) {
  const lines = formatEffectLines(action.effects, 2);
  const cost = action.cost > 0 ? `花费 ${action.cost} 元` : '不花钱';
  const footer = check.ok ? cost : check.reason;
  return [action.name, ...lines, footer].join('\n');
}

export default class ActionPanel {
  constructor(scene, onAction) {
    this.scene = scene;
    this.onAction = onAction;
    this.buttons = [];
    this.actions = [];
    this.signature = '';
  }

  /** 时期变了就拆掉旧按钮，按这个时期的活动重排。同一时期里只改文字和能不能点。 */
  refresh(state) {
    const actions = getActionsForStage(state.yearIndex);
    const signature = actions.map((action) => action.id).join(',');
    if (signature !== this.signature) {
      this.buttons.forEach((button) => button.destroy());
      this.actions = actions;
      this.signature = signature;
      this.buttons = this.createButtons(actions);
    }
    this.actions.forEach((action, index) => {
      const check = canPerform(state, action);
      const button = this.buttons[index];
      button.setLabel(buildLabel(action, check));
      button.setEnabled(check.ok);
    });
  }

  createButtons(actions) {
    const { y, h, left, gap, rightLimit } = LAYOUT.action;
    const count = Math.max(actions.length, 1);
    const width = Math.floor((rightLimit - left - gap * (count - 1)) / count);
    return actions.map((action, index) => {
      const x = left + width / 2 + index * (width + gap);
      return new TextButton(this.scene, x, y, width, h, action.name, () => {
        this.onAction(action);
      }, { fontSize: 15 });
    });
  }

  /** 键盘 1 到 5 调用这里。index 从 0 开始，对应这个时期从左到右的按钮。 */
  trigger(index) {
    const action = this.actions[index];
    const button = this.buttons[index];
    if (!action || !button) return;
    this.onAction(action);
  }
}
