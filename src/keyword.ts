import type { Action, Item } from "./types";

// Raycast-style keywords: an item with `keyword: "kd"` claims queries like
// "kd hello" and runs with "hello" bound to `{query}` in its action.
const PLACEHOLDER = "{query}";

// Single-quoted for the bash `eval` in bin/tmux-palette.sh.
export function shellQuote(s: string): string {
  return `'${s.replaceAll("'", `'\\''`)}'`;
}

function bindAction(action: Action, arg: string): Action {
  const q = shellQuote(arg);
  if ("tmux" in action) return { ...action, tmux: action.tmux.replaceAll(PLACEHOLDER, q) };
  if ("shell" in action) return { ...action, shell: action.shell.replaceAll(PLACEHOLDER, q) };
  if ("popup" in action) return { ...action, popup: action.popup.replaceAll(PLACEHOLDER, q) };
  return action;
}

const bound = new WeakSet<Item>();

/** Substitutes `{query}` with `arg`; without an argument it becomes `''`. */
export function bindKeyword(item: Item, arg = ""): Item {
  if (!item.keyword || bound.has(item)) return item;
  const out: Item = {
    ...item,
    description: arg ? `${item.keyword} › ${arg}` : item.description,
    action: bindAction(item.action, arg),
  };
  bound.add(out);
  return out;
}

/** "kd hello world" → the `kd` item bound to "hello world", else null. */
export function matchKeyword(items: Item[], filter: string): Item | null {
  const m = /^\s*(\S+)\s+(\S.*?)\s*$/.exec(filter);
  if (!m) return null;
  const word = m[1]!.toLowerCase();
  const item = items.find((i) => i.keyword?.toLowerCase() === word);
  return item ? bindKeyword(item, m[2]!) : null;
}
