/**
 * Telegram Bot Integration
 * Envia notificações para o chat do Telegram quando novos pedidos são criados
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

/**
 * Envia uma mensagem para o chat do Telegram
 * @param message - Mensagem em formato HTML
 */
export async function sendTelegramMessage(message: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured. Message not sent.');
    return;
  }

  try {
    const response = await fetch(TELEGRAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to send Telegram message:', errorData);
      throw new Error(`Telegram API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    // Não lançamos o erro para não quebrar o fluxo de criação de pedidos
    // Apenas logamos o erro
  }
}

