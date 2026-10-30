/**
 * 文件：src/systems/AspirationSystem.js
 * 作用：「你更想成为什么」。初中开头选方向，高中开头在方向里选职业。
 * 选中后，相关两项属性每回合多长 1 点。改加成大小就改 BONUS。
 */

import { DIRECTIONS, getDirection } from '../data/aspirations.js';
import { careersOf, getCareer } from '../data/careers.js';
import { SHEET_LABEL } from '../data/attributes.js';

const BONUS = 1;

/** 进入某个时期时要不要问志向。初中问方向，高中问职业。 */
export function aspireQuestionFor(state) {
  if (state.yearIndex === 3 && !state.aspiration.direction) return 'direction';
  if (state.yearIndex === 4 && !state.aspiration.career) return 'career';
  return null;
}

/** 这一题能选哪些。高中时如果初中没选过方向，就把八个职业都列出来。 */
export function aspireOptions(state, question) {
  if (question === 'direction') return DIRECTIONS.map((item) => ({ ...item, kind: 'direction' }));
  const direction = state.aspiration.direction;
  const careers = direction ? careersOf(direction) : DIRECTIONS.flatMap((item) => careersOf(item.id));
  return careers.map((career) => ({
    id: career.id,
    label: career.name,
    blurb: career.line,
    keys: Object.keys(career.needs).slice(0, 2),
    kind: 'career',
  }));
}

function addGrowth(child, keys) {
  keys.forEach((key) => {
    child.growth[key] = (child.growth[key] ?? 0) + BONUS;
  });
}

export function chooseDirection(state, id) {
  const direction = getDirection(id);
  if (!direction) return { ok: false };
  state.aspiration.direction = direction.id;
  state.pendingAspire = null;
  addGrowth(state.child, direction.keys);
  const names = direction.keys.map((key) => SHEET_LABEL[key]).join('、');
  state.pushLog(`{name}说想往「${direction.label}」走。${names}每回合多长 ${BONUS} 点，同方向的书打八折。`);
  return { ok: true };
}

export function chooseCareer(state, id) {
  const career = getCareer(id);
  if (!career) return { ok: false };
  state.aspiration.career = career.id;
  if (!state.aspiration.direction) state.aspiration.direction = career.direction;
  state.pendingAspire = null;
  const keys = Object.keys(career.needs).slice(0, 2);
  addGrowth(state.child, keys);
  const names = keys.map((key) => SHEET_LABEL[key]).join('、');
  state.pushLog(`{name}说，以后想当${career.name}。${names}每回合多长 ${BONUS} 点。`);
  return { ok: true };
}

/** 答题。question 是 'direction' 或 'career'。 */
export function answerAspire(state, question, id) {
  return question === 'direction' ? chooseDirection(state, id) : chooseCareer(state, id);
}
