import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Try to query the database
        const count = await prisma.paste.count();
        return NextResponse.json({
            status: 'ok',
            database: 'connected',
            pasteCount: count,
            envUrl: process.env.DATABASE_URL ? 'Set (Hidden)' : 'Missing'
        });
    } catch (error: any) {
        console.error('Health check failed:', error);
        return NextResponse.json({
            status: 'error',
            database: 'disconnected',
            message: error.message,
            code: error.code,
            meta: error.meta,
            name: error.name
        }, { status: 500 });
    }
}
