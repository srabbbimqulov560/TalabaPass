export const sendTelegramMessage = async (message: string) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram konfiguratsiyasi topilmadi (.env faylini tekshiring)");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML', // Matnni chiroyli qalin (bold) qilib yuborish uchun
      }),
    });
  } catch (error) {
    console.error("Telegramga xabar yuborishda xatolik", error);
  }
};