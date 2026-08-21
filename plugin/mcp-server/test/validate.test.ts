import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync, cpSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateArtifact, validateContent } from "../src/validate.js";
import { loadTokens, type DesignTokens } from "../src/tokens.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const fixtures = join(here, "fixtures");

const tokens: DesignTokens = {
  name: "Aurora",
  colors: {
    primary: "#5E6AD2",
    secondary: "#1A1A2E",
    background: "#FFFFFF",
    text: "#0D0D0D",
    accent: "#00C2A8",
  },
};

describe("validateContent", () => {
  it("passes a clean presentation", () => {
    const html = `
      <section data-slide style="color:#0D0D0D;background:#FFFFFF"></section>
      <section data-slide style="color:#5E6AD2"></section>
    `;
    const result = validateContent(html, tokens, "presentation");
    assert.equal(result.ok, true);
  });

  it("fails on forbidden hex", () => {
    const html = `
      <section data-slide style="color:#ff00ff"></section>
      <section data-slide></section>
    `;
    const result = validateContent(html, tokens, "presentation");
    assert.equal(result.ok, false);
    assert.ok(result.violations.some((v) => v.rule === "colors"));
  });

  it("fails presentation with fewer than 2 slides", () => {
    const html = `<section data-slide style="color:#0D0D0D"></section>`;
    const result = validateContent(html, tokens, "presentation");
    assert.equal(result.ok, false);
    assert.ok(result.violations.some((v) => v.rule === "presentation-slides"));
  });

  it("fails static site without header or CTA", () => {
    const html = `<main style="color:#0D0D0D">Hello</main>`;
    const result = validateContent(html, tokens, "static-site");
    assert.equal(result.ok, false);
    assert.ok(result.violations.some((v) => v.rule === "static-site-header"));
    assert.ok(result.violations.some((v) => v.rule === "static-site-cta"));
  });
});

describe("validateArtifact", () => {
  const tmp = join(here, ".tmp-project");

  it("validates fixture presentation against tokens on disk", () => {
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(join(tmp, "designalign"), { recursive: true });
    mkdirSync(join(tmp, "out", "presentation"), { recursive: true });
    cpSync(join(fixtures, "tokens.json"), join(tmp, "designalign", "tokens.json"));
    cpSync(
      join(fixtures, "good-presentation.html"),
      join(tmp, "out", "presentation", "index.html"),
    );

    const loaded = loadTokens(tmp);
    assert.equal(loaded.name, "Aurora");

    const good = validateArtifact({
      projectRoot: tmp,
      path: "out/presentation/index.html",
      kind: "presentation",
    });
    assert.equal(good.ok, true, JSON.stringify(good.violations));

    writeFileSync(
      join(tmp, "out", "presentation", "index.html"),
      readFixture("bad-presentation.html"),
    );
    const bad = validateArtifact({
      projectRoot: tmp,
      path: "out/presentation/index.html",
      kind: "presentation",
    });
    assert.equal(bad.ok, false);
    assert.ok(bad.violations.some((v) => v.rule === "colors"));
    assert.ok(bad.violations.some((v) => v.rule === "presentation-slides"));

    rmSync(tmp, { recursive: true, force: true });
  });

  it("validates static site including sibling styles.css", () => {
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(join(tmp, "designalign"), { recursive: true });
    mkdirSync(join(tmp, "out", "site"), { recursive: true });
    cpSync(join(fixtures, "tokens.json"), join(tmp, "designalign", "tokens.json"));
    cpSync(join(fixtures, "good-site.html"), join(tmp, "out", "site", "index.html"));
    cpSync(join(fixtures, "styles.css"), join(tmp, "out", "site", "styles.css"));

    const result = validateArtifact({
      projectRoot: tmp,
      path: "out/site/index.html",
      kind: "static-site",
    });
    assert.equal(result.ok, true, JSON.stringify(result.violations));
    rmSync(tmp, { recursive: true, force: true });
  });
});

function readFixture(name: string): string {
  return readFileSync(join(fixtures, name), "utf8");
}
