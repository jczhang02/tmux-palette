import { describe, expect, test } from "bun:test";
import { bindKeyword, matchKeyword, shellQuote } from "../src/keyword";
import type { Item } from "../src/types";

const kd: Item = { title: "Dictionary", keyword: "kd", action: { popup: "kd-popup {query}" } };
const other: Item = { title: "Lazygit", action: { popup: "lazygit" } };

describe("keyword items", () => {
  test("binds the rest of the query to {query}", () => {
    const hit = matchKeyword([other, kd], "kd  look forward to ");
    expect(hit?.action).toEqual({ popup: "kd-popup 'look forward to'" });
    expect(hit?.description).toBe("kd › look forward to");
  });

  test("ignores queries without an argument or keyword", () => {
    expect(matchKeyword([kd], "kd")).toBeNull();
    expect(matchKeyword([kd], "kd ")).toBeNull();
    expect(matchKeyword([kd, other], "lazy git")).toBeNull();
  });

  test("matches the keyword case-insensitively", () => {
    expect(matchKeyword([kd], "KD hi")?.action).toEqual({ popup: "kd-popup 'hi'" });
  });

  test("binds an empty argument when chosen without one", () => {
    expect(bindKeyword(kd).action).toEqual({ popup: "kd-popup ''" });
  });

  test("does not substitute twice", () => {
    const once = bindKeyword(kd, "{query}");
    expect(bindKeyword(once).action).toEqual({ popup: "kd-popup '{query}'" });
  });

  test("quotes single quotes for bash", () => {
    expect(shellQuote("it's")).toBe(`'it'\\''s'`);
  });
});
