import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const monitors = await prisma.monitor.findMany({
            where: { isActive: true },
        });

        const results = await Promise.all(
            monitors.map(async (monitor) => {
                // Skip if in maintenance mode
                if (monitor.maintenance) {
                    return { id: monitor.id, url: monitor.url, status: 'maintenance', responseTime: 0 };
                }

                const start = Date.now();
                let status = 'failed';
                let responseTime = 0;
                let logStatus = 'DOWN';

                try {
                    const options: RequestInit = {
                        method: monitor.method || 'GET',
                        headers: monitor.headers ? (monitor.headers as Record<string, string>) : {},
                    };

                    if (monitor.body && ['POST', 'PUT', 'PATCH'].includes(options.method!)) {
                        options.body = monitor.body;
                        if (!options.headers) options.headers = {};
                        (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
                    }

                    const res = await fetch(monitor.url, options);
                    status = res.ok ? 'success' : `error: ${res.status}`;
                    logStatus = res.ok ? 'UP' : 'DOWN';
                    responseTime = Date.now() - start;
                } catch (err: any) {
                    status = `error: ${err.message}`;
                    logStatus = 'ERROR';
                    responseTime = Date.now() - start;
                }

                // Update monitor and create log
                await prisma.$transaction([
                    prisma.monitor.update({
                        where: { id: monitor.id },
                        data: {
                            lastPing: new Date(),
                            status,
                        },
                    }),
                    prisma.monitorLog.create({
                        data: {
                            monitorId: monitor.id,
                            status: logStatus,
                            latency: responseTime,
                        },
                    }),
                ]);

                return { id: monitor.id, url: monitor.url, status, responseTime };
            })
        );

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
    }
}
