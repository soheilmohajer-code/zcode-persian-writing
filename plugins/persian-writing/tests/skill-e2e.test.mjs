// تست رفتاری E2E: خروجی ایجنتِ شبیه‌سازی‌شده (که فقط SKILL.md را خوانده) را اعتبارسنجی می‌کند.
// پیش‌نیاز: tests/skill-e2e/output.md باید پیش‌تر توسط زیرایجنت تولید شده باشد (به README بخش تست).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "skill-e2e", "output.md");

test("خروجی E2E موجود است", () => {
  assert.ok(existsSync(outPath), "اول زیرایجنت شبیه‌ساز مهارت را اجرا کن (README بخش تست)");
});

const out = existsSync(outPath) ? readFileSync(outPath, "utf8") : "";
const outsideCode = out.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]+`/g, "");

test("بدون حروف عربی ي/ى/ك", () => {
  assert.doesNotMatch(out, /[\u064A\u0649\u0643]/);
});

test("بدون ارقام عربی ٠-٩", () => {
  assert.doesNotMatch(out, /[\u0660-\u0669]/);
});

test("نیم‌فاصله‌های واقعی به اندازهٔ کافی (≥۶)", () => {
  assert.ok((out.match(/\u200C/g) || []).length >= 6);
});

test("نشانه‌گذاری فارسی: ؟ ، «»", () => {
  assert.ok(out.includes("؟") && out.includes("،") && out.includes("«"));
});

test("رقم لاتین بیرون از backtick صفر است", () => {
  assert.equal((outsideCode.match(/[0-9]/g) || []).length, 0);
});

test("محاوره‌نویسی حذف شده است", () => {
  assert.doesNotMatch(out.replace(/\u200C/g, " "), /(^|\s)(رو|می دونم|می شه|می خوام|اینه)(\s|$|[،؟.])/);
});

test("خروجی از چک مکانیکی fa-fix نیز عبور می‌کند", () => {
  execFileSync(process.execPath, [join(here, "..", "scripts", "fa-fix.mjs"), outPath, "--check"], {
    stdio: ["ignore", "ignore", "pipe"],
  });
});
