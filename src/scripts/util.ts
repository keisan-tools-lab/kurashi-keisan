// =============================================
// 計算機のページで共通して使う関数
//  ・数字の読み取り（全角数字・カンマもOK）
//  ・入力チェックとエラーメッセージ
//  ・入力するたびに計算し直す仕組み（watch）
// =============================================

/** id で要素を取り出す */
export const $ = (id: string) => document.getElementById(id) as HTMLElement;

/* ---------- 数字の読み取り ---------- */

/** 全角数字・全角記号・カンマ・空白を、計算できる形にそろえる */
function normalize(raw: string): string {
  return String(raw)
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[．。]/g, '.')
    .replace(/[－ー−‐―]/g, '-')
    .replace(/＋/g, '+')
    .replace(/[,，、\s　]/g, '');
}

/** 文字を数字に変える。empty=空欄、bad=数字ではない */
export function parseNum(raw: string): { value: number; empty: boolean; bad: boolean } {
  const s = normalize(raw);
  if (s === '') return { value: NaN, empty: true, bad: false };
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return { value: NaN, empty: false, bad: true };
  return { value: parseFloat(s), empty: false, bad: false };
}

/** 入力欄の要素から数字を取り出す（空欄・エラーのときは NaN） */
export function numOf(el: Element | null): number {
  const input = el as HTMLInputElement | null;
  if (!input || input.dataset.invalid === '1') return NaN;
  const r = parseNum(input.value);
  return r.empty || r.bad ? NaN : r.value;
}

/** id を指定して数字を取り出す */
export const num = (id: string) => numOf(document.getElementById(id));

/** 入力欄・プルダウンの値を文字のまま取り出す */
export const val = (id: string) => (document.getElementById(id) as HTMLInputElement).value;

/** 選ばれているラジオボタンの値 */
export function radio(name: string): string {
  const r = document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return r ? r.value : '';
}

/* ---------- 表示用 ---------- */

/** 3桁区切りの数字にする（d は小数点以下の桁数） */
export function fmt(n: number, d = 0): string {
  return Number.isFinite(n) ? n.toLocaleString('ja-JP', { maximumFractionDigits: d }) : '—';
}

/** 「1,234 円」の形にする */
export const yen = (n: number, d = 0) => (Number.isFinite(n) ? `${fmt(n, d)} 円` : '—');

/** 大きな答え用（単位を小さく表示） */
export const big = (n: number, unit = '円', d = 0) =>
  Number.isFinite(n) ? `${fmt(n, d)}<small>${unit}</small>` : '—';

/** 端数処理：floor=切り捨て / round=四捨五入 / ceil=切り上げ */
export function rnd(x: number, mode: string): number {
  if (mode === 'ceil') return Math.ceil(x - 1e-9);
  if (mode === 'round') return Math.round(x);
  return Math.floor(x + 1e-9);
}

/** 入力された文字を安全に表示する */
export const esc = (s: string) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/** 「項目名 … 値」の行をまとめて作る（<dl class="rows"> の中身） */
export const rows = (list: [string, string][]) =>
  list.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

/** 「1年2か月」の形にする */
export const ym = (months: number) =>
  (Math.floor(months / 12) ? `${Math.floor(months / 12)}年` : '') + (months % 12 ? `${months % 12}か月` : '');

/* ---------- 入力チェック ---------- */
// 入力欄には次の印（data-○○）をつけておくと、自動でチェックされます。
//   data-num       数字の欄
//   data-label     エラーメッセージに出す欄の名前
//   data-min / data-max   いくつ以上・いくつ以下
//   data-int       整数だけ
//   data-pos       0より大きい数だけ
//   data-optional  空欄でもよい
//   data-required  （日付など）選ばないといけない

function fieldName(el: HTMLElement): string {
  const label = (el.dataset.label || 'この欄').replace(/（.*?）/g, '').trim();
  const item = el.closest<HTMLElement>('.item');
  if (item && item.parentElement) {
    const no = Array.from(item.parentElement.children).indexOf(item) + 1;
    return `${item.dataset.kind ?? ''} ${no} の「${label}」`;
  }
  return `「${label}」`;
}

