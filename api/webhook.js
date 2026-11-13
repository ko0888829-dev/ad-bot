export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('VOLT Bot Webhook Active');
  }

  const BOT_TOKEN = "9268751430:AAHNysSjix_l_j4VxRZq2VUZSpS9FDpA2bQ";
  const WEBAPP_URL = "https://ad-bot-jet.vercel.app";
  const FIREBASE_DB_URL = "https://adpro-bot-default-rtdb.firebaseio.com";
  const REF_REWARD = 50;

  const update = req.body;
  if (update && update.message && update.message.text) {
    const chatId = update.message.chat.id;
    const fromUser = update.message.from || {};
    const newUserId = String(fromUser.id || chatId);
    const firstName = fromUser.first_name || "User";
    const text = update.message.text.trim();

    if (text.startsWith('/start')) {
      const parts = text.split(/\s+/);
      const refCode = parts.length > 1 ? parts[1].trim() : '';

      // Server-side Referral Processing (100% Reliable)
      if (refCode && refCode !== newUserId && /^\d+$/.test(refCode)) {
        try {
          const userRes = await fetch(`${FIREBASE_DB_URL}/users/${newUserId}.json`);
          const existingUser = await userRes.json();

          // Only reward if this user has never been referred before
          if (!existingUser || !existingUser.referredBy) {
            await fetch(`${FIREBASE_DB_URL}/users/${newUserId}.json`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: firstName,
                username: fromUser.username || '',
                referredBy: refCode
              })
            });

            const refRes = await fetch(`${FIREBASE_DB_URL}/users/${refCode}.json`);
            const refData = await refRes.json();
            const newBal = ((refData && refData.balance) || 0) + REF_REWARD;
            const newCount = ((refData && refData.refCount) || 0) + 1;
            const newEarned = ((refData && refData.refEarned) || 0) + REF_REWARD;

            await fetch(`${FIREBASE_DB_URL}/users/${refCode}.json`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                balance: newBal,
                refCount: newCount,
                refEarned: newEarned
              })
            });

            // Notify the Referrer on Telegram
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: refCode,
                text: `🎉 <b>New Referral Joined!</b>\n\n👤 Friend: ${firstName}\n⚡ Reward: <b>+${REF_REWARD} VOLT</b> added to your balance!`,
                parse_mode: 'HTML'
              })
            });
          }
        } catch (e) {
          console.error('Webhook referral error:', e);
        }
      }

      const launchUrl = refCode ? `${WEBAPP_URL}?ref=${encodeURIComponent(refCode)}` : WEBAPP_URL;

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
