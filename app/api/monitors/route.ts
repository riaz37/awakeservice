import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const monitors = await prisma.monitor.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                logs: {
                    take: 50,
                    orderBy: { createdAt: 'asc' }, // Ascending for graph
                },
            },
        });
        return NextResponse.json(monitors);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch monitors' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, interval, method, headers, requestBody, maintenance, emailAlerts } = body;

        // Basic validation
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const monitor = await prisma.monitor.create({
            data: {
                url,
                interval: interval || 5,
                method: method || 'GET',
                headers: headers || {},
                body: requestBody || null,
                maintenance: maintenance || false,
                emailAlerts: emailAlerts || null,
            },
        });
        return NextResponse.json(monitor, { status: 201 });
    } catch (error) {
        console.error('Create monitor error', error);
        return NextResponse.json({ error: 'Failed to create monitor' }, { status: 500 });
    }
}
