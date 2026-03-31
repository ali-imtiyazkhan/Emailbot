import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const WHATSAPP_API_VERSION = 'v22.0';

async function sendTest() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = process.env.WHATSAPP_RECIPIENT_PHONE || "918529428700";

  if (!token || !phoneId) {
    console.error("❌ Missing WhatsApp configuration in .env");
    return;
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneId}/messages`;
  const message = "🚀 *EmailBot Test Message*\n\nYour WhatsApp notifications are successfully configured. You will now receive high-priority email summaries directly here.";

  console.log(`Sending to ${recipient}...`);

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("✅ Success! Server response:", response.data);
  } catch (err) {
    console.error("❌ Failed to send message:", err.response?.data || err.message);
  }
}

sendTest();
