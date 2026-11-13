export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('VOLT Bot Webhook Active');
  }

  const BOT_TOKEN = "9268751430:AAHNysSjix_l_j4VxRZq2VUZSpS9FDpA2bQ";
  const WEBAPP_URL = "https://ad-bot-jet.vercel.app";

  const update = req.body;
  if (update && update.message && update.message.text) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    const firstName = update.message.from?.first_name || "User";

    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const refCode = parts.length > 1 ? parts[1].trim() : '';
      const launchUrl = refCode ? `${WEBAPP_URL}?tgWebAppStartParam=${encodeURIComponent(refCode)}` : WEBAPP_URL;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `⚡ <b>Welcome to VOLT, ${firstName}!</b>\n\nWatch short ads, complete tasks, and withdraw real <b>TON</b> directly to your wallet.\n\n👇 Tap below to start earning:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "⚡ Open VOLT & Earn TON", web_app: { url: launchUrl } }],
              [{ text: "📢 Official Payout Channel", url: "https://t.me/GoldenSteal" }]
            ]
          }
        })
      });
    }
  }

  return res.status(200).json({ ok: true });
}
