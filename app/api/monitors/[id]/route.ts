import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.monitor.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete monitor' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await request.json();

        const monitor = await prisma.monitor.update({
            where: { id },
            data: {
                ...data,
            },
        });
        return NextResponse.json(monitor);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update monitor' }, { status: 500 });
    }
}
