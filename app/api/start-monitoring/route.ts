// This route auto-starts monitoring when the Next.js server boots
let monitoringInterval: NodeJS.Timeout | null = null;

async function pingCron() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/cron`);
        const data = await res.json();
        console.log(`[${new Date().toISOString()}] Monitoring ping:`, data);
    } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Monitoring ping failed:`, error.message);
    }
}

// Start monitoring on server initialization
if (!monitoringInterval) {
    console.log('🔄 Starting automatic monitoring (5-minute interval)...');
    pingCron(); // Initial ping
    monitoringInterval = setInterval(pingCron, 5 * 60 * 1000);
}

export async function GET() {
    return Response.json({
        status: 'Monitoring active',
        interval: '5 minutes',
        active: !!monitoringInterval
    });
}
