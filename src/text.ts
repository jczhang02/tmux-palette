const WIDE_RANGES: readonly [number, number][] = [
  [0x1100, 0x115f],
  [0x2329, 0x232a],
  [0x2e80, 0xa4cf],
  [0xac00, 0xd7a3],
  [0xf000, 0xf8ff],
  [0xfe10, 0xfe19],
  [0xfe30, 0xfe6f],
  [0xff00, 0xff60],
  [0xffe0, 0xffe6],
  [0x1f300, 0x1faff],
];

function strip(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

function isWide(code: number): boolean {
  return WIDE_RANGES.some(([lo, hi]) => code >= lo && code <= hi);
}

function isNonDisplay(code: number): boolean {
  return code === 0 || code < 32 || (code >= 0x7f && code < 0xa0);
}

export function charWidth(c: string): number {
  const code = c.codePointAt(0) ?? 0;
  if (isNonDisplay(code)) return 0;
  return isWide(code) ? 2 : 1;
}

export function displayWidth(s: string): number {
  return Array.from(strip(s)).reduce((w, c) => w + charWidth(c), 0);
}

/**
 * True for a chunk of typed text: one key, or a whole input-method commit
 * or paste ("放弃"), which arrives as one multi-character chunk. Control
 * keys and escape sequences start with or contain a C0/DEL code.
 */
export function isTextInput(key: string): boolean {
  return /^[^\x00-\x1f\x7f]+$/.test(key);
}

export function truncate(s: string, width: number): string {
  const current = displayWidth(s);
  if (current <= width) return s + " ".repeat(width - current);
  const plain = strip(s);
  let result = "";
  let used = 0;
  for (const c of Array.from(plain)) {
    const next = used + charWidth(c);
    if (next >= width) break;
    result += c;
    used = next;
  }
  return result + "…" + " ".repeat(Math.max(0, width - used - 1));
}

export function autoAlias(title: string): string | null {
  const words = title.split(/\s+/).filter((w) => /^[a-z]/i.test(w));
  if (words.length < 2) return null;
  return words
    .map((w) => w[0]!)
    .join("")
    .toLowerCase();
}