/** 1つの入力欄をチェックして、問題があればメッセージを返す */
function check(el: HTMLInputElement): string {
  const d = el.dataset;
  const name = fieldName(el);
  if ('num' in d) {
    const r = parseNum(el.value);
    if (r.empty) return 'optional' in d ? '' : `${name}を入力してください。`;
    if (r.bad) return `${name}には数字だけを入れてください（例：1280、1.5）。「円」や「%」は入れなくて大丈夫です。`;
    const v = r.value;
    if (Math.abs(v) > 1e15) return `${name}の数字が大きすぎます。`;
    if ('int' in d && !Number.isInteger(v)) return `${name}は小数ではなく、整数（1、2、3…）で入れてください。`;
    if ('pos' in d && v <= 0) return `${name}は 0 より大きい数字を入れてください。`;
    if (d.min !== undefined && v < Number(d.min)) return `${name}は ${fmt(Number(d.min))} 以上にしてください。`;
    if (d.max !== undefined && v > Number(d.max)) return `${name}は ${fmt(Number(d.max))} 以下にしてください。`;
    return '';
  }
  if ('required' in d && !el.value) return `${name}を選んでください。`;
  return '';
}

/** 入力欄の下にメッセージを出す（空文字なら消す） */
function showFieldError(el: HTMLInputElement, msg: string) {
  let p = document.getElementById(`${el.id}-error`);
  if (!p && msg) {
    p = document.createElement('p');
    p.className = 'error';
    p.id = `${el.id}-error`;
    el.closest('.field')?.appendChild(p);
    el.setAttribute('aria-describedby', p.id);
  }
  if (p) { p.textContent = msg; p.hidden = !msg; }
  el.closest('.inwrap')?.classList.toggle('is-error', !!msg);
  el.dataset.invalid = msg ? '1' : '';
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

/* ---------- 計算の中から出すエラー ---------- */
let problems: string[] = [];
/** 数字の組み合わせがおかしいときに、計算の中から呼ぶ（例：終了日が開始日より前） */
export function problem(msg: string) { problems.push(msg); }

const CRASH = '計算中に思わぬエラーが起きました。入力した数字を確認するか、ページを読み込み直してください。';

/** 結果欄の上に、まとめてエラーを出す */
function showResultAlert(result: Element, msgs: string[]) {
  const alert = result.querySelector<HTMLElement>('[data-alert]');
  const body = result.querySelector<HTMLElement>('[data-body]');
  if (!alert || !body) return;
  if (msgs.length) {
    alert.innerHTML = `<p class="alert-title">計算できません。次のところを確認してください。</p><ul>${msgs.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>`;
    alert.hidden = false;
    body.hidden = true;
  } else {
    alert.hidden = true;
    body.hidden = false;
  }
}

/**
 * 入力されるたびに「チェック → 計算 → 表示」を行う。
 * 戻り値の関数を呼ぶと、いつでも計算し直せます（行の追加・削除のあとなど）。
 */
export function watch(fn: () => void): () => void {
  const main = document.querySelector('main') as HTMLElement;
  const scopeOf = (el: Element) => el.closest('[data-scope]') ?? main;

  const run = () => {
    // 1. 入力チェック
    const errors = new Map<Element, string[]>();
    main.querySelectorAll<HTMLInputElement>('input[data-label]').forEach((el) => {
      const msg = check(el);
      showFieldError(el, msg);
      if (msg) {
        const sc = scopeOf(el);
        errors.set(sc, [...(errors.get(sc) ?? []), msg]);
      }
    });

    // 2. 計算
    problems = [];
    let crashed = false;
    try {
      fn();
    } catch (e) {
      console.error(e);
      crashed = true;
    }

    // 3. 結果欄にエラーをまとめて表示
    main.querySelectorAll('.result').forEach((result) => {
      const msgs = crashed ? [CRASH] : [...(errors.get(scopeOf(result)) ?? []), ...problems];
      showResultAlert(result, msgs);
    });
  };

  main.addEventListener('input', run);
  main.addEventListener('change', run);
  // 予想外のエラーが起きたときも、画面で知らせる
  window.addEventListener('error', () => {
    main.querySelectorAll('.result').forEach((r) => showResultAlert(r, [CRASH]));
  });
  run();
  return run;
}

/* ---------- 日付 ---------- */
const WEEK = ['日', '月', '火', '水', '木', '金', '土'];
export const pad = (n: number) => String(n).padStart(2, '0');
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** "2026-11-15" → 日数計算用の数値（時差の影響を受けないよう UTC で） */
export function parseDate(s: string): number | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return Date.UTC(y, m - 1, d);
}
export function jpDate(t: number): string {
  const d = new Date(t);
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日（${WEEK[d.getUTCDay()]}）`;
}
export const DAY = 86400000;
