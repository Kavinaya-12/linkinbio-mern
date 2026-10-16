import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PROFILE_THEME, getProfileTheme, readableTextForColor } from "./profileTheme.js";

test("normalizes older saved themes with current presentation defaults", () => {
  assert.deepEqual(getProfileTheme({ backgroundColor: "#fafafa", linkStyle: "outline" }), {
    ...DEFAULT_PROFILE_THEME,
    backgroundColor: "#fafafa",
    linkStyle: "outline",
  });
});

test("maps unsupported saved typography choices to the professional sans default", () => {
  assert.equal(getProfileTheme({ fontStyle: "editorial" }).fontStyle, "sans");
  assert.equal(getProfileTheme({ fontStyle: "mono" }).fontStyle, "sans");
  assert.equal(getProfileTheme({ fontStyle: "sans" }).fontStyle, "sans");
});

test("chooses readable text for light and dark accent colors", () => {
  assert.equal(readableTextForColor("#c0a2ff"), "#17151c");
  assert.equal(readableTextForColor("#34214f"), "#ffffff");
});
