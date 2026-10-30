/**
 * 文件：src/systems/EndingSystem.js
 * 作用：高中结束后决定大结局，以及落在哪个职业上。
 * 顺序：崩溃 → 志向职业够格 → 别的职业够格 → 都不够。
 * 改职业门槛去 src/data/careers.js，改结局文字去 src/data/endings.js。
 */

import { CAREERS, careerGap, careerMargin, careerStory, careerTier, getCareer, meetsCareer } from '../data/careers.js';
import { ENDINGS, isBurnout } from '../data/endings.js';
import { fillName } from '../utils/text.js';

export function judgeEnding(state) {
  const sheet = state.child.sheet;
  const examScore = state.exam?.score ?? 0;
  if (isBurnout(state.child.stats)) return { endingId: 'burnout', careerId: null };

  const wanted = getCareer(state.aspiration?.career);
  if (wanted && meetsCareer(wanted, sheet, examScore)) {
    return { endingId: 'dream', careerId: wanted.id };
  }

  const fit = CAREERS
    .filter((career) => meetsCareer(career, sheet, examScore))
    .sort((a, b) => careerMargin(b, sheet) - careerMargin(a, sheet));
  if (fit.length > 0) return { endingId: 'detour', careerId: fit[0].id };

  return { endingId: 'drift', careerId: null };
}

/** 一个职业都不够时，最接近的是哪个。结局页用它说「差一点就是……」。 */
export function closestCareer(state) {
  const sheet = state.child.sheet;
  return [...CAREERS].sort((a, b) => careerGap(a, sheet) - careerGap(b, sheet))[0];
}

export function getEnding(id) {
  return ENDINGS.find((ending) => ending.id === id) || ENDINGS[ENDINGS.length - 1];
}

/** 结局页左边那一段：四类开头 + 职业三档故事。崩溃 / 漂流会点出最接近的职业。 */
export function endingStory(state) {
  const ending = getEnding(state.endingId);
  const career = getCareer(state.career);
  const near = closestCareer(state);
  const extra = { near: near?.name || '一条路' };
  if (!career) return fillName(ending.text, state.child, extra);
  const tier = careerTier(career, state.child.sheet);
  const open = ending.open?.[tier] || ending.text || '';
  const body = careerStory(career, state.child.sheet);
  return fillName(`${open}\n\n${body}`, state.child, extra);
}

export { careerTier };
