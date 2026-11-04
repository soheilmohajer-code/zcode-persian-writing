// تست واحد اصلاح‌گر مکانیکی نگارش فارسی — اجرا: node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import { fixText } from "../scripts/fa-fix.mjs";

const Z = "\u200C"; // نیم‌فاصله

test("می/نمی پیش از فعل نیم‌فاصله می‌گیرد", () => {
  assert.equal(fixText("این کار می شود و نمی دانم چرا"), `این کار می${Z}شود و نمی${Z}دانم چرا`);
});

test("می و شراب (میِ مستقل) دست‌نخورده می‌ماند", () => {
  assert.equal(fixText("می و شراب"), "می و شراب");
});

test("پسوند ها/های/هایی", () => {
  assert.equal(fixText("کتاب ها و کتاب های من"), `کتاب${Z}ها و کتاب${Z}های من`);
  assert.equal(fixText("این ها خوب است"), `این${Z}ها خوب است`);
});

test("تر پس از صفت‌های شناخته‌شده و ترین همیشه", () => {
  assert.equal(fixText("خانه بزرگ تر از این است"), `خانه بزرگ${Z}تر از این است`);
  assert.equal(fixText("مهم ترین نکته"), `مهم${Z}ترین نکته`);
  assert.equal(fixText("لباس تر است"), "لباس تر است"); // تر = خیس
});

test("X‌است پس از ه، و سرد است جدا می‌ماند", () => {
  assert.equal(fixText("خانه است"), `خانه${Z}است`);
  assert.equal(fixText("هوا سرد است"), "هوا سرد است");
});

test("X‌ای نکره؛ اما «خانه ایوان» خراب نمی‌شود", () => {
  assert.equal(fixText("خانه ای"), `خانه${Z}ای`);
  assert.equal(fixText("خانه ایوان را دیدم"), "خانه ایوان را دیدم");
});

test("حروف عربی → فارسی", () => {
  assert.equal(fixText("فایل ها را ذخيره كني"), `فایل${Z}ها را ذخیره کنی`);
});

test("ارقام: عربی و لاتین به فارسی؛ نسخه و همسایهٔ لاتین دست‌نخورده", () => {
  assert.equal(fixText("٠١٢٣"), "۰۱۲۳");
  assert.equal(fixText("سال 2024 بود"), "سال ۲۰۲۴ بود");
  assert.equal(fixText("نگارش 3"), "نگارش ۳");
  assert.equal(fixText("نسخه v2.1.0 آماده است"), `نسخه v2.1.0 آماده${Z}است`);
  assert.equal(fixText("ظرفیت 2GB است"), "ظرفیت 2GB است");
});

test("هزارگان و درصد", () => {
  assert.equal(fixText("قیمت 1,000 تومان"), "قیمت ۱٬۰۰۰ تومان");
  assert.equal(fixText("۵۰% تخفیف"), "۵۰٪ تخفیف");
});

test("نشانه‌گذاری فارسی", () => {
  assert.equal(fixText("سلام, خوبی? اول; دوم"), "سلام، خوبی؟ اول؛ دوم");
  assert.equal(fixText('او گفت "سلام دنیا" و رفت'), "او گفت «سلام دنیا» و رفت");
});

test("فاصله‌گذاری", () => {
  assert.equal(fixText("سلام ،  دنیا"), "سلام، دنیا");
  assert.equal(fixText("سلام،دنیا"), "سلام، دنیا");
  assert.equal(fixText("برگشتم ... و دیدم"), "برگشتم... و دیدم");
});

test("این‌که، آن‌که، به‌ترکیب‌ها", () => {
  assert.equal(fixText("این که خوب است"), `این${Z}که خوب است`);
  assert.equal(fixText("آن که رفت"), `آن${Z}که رفت`);
  assert.equal(fixText("به عنوان مثال"), `به${Z}عنوان مثال`);
  assert.equal(fixText("به طوری که ممکن باشد"), `به${Z}طوری${Z}که ممکن باشد`);
});

test("کسرهٔ اضافه: خانه ی من → خانهٔ من؛ کوه یخ دست‌نخورده", () => {
  assert.equal(fixText("خانه ی من"), "خانه\u06C0 من");
  assert.equal(fixText("کوه یخ گرفت"), "کوه یخ گرفت");
});

test("صورت‌های چسبیده: میخواهم → می‌خواهم؛ میخ (میخ کوبیدن) دست‌نخورده", () => {
  assert.equal(fixText("من میخواهم بروم"), `من می${Z}خواهم بروم`);
  assert.equal(fixText("میخ کوبیدن"), "میخ کوبیدن");
});

test("کد درون backtick و بلوک کد محافظت می‌شود", () => {
  const src = "برای نصب `npm install vite 2.1.0` اجرا کن, بعد می رود به سایت https://example.com/404?page=2";
  const out = fixText(src);
  assert.ok(out.includes("`npm install vite 2.1.0`"));
  assert.ok(out.includes("https://example.com/404?page=2"));
  assert.ok(out.includes(`می${Z}رود`));
});

test("بلوک کد محصور کامل محافظت می‌شود", () => {
  const src = "متن فارسی می شود\n\n```\nconst x = 10;\nif (ok) run();\n```\n\nدر پایان خانه است";
  const out = fixText(src);
  assert.ok(out.includes("const x = 10;"));
  assert.ok(out.includes(`متن فارسی می${Z}شود`));
  assert.ok(out.includes(`در پایان خانه${Z}است`));
});

test("سطر بدون فارسی دست‌نخورده می‌ماند", () => {
  assert.equal(fixText("Hello, is this ok? yes; fine"), "Hello, is this ok? yes; fine");
});

test("خروجی بازگشت‌پذیر است (idempotent)", () => {
  const src = "می شود فایل ها را ذخيره كني? بزرگ ترین خانه است و 1,000 تومان";
  const once = fixText(src);
  assert.equal(fixText(once), once);
});

test("تگ HTML دست‌نخورده می‌ماند", () => {
  const out = fixText('<div class="a" data-x="1,000">متن می شود</div>');
  assert.ok(out.includes('<div class="a" data-x="1,000">'));
  assert.ok(out.includes(`متن می${Z}شود`));
});
