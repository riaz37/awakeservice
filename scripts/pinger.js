// Requires Node.js 18+ for global fetch
const CRON_URL = process.env.CRON_URL || 'http://localhost:3000/api/cron';

console.log(`Pinger started. Target: ${CRON_URL}`);

async function ping() {
    try {
        const res = await fetch(CRON_URL);
        const data = await res.json();
        console.log(`[${new Date().toISOString()}] Ping result:`, JSON.stringify(data));
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Ping failed:`, error.message);
    }
}

// Initial ping
ping();

// Schedule every 5 mins (or custom)
// Note: The /api/cron endpoint itself iterates over all monitors.
// This script just triggers that endpoint.
setInterval(ping, 5 * 60 * 1000);
