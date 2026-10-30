/**
 * 文件：src/systems/ActionSystem.js
 * 作用：自动检查仍用旧活动表走完各个时期。
 * 玩家界面的安排改走技能，不再从这里扣脑洞精力。
 */

import { formatSheetChanges, syncSheet } from './SheetSystem.js';
import { applyEffects } from './StatSystem.js';

export function canPerform(state, action) {
  if (state.household.money < action.cost) {
    return { ok: false, reason: '钱不够' };
  }
  return { ok: true, reason: '' };
}

export function performAction(state, action) {
  const check = canPerform(state, action);
  if (!check.ok) return check;

  state.household.money -= action.cost;
  applyEffects(state.child.stats, action.effects);
  const changes = syncSheet(state.child, action.effects);
  state.actionsThisYear.push(action.id);

  const costText = action.cost > 0 ? `，花费 ${action.cost} 元` : '';
  state.pushLog(`${action.name}：${formatSheetChanges(changes)}${costText}`);
  return { ok: true, changes, action };
}
