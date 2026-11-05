# zcode-persian-writing

**افزونهٔ نگارش فارسی برای ایجنت ZCode**

> **English:** A plugin for the ZCode agent that makes Persian output typographically correct: real ZWNJ (half-space), Persian yeh and kaf instead of the Arabic forms, Persian digits, correct RTL/LTR mixing, and RTL rendering in chat. It includes a prompt hook, a skill, and a `/fa-fix` command backed by a standalone Node.js script.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
![version](https://img.shields.io/badge/version-0.2.1-blue)

---

## این افزونه چه کاری می‌کند؟

ایجنت‌ها معمولاً در متن فارسی نیم‌فاصله را جا می‌اندازند، «ي» و «ك» عربی می‌نویسند و ترکیب فارسی و لاتین را به‌هم می‌ریزند. افزونهٔ `persian-writing` این مشکلات را در گفتگوهای فارسی برطرف می‌کند.

### نگارش

- نیم‌فاصلهٔ واقعی (U+200C) در واژه‌هایی مثل «می‌شود»، «کتاب‌ها» و «بزرگ‌ترین»
- حروف فارسی «ی» و «ک» به‌جای شکل‌های عربی «ي» و «ك»
- ارقام فارسی ۰ تا ۹
- نشانه‌گذاری فارسی: «،» «؛» «؟» و گیومهٔ فارسی

### راست‌چین و چپ‌چین

- ترکیب درست متن فارسی با واژه‌ها و کدهای لاتین (RLM، backtick)
- بلوک‌های کد به‌صورت LTR
- خروجی HTML با `dir="rtl"` و `lang="fa"` و CSS منطقی (مثل `margin-inline-start`)

### رندر راست‌چین در خود چت

پاراگراف‌های فارسی پاسخ در `<div dir="rtl">` پیچیده می‌شوند تا در ظرف LTR چت هم راست‌چین نمایش داده شوند. داخل این div به‌جای مارک‌داون از تگ‌های HTML (`b`، `code`، `ul`) استفاده می‌شود، چون رندرکننده مارک‌داونِ داخل عناصر HTML را پردازش نمی‌کند.

### نمونه

| قبل | بعد |
| --- | --- |
| می شود | می‌شود |
| فایل ها | فایل‌ها |
| كتاب | کتاب |

---

## نحوهٔ کار: سه لایه

1. **هوک** (`UserPromptSubmit`): با هر پیام فارسی، یادآور کوتاه قواعد به زمینهٔ گفتگو تزریق می‌شود، حتی اگر مهارت فعال نشده باشد. پیام غیرفارسی هیچ تأثیری ندارد و هوک در صورت خطا خروجی خالی می‌دهد.
2. **مهارت** (`SKILL.md`): مجموعهٔ کامل قواعد نگارش و Bidi، که از کامپوزر انتخاب یا به‌طور خودکار فعال می‌شود.
3. **دستور و اسکریپت `/fa-fix`**: اصلاح خودکار متن یا فایل. ابتدا یک گذر مکانیکی با `fa-fix.mjs` انجام می‌شود، سپس ایجنت بازبینی زبانی می‌کند (محاوره، همزه، اصطلاح‌نویسی).

---

## نصب

### پیش‌نیاز

- ZCode
- [Node.js](https://nodejs.org) (برای هوک و اسکریپت اصلاح)

### مراحل

1. مخزن را کلون کنید:

   ```bash
   git clone https://github.com/soheilmohajer-code/zcode-persian-writing.git
   ```

2. در ZCode به **Plugin Marketplace ← Add ← Add Plugin Marketplace** بروید و مسیر پوشهٔ `plugins` داخل مخزن کلون‌شده را وارد کنید. مثال:

   ```
   C:\src\zcode-persian-writing\plugins
   ```

3. در بخش **Personal ← dev-exzcode-fa**، افزونهٔ «Persian Writing / نگارش فارسی» را پیدا کنید و **Install** بزنید.

> نصب مستقیم با نشانی گیت‌هاب از داخل رابط ZCode آزموده نشده است. راه بالا (پوشهٔ محلی) راه تضمین‌شده است.

### به‌روزرسانی

```bash
cd zcode-persian-writing
git pull
```

سپس در ZCode روی چرخ‌دندهٔ صفحهٔ بازار **Refresh this marketplace** را بزنید و در **Personal** روی افزونه **Update** کنید.

---

## استفاده

### خودکار

کافی است به ایجنت فارسی بنویسید. هوک و مهارت به‌صورت خودکار فعال می‌شوند.

### دستور `/fa-fix`

متن یا مسیر فایل بدهید:

```
/fa-fix README.md
/fa-fix می شود فایل ها را ذخیره کني؟
```

### اسکریپت مستقل

بدون نیاز به ایجنت و فقط با Node.js:

```bash
node scripts/fa-fix.mjs file.md --write   # اصلاح و نوشتن روی فایل، همراه با گزارش
node scripts/fa-fix.mjs file.md --check   # فقط بررسی؛ کد خروج ۱ یعنی نیاز به اصلاح
node scripts/fa-fix.mjs file.md --json    # گزارش ساخت‌یافته و متن اصلاح‌شده
```

این اسکریپت را می‌توان در CI هم گذاشت: حالت `--check` در صورت وجود خطای نگارشی با کد خروج ۱ تمام می‌شود.

---

## ساختار پروژه

```
plugins/
  marketplace.json                    مانیفست مارکت (نام بازار: dev-exzcode-fa)
  persian-writing/                    سورس افزونه
    .zcode-plugin/plugin.json
    skills/persian-writing/SKILL.md   قواعد نگارش و Bidi
    commands/fa-fix.md                دستور /fa-fix
    hooks/hooks.json                  هوک UserPromptSubmit
    hooks/prompt-hook.mjs             تشخیص فارسی و تزریق یادآور قواعد
    scripts/fa-fix.mjs                اصلاح‌گر مکانیکی (CLI و ماژول)
    tests/fa-fix.test.mjs             ۱۹ تست واحد
    tests/skill-e2e.test.mjs          ۸ تست رفتاری
    package.json                      فقط برای توسعه (npm test)
```

---

## توسعه و تست

```bash
cd plugins/persian-writing
npm test
# یا
node --test tests/fa-fix.test.mjs tests/skill-e2e.test.mjs
```

- **۱۹ تست واحد** هر قاعدهٔ اصلاح‌گر را همراه با موارد استثنا (می و شراب، لباس تر، خانه ایوان، کوه یخ، میخ کوبیدن) می‌سنجند. حفاظت از کد، URL و تگ‌ها و بازگشت‌پذیری (idempotent) هم بررسی می‌شود.
- **۸ تست رفتاری** خروجی یک ایجنت شبیه‌سازی‌شده را که فقط `SKILL.md` را خوانده، به‌طور برنامه‌ای اعتبارسنجی می‌کنند. برای بازتولید خروجی، فایل `tests/fixtures/skill-e2e-input.md` را به یک ایجنت تازه بدهید تا طبق قواعد `SKILL.md` بازنویسی کند و نتیجه را در `tests/skill-e2e/output.md` بنویسد؛ سپس `npm test` را اجرا کنید.

---

## مشارکت

گزارش باگ، پیشنهاد قاعدهٔ جدید و Pull Request خوشحالم می‌کند. لطفاً قبل از ارسال تغییر، `npm test` را اجرا کنید و برای هر قاعدهٔ جدید یک تست (شامل موارد استثنا) اضافه کنید.

برای انتشار نسخهٔ جدید، شمارهٔ نسخه را هم در `plugin.json` و هم در `marketplace.json` بالا ببرید.

---

## مجوز

این پروژه با مجوز [MIT](LICENSE) منتشر شده است.
