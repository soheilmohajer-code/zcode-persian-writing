// هوک UserPromptSubmit: اگر پیام کاربر فارسی باشد، یادآورِ کوتاه قواعد به زمینه تزریق می‌شود؛
// در غیر این صورت خروجی خالی و خروج ۰ — هر خطا خاموش رد می‌شود تا جلسه کاربر هرگز نشکند.
let raw = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) raw += chunk;

try {
  const data = JSON.parse(raw);
  const prompt =
    typeof data.prompt === "string" ? data.prompt : typeof data.user_prompt === "string" ? data.user_prompt : "";
  if (/[\u0600-\u06FF\u200C\u200F]/.test(prompt)) {
    const reminder =
      "پیام کاربر فارسی است؛ قواعد افزونهٔ persian-writing الزامی‌اند: " +
      "(۱) نیم‌فاصلهٔ واقعی U+200C: می‌شود، نمی‌دانم، کتاب‌ها، بزرگ‌ترین، خانه‌است، این‌که؛ " +
      "(۲) ی/ک فارسی، نه ي/ك عربی؛ " +
      "(۳) ارقام فارسی ۰-۹ در متن فارسی؛ کد و شناسه در backtick؛ " +
      "(۴) نشانه‌گذاری فارسی ، ؛ ؟ «» و بدون فاصله پیش از نشانه؛ " +
      "(۵) رندر چت: هر پاراگراف عمدتاً فارسی را در <div dir=\"rtl\"> بپیچ؛ درون div مارک‌داون ننویس (به‌جای ** و backtick از تگ b و code استفاده کن)؛ فهرست با ul/ol دارای dir=\"rtl\"؛ بلوک کد fenced بیرون div و LTR بماند؛ " +
      "(۶) خروجی HTML: lang=\"fa\" و dir=\"rtl\" و CSS منطقی (مثل margin-inline-start)؛ " +
      "(۷) برای اصلاح خودکار متن یا فایل از دستور /fa-fix استفاده کن.";
    console.log(
      JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: reminder } }),
    );
  }
} catch {
  // ورودی نامعتبر: بدون خروجی
}
process.exit(0);
