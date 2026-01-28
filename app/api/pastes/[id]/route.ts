import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

type RouteProps = {
    params: Promise<{ id: string }>
}

export async function GET(
    req: NextRequest,
    props: RouteProps
) {
    const params = await props.params;
    const { id } = params;

    console.log(`[API] Fetching paste with ID: ${id}`);

    try {
        const paste = await prisma.paste.findUnique({
            where: { id },
        });

        console.log(`[API] DB Result for ${id}:`, paste ? 'Found' : 'NULL');

        if (!paste) {
            console.log(`[API] Paste ${id} not found in DB`);
            return NextResponse.json({ error: 'Paste not found' }, { status: 404 });
        }

        // Check time expiration
        if (paste.expiresAt && new Date() > paste.expiresAt) {
            console.log(`[API] Paste ${id} expired by time. ExpiresAt: ${paste.expiresAt}, Now: ${new Date()}`);
            return NextResponse.json({ error: 'Paste expired' }, { status: 404 });
        }

        // Check view expiration
        if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
            console.log(`[API] Paste ${id} expired by views. Count: ${paste.viewCount}, Max: ${paste.maxViews}`);
            return NextResponse.json({ error: 'Paste expired' }, { status: 404 });
        }

        // Increment view count
        console.log(`[API] Incrementing view count for ${id}`);
        await prisma.paste.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json(paste);

    } catch (error) {
        console.error(`[API] Error fetching paste ${id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
