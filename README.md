# Extension zcode — افزونهٔ نگارش فارسی برای ایجنت ZCode

افزونهٔ `persian-writing` کاری می‌کند که ایجنت ZCode در گفتگوهای فارسی، خروجی کاملاً استاندارد فارسی بدهد:

- **نگارش**: نیم‌فاصلهٔ واقعی (U+200C) در «می‌شود، کتاب‌ها، بزرگ‌ترین»، حروف فارسی «ی/ک» به‌جای عربی، ارقام فارسی ۰-۹، نشانه‌گذاری فارسی «، ؛ ؟ «»».
- **راست‌چین/چپ‌چین**: ترکیب درست متن فارسی با واژه‌ها و کدهای لاتین (RLM، backtick)، بلوک‌های کد LTR، خروجی HTML با `dir="rtl"`, `lang="fa"` و CSS منطقی (مثل `margin-inline-start`).
- **رندر راست‌چین در خود چت** (تازه در 0.2.1، با آزمون زنده تأیید شد): پاراگراف‌های فارسی پاسخ در `<div dir="rtl">` پیچیده می‌شوند تا در ظرف LTR چت، راست‌چین رندر شوند؛ درون div به‌جای مارک‌داون از تگ HTML (`b`, `code`, `ul`) استفاده می‌شود، چون رندرکننده مارک‌داونِ درون عناصر HTML را پردازش نمی‌کند.

## اجزا (نسخهٔ 0.2.1)

```
plugins/
  marketplace.json                     مانیفست مارکت محلی توسعه (نام بازار: dev-exzcode-fa)
  persian-writing/                     سورس افزونه
    .zcode-plugin/plugin.json
    skills/persian-writing/SKILL.md    مهارت خودکارِ قواعد نگارش + Bidi
    commands/fa-fix.md                 دستور /fa-fix برای اصلاح متن یا فایل
    hooks/hooks.json                   هوک UserPromptSubmit — فقط وقتی پیام فارسی باشد
    hooks/prompt-hook.mjs              تشخیص فارسی + تزریق یادآور قواعد (خروجی صفر در خطا)
    scripts/fa-fix.mjs                 اصلاح‌گر مکانیکی: CLI و ماژول (fixText)
    tests/fa-fix.test.mjs              ۱۹ تست واحد
    tests/skill-e2e.test.mjs           ۸ تست رفتاری روی خروجی ایجنت شبیه‌سازی‌شده
    package.json                       فقط برای توسعه (npm test)
```

## سه لایهٔ تضمین

1. **هوک** (`UserPromptSubmit`): به‌محض ارسال هر پیام فارسی، یادآور کوتاه قواعد به‌صورت تضمینی به زمینهٔ گفتگو تزریق می‌شود — حتی اگر مهارت فعال نشده باشد. پیام غیرفارسی هیچ تأثیری ندارد.
2. **مهارت**: مجموعهٔ کامل قواعد، وقتی از کامپوزر انتخاب شود یا به‌طور خودکار فعال شود.
3. **دستور و اسکریپت** `/fa-fix`: اصلاح خودکار متن یا فایل — نخست گذر مکانیکی با `scripts/fa-fix.mjs`، سپس بازبینی زبانی ایجنت (محاوره، همزه، اصطلاح‌نویسی).

## نصب در ZCode (دستی)

1. در ZCode: **Plugin Marketplace → Add → Add Plugin Marketplace** و این مسیر را وارد کن: `D:\project personal\exzcode\plugins`
2. در **Personal → dev-exzcode-fa** روی «Persian Writing / نگارش فارسی» بزن و **Install** کن.
3. برای به‌روزرسانی از 0.1.0 به 0.2.0 (اگر نسخهٔ قبل را نصب کرده بودی): چرخ‌دندهٔ صفحهٔ بازار → **Refresh this marketplace** → در **Personal** روی افزونه **Update** بزن.

## نصب از گیت‌هاب (برای دیگران)

