#!/usr/bin/env node
// اصلاح مکانیکی نگارش فارسی — گذر اول تعمیرها؛ موارد نیازمند شعور زبانی به ایجنت واگذار می‌شود.
// کاربرد: node fa-fix.mjs <file> [--check] [--no-digits] [--write] [--json] | node fa-fix.mjs --stdin < text.txt
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ZWNJ = "\u200C";
const P = "\u0621-\u06FF"; // نویسه‌های عربی/فارسی شامل پ چ ژ گ ی ک و ارقام
const PERSIAN = new RegExp(`[${P}]`);
const BOUND = `\\s|[،؛؟!…«»"')\\]}>/]|$`;

const categories = [];
function report(type, sample) {
  let c = categories.find((x) => x.type === type);
  if (!c) categories.push((c = { type, count: 0, samples: [] }));
  c.count++;
  if (sample && c.samples.length < 3 && !c.samples.includes(sample)) c.samples.push(sample);
}
function ctx(s, off, back = 15, fwd = 15) {
  return s.slice(Math.max(0, off - back), off + fwd).trim();
}

// بخش‌های محافظت‌شده: بلوک کد، کد درون‌خطی، نشانی وب، رایانامه و تگ HTML
// شاخص جای‌نگهدار با ارقام فارسی نوشته می‌شود تا قواعد تبدیل رقم، خودِ جای‌نگهدار را خراب نکنند.
const toFaDigits = (n) => [...String(n)].map((d) => String.fromCharCode(0x6f0 + Number(d))).join("");
const fromFaDigits = (s) => Number([...s].map((d) => d.charCodeAt(0) - 0x6f0).join(""));

