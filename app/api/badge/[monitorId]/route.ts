import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ monitorId: string }> }) {
    const { monitorId } = await params;

    try {
        const monitor = await prisma.monitor.findUnique({
            where: { id: monitorId },
            select: { status: true, maintenance: true },
        });

        if (!monitor) {
            return NextResponse.redirect('https://img.shields.io/badge/Status-Unknown-grey?style=for-the-badge');
        }

        if (monitor.maintenance) {
            return NextResponse.redirect('https://img.shields.io/badge/Status-Maintenance-yellow?style=for-the-badge');
        }

        if (monitor.status === 'success') {
            return NextResponse.redirect('https://img.shields.io/badge/Uptime-100%25-success?style=for-the-badge');
        } else {
            return NextResponse.redirect('https://img.shields.io/badge/Status-Down-critical?style=for-the-badge');
        }
    } catch (error) {
        return NextResponse.redirect('https://img.shields.io/badge/Status-Error-inactive?style=for-the-badge');
    }
}