### راه ۱ — ریلیز (ساده‌ترین)

1. از صفحهٔ **Releases** مخزن، آخرین `persian-writing-x.y.z.zip` را بگیر و Extract کن؛ همان پوشهٔ extract شده، ریشهٔ مارکت است.
2. در ZCode: **Plugin Marketplace → Add → Add Plugin Marketplace** و همان پوشه را بده.
3. از **Personal → dev-exzcode-fa** افزونهٔ «Persian Writing / نگارش فارسی» را **Install** کن.
4. به‌روزرسانی: zip نسخهٔ جدید را Extract و جایگزین پوشهٔ قبل کن، سپس **Refresh this marketplace** + **Update**.

### راه ۲ — کلون (برای دنبال‌کردن تغییرها)

1. مخزن را کلون کن:
   ```bash
   git clone https://github.com/USERNAME/zcode-persian-writing.git
   ```
2. در ZCode: مسیر پوشهٔ `plugins` داخل مخزن کلون‌شده را به‌عنوان بازار اضافه کن (مثلاً `C:\src\zcode-persian-writing\plugins`).
3. Install کن؛ به‌روزرسانی: `git pull` داخل مخزن + **Refresh this marketplace** + **Update**.

> نیازمندی: Node روی سیستم (برای هوک و اسکریپت اصلاح). نصب مستقیم با نشانی گیت‌هاب از داخل UI آزموده نشده؛ هر دو راه بالا فقط یک پوشهٔ محلی می‌سازند و مسیر تضمینی‌اند.

### انتشار نسخهٔ جدید (برای نگه‌دارنده)

نسخه را در `plugin.json` و `marketplace.json` (هر دو) بالا ببر، تست‌ها را بگیر (`npm test`)، zip را بساز و در **Releases** با تگ `vx.y.z` هماهنگ با نسخهٔ مانیفست منتشر کن:

```powershell
# از ریشهٔ مخزن — خروجی: پوشهٔ extract شده خودش ریشهٔ مارکت است
Compress-Archive -Path README.md,LICENSE,plugins\marketplace.json,plugins\persian-writing -DestinationPath dist\persian-writing-x.y.z.zip -Force
```

## استفاده

- خودکار: هر وقت به ایجنت فارسی بنویسی، هوک و مهارت فعال می‌شوند.
- دستور `/fa-fix`: متن یا مسیر فایل بده، مثال: `/fa-fix README.md` یا `/fa-fix می شود فایل ها را ذخیره کني؟`
- اسکریپت مستقل (بی‌نیاز از ایجنت):
  ```
  node scripts/fa-fix.mjs file.md --write    # اصلاح و نوشتن روی فایل + گزارش
  node scripts/fa-fix.mjs file.md --check    # فقط بررسی؛ کد خروج ۱ یعنی نیازمند اصلاح
  node scripts/fa-fix.mjs file.md --json     # گزارش ساخت‌یافته + متن اصلاح‌شده
  ```

## تست (توسعه)

```
cd plugins/persian-writing
npm test        # یا: node --test tests/fa-fix.test.mjs tests/skill-e2e.test.mjs
```

- **۱۹ تست واحد**: هر قاعدهٔ اصلاح‌گر مکانیکی + موارد استثنا (می و شراب، لباس تر، خانه ایوان، کوه یخ، میخ کوبیدن) + محافظت کد/URL/تگ + بازگشت‌پذیری (idempotent).
- **۸ تست رفتاری (E2E)**: خروجی یک ایجنت شبیه‌سازی‌شده که فقط SKILL.md خوانده را به‌طور برنامه‌ای اعتبارسنجی می‌کند. برای بازتولید خروجی E2E، فایل نمونهٔ `tests/fixtures/skill-e2e-input.md` را به یک ایجنت تازه بده تا با قواعد SKILL.md بازنویسی‌اش کند و در `tests/skill-e2e/output.md` بنویسد؛ سپس `npm test`.