function protect(text) {
  const tokens = [];
  const patterns = [
    /```[\s\S]*?```/g,
    /`[^`\n]+`/g,
    /https?:\/\/[^\s<>"')\]]+/g,
    /www\.[^\s<>"')\]]+/g,
    /[\w.+-]+@[\w-]+\.[\w.]+/g,
    /<[^>\n]+>/g,
  ];
  let out = text;
  for (const re of patterns) out = out.replace(re, (m) => `\u0000${toFaDigits(tokens.push(m) - 1)}\u0000`);
  return { out, tokens };
}

function fixLine(line, opts) {
  if (!PERSIAN.test(line)) return line;

  // ارقام عربی هندی همیشه فارسی می‌شوند
  line = line.replace(/[\u0660-\u0669]/g, (d) => {
    report("ارقام عربی → فارسی", d);
    return String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x06f0);
  });

  // ارقام لاتین: فقط اگر همسایهٔ لاتین یا نسخه‌ای نباشند
  if (!opts.noDigits) {
    line = line.replace(/(?<![\p{L}\d.])(\d+)(?!\d*(?:[.\u066B]\d))(?![\p{L}])/gu, (m) => {
      report("ارقام لاتین → فارسی", m);
      return [...m].map((d) => String.fromCharCode(d.charCodeAt(0) - 48 + 0x06f0)).join("");
    });
    line = line.replace(/([۰-۹])%/gu, (m, d) => {
      report("نشان ٪ فارسی", m);
      return d + "\u066A";
    });
  }

  // جداکنندهٔ هزارگان فارسی
  line = line.replace(/([۰-۹]),(?=[۰-۹]{3}(?:[^,\d۰-۹]|$))/gu, (m, d, off, s) => {
    report("جداکنندهٔ هزارگان ٬", ctx(s, off));
    return d + "\u066C";
  });

  // نشانه‌های سجاوندی فارسی
  line = line.replace(/,(?=\s|[^\p{L}\d])/gu, (m, off, s) => {
    const before = s[off - 1] ?? "";
    const after = (s.slice(off + 1).trimStart()[0] ?? "");
    if (PERSIAN.test(before) || PERSIAN.test(after)) {
      report("ویرگول فارسی ،", ctx(s, off));
      return "،";
    }
    return m;
  });
  if (/;/.test(line)) {
    line = line.replace(/;/gu, (m, off, s) => {
      if (!PERSIAN.test(s[off - 1] ?? "")) return m;
      report("نقطه‌ویرگول فارسی ؛", ctx(s, off, 15, 10));
      return "؛";
    });
  }
  line = line.replace(/\?(?=[\s\u066A»"')\]}]|$)/gu, (m, off, s) => {
    if (PERSIAN.test(s[off - 1] ?? "") || /[»"']$/.test(s.slice(0, off))) {
      report("علامت سؤال فارسی ؟", ctx(s, off, 15, 5));
      return "؟";
    }
    return m;
  });
  line = line.replace(/"([^"\n]*[\u0621-\u06FF][^"\n]*)"/gu, (m, inner, off, s) => {
    report("گیومهٔ فارسی «»", ctx(s, off, 5, 25));
    return "«" + inner + "»";
  });

  // حروف عربی → فارسی
  for (const [re, to, label] of [
    [/\u064A/g, "\u06CC", "ي → ی"],
    [/\u0649/g, "\u06CC", "ى → ی"],
    [/\u0643/g, "\u06A9", "ك → ک"],
  ]) {
    if (re.test(line)) {
      line = line.replace(re, to);
      report(`حروف عربی → فارسی (${label})`, line.trim().slice(0, 30));
    }
  }

  // فاصله: پیش از نشانه‌ها نباشد، پس از آن‌ها یکی باشد
  line = line.replace(/ +([،؛؟!:.,])/gu, (m, p, off, s) => {
    report("فاصلهٔ زائد پیش از نشانه", ctx(s, off, 20, 5));
    return p;
  });
  line = line.replace(/([،؛؟!…])(?=[\u0621-\u06FF\u06F0-\u06F9])/gu, (m, p, off, s) => {
    report("فاصلهٔ پس از نشانه", ctx(s, off, 5, 20));
    return p + " ";
  });

  // نیم‌فاصله: می/نمی پیش از فعل (واژهٔ بعد «و» نباشد تا «می و شراب» خراب نشود)
  line = line.replace(/(^|[^\p{L}\u200C])(نمی|می)[ \t]+(?=[\u0621-\u06FF])(?!\u0648[ \t])/gu, (m, pre, pre2, off, s) => {
    report("نیم‌فاصله (می/نمی)", ctx(s, off, 10, 20));
    return pre + pre2 + ZWNJ;
  });

  // پسوند ها/های/هایی پس از حرف فارسی و پیش از مرز واژه
  line = line.replace(/(?<=[\u0621-\u06FF])[ \t]+(هایی|های|ها)(?=\s|[،؛؟!…«»"')\]}]|$)/gu, (m, suf, off, s) => {
    report(`نیم‌فاصله (${suf})`, ctx(s, off, 15, 10));
    return ZWNJ + suf;
  });

  // ترین همیشه نیم‌فاصله دارد
  line = line.replace(/(?<=[\u0621-\u06FF])[ \t]+ترین(?=\s|[،؛؟!…«»"')\]}]|$)/gu, (m, off, s) => {
    report("نیم‌فاصله (ترین)", ctx(s, off, 15, 10));
    return ZWNJ + "ترین";
  });

  // تر فقط پس از صفت‌های پرکاربرد («لباس تر» دست‌نخورده می‌ماند)
  const ADJ = "بزرگ|کوچک|خوب|سریع|ساده|آسان|مهم|قوی|ضعیف|بلند|کوتاه|دور|نزدیک|زیاد|گرم|سرد|بالا|پایین|جوان|قدیمی|جدید|سخت|راحت|شیرین|خوشحال|ناراحت|خطرناک|عمیق|پهن|سبک|سنگین|تمیز|کثیف|شفاف|قشنگ|زیبا|تند|آرام|کم";
  line = line.replace(new RegExp(`(?<=${ADJ})[ \\t]+تر(?=\\s|[،؛؟!…«»"')\\]}]|از\\s|$)`, "gu"), (m, off, s) => {
    report("نیم‌فاصله (تر)", ctx(s, off, 20, 10));
    return ZWNJ + "تر";
  });

  // است پس از واژهٔ منتهی به ه
  line = line.replace(/(\p{L}*\u0647)[ \t]+است(?=\s|[،؛؟!…«»"')\]}]|$)/gu, (m, w, off, s) => {
    report("نیم‌فاصله (X‌است)", ctx(s, off, 20, 10));
    return w + ZWNJ + "است";
  });

  // ای نکره پس از ه (مرز واژه بررسی می‌شود تا «خانه ایوان» خراب نشود)
  line = line.replace(/(\p{L}*\u0647)[ \t]+ای(?=\s|[،؛؟!…«»"')\]}]|$)/gu, (m, w, off, s) => {
    report("نیم‌فاصله (X‌ای)", ctx(s, off, 20, 12));
    return w + ZWNJ + "ای";
  });

  // این‌که / آن‌که / به‌ترکیب‌ها / طوری‌که
  line = line.replace(/(^|[^\p{L}\u200C])(این|آن)[ \t]+که(?=[^\p{L}]|$)/gu, (m, pre, w, off, s) => {
    report(`نیم‌فاصله (${w}‌که)`, ctx(s, off, 10, 15));
    return pre + w + ZWNJ + "که";
  });
  line = line.replace(/(^|[^\p{L}\u200C])به[ \t]+(عنوان|طور|ویژه|علاوه|خصوص|طوری)(?=[^\p{L}]|$)/gu, (m, pre, w, off, s) => {
    report(`نیم‌فاصله (به‌${w})`, ctx(s, off, 10, 20));
    return pre + "به" + ZWNJ + w;
  });
  line = line.replace(/(طوری)[ \t]+که(?=[^\p{L}]|$)/gu, (m, w, off, s) => {
    report("نیم‌فاصله (طوری‌که)", ctx(s, off, 15, 15));
    return w + ZWNJ + "که";
  });

  // ه + یِ اضافه → هٔ (فقط یِ تک‌حرفی؛ «کوه یخ» دست نمی‌خورد)
  line = line.replace(/(\p{L}*\u0647)[ \t]+ی(?=\s|[،؛؟!…«»"')\]}]|$)/gu, (m, w, off, s) => {
    report("کسرهٔ اضافه (هٔ)", ctx(s, off, 15, 12));
    return w + "\u06C0";
  });

  // صورت‌های چسبیدهٔ پرکاربرد: میخواهم → می‌خواهم
  line = line.replace(/(^|[^\p{L}\u200C])می(?=(?:خواه|خورد|بین|دان|شو|گوی|کن|ده|آی|رو)[\u0621-\u06FF])/gu, (m, pre, off, s) => {
    report("نیم‌فاصله (می‌چسبیده)", ctx(s, off, 10, 15));
    return pre + "می" + ZWNJ;
  });

  return line;
}

function fixText(text, opts = {}) {
  const { out: masked, tokens } = protect(text);
  const fixed = masked
    .split("\n")
    .map((l) => {
      const lead = l.match(/^[ \t]*/)[0];
      const trail = l.match(/[ \t]*$/)[0];
      const body = l.slice(lead.length, l.length - trail.length);
      let done = fixLine(body, opts);
      done = done.replace(/([^\t])[ \t]{2,}(?=[^\s])/gu, (m, c, off, s) => {
        report("فاصلهٔ دوتایی", ctx(s, off, 10, 15));
        return c + " ";
      });
      return lead + done + trail;
    })
    .join("\n");
  // پاک‌سازی نویسه‌های کنترلی زائد، پیش از بازگردانی بخش‌های محافظت‌شده
  const cleaned = fixed.replace(/\u200C{2,}/g, ZWNJ).replace(/ +\u200C/g, ZWNJ);
  return cleaned.replace(/\u0000([\u06F0-\u06F9]+)\u0000/g, (_, i) => tokens[fromFaDigits(i)]);
}

export { fixText, protect };

// ─── CLI ───
function main() {
  const args = process.argv.slice(2);
  const opts = {
    check: args.includes("--check"),
    noDigits: args.includes("--no-digits"),
    write: args.includes("--write"),
    json: args.includes("--json"),
  };
  const fileArg = args.find((a) => !a.startsWith("--"));

  let input;
  if (fileArg) input = readFileSync(resolve(fileArg), "utf8");
  else input = readFileSync(0, "utf8");

  const output = fixText(input, opts);
  const changed = output !== input;
  const detail = categories.map((c) => ({ ...c }));

  function summary() {
    for (const c of detail) console.error(`  - ${c.type}: ${c.count}${c.samples.length ? " | نمونه: " + c.samples[0] : ""}`);
  }

  if (opts.json) {
    console.log(JSON.stringify({ changed, categories: detail, ...(opts.check ? {} : { output }) }));
  } else if (opts.check) {
    if (changed) {
      console.error("نیازمند اصلاح:");
      summary();
      process.exitCode = 1;
      return;
    }
    console.error("تمیز است.");
  } else if (opts.write && fileArg) {
    writeFileSync(resolve(fileArg), output, "utf8");
    console.error(`نوشته شد: ${resolve(fileArg)}`);
    if (detail.length) {
      console.error("تغییرها:");
      summary();
    }
  } else {
    process.stdout.write(output);
    if (detail.length) {
      console.error("\n----تغییرها----");
      summary();
    }
  }
  if (opts.check) process.exitCode = changed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
