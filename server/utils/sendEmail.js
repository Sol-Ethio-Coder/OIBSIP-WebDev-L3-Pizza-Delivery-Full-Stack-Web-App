// Sends email via the Resend HTTPS API instead of raw SMTP.
// Render (and several other free-tier hosts) block outbound SMTP connections
// entirely, so nodemailer over SMTP times out no matter the port. Resend's
// API runs over normal HTTPS (443), which isn't blocked the same way.
const RESEND_API_URL = 'https://api.resend.com/emails';

async function sendEmail({ to, subject, html }) {
  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Forno Pizza <onboarding@resend.dev>',
        to,
        subject,
        html
      })
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('Email send failed:', res.status, errorBody);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Email send failed:', err.message, err.cause || '');
    return false;
  }
}

module.exports = sendEmail;
