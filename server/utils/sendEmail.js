const nodemailer = require('nodemailer');

const port = Number(process.env.EMAIL_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  secure: port === 465, // true for 465 (implicit SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000, // 10s to establish the connection
  greetingTimeout: 10000,   // 10s to get the server greeting
  socketTimeout: 15000      // 15s of inactivity before giving up
});

async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    return true;
  } catch (err) {
    // Don't let a broken mail server take down a request — log and continue.
    console.error('Email send failed:', err.message);
    return false;
  }
}

module.exports = sendEmail;
