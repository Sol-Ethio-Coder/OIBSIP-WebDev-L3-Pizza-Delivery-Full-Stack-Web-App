const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const sendEmail = require('./sendEmail');

// Avoid spamming the admin: only re-alert for an item once every 6 hours.
const RE_ALERT_GAP_MS = 6 * 60 * 60 * 1000;

async function checkLowStock() {
  try {
    const items = await Inventory.find({});
    const low = items.filter(item => item.stockCount < item.lowStockThreshold);

    for (const item of low) {
      const alertedRecently =
        item.lastAlertSentAt &&
        Date.now() - new Date(item.lastAlertSentAt).getTime() < RE_ALERT_GAP_MS;

      if (alertedRecently) continue;

      const sent = await sendEmail({
        to: process.env.ADMIN_ALERT_EMAIL,
        subject: `Low stock alert: ${item.name}`,
        html: `
          <p><strong>${item.name}</strong> (${item.type}) is running low.</p>
          <p>Current stock: <strong>${item.stockCount}</strong> — threshold: ${item.lowStockThreshold}</p>
          <p>Please restock soon to avoid affecting orders.</p>
        `
      });

      if (sent) {
        item.lastAlertSentAt = new Date();
        await item.save();
      }
    }
  } catch (err) {
    console.error('Low stock check failed:', err.message);
  }
}

function startCronJobs() {
  const schedule = process.env.LOW_STOCK_CRON || '0 * * * *'; // default: hourly
  cron.schedule(schedule, checkLowStock);
  console.log(`Low-stock cron job scheduled: "${schedule}"`);
}

module.exports = { startCronJobs, checkLowStock };
