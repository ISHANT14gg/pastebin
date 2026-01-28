import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Spec requires quick response and checking persistence
        await prisma.paste.count();
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
