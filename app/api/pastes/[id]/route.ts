import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const paste = await prisma.paste.findUnique({
            where: { id },
        });

        if (!paste) {
            return NextResponse.json({ error: 'Paste not found' }, { status: 404 });
        }

        // Check time expiration
        if (paste.expiresAt && new Date() > paste.expiresAt) {
            return NextResponse.json({ error: 'Paste expired' }, { status: 404 });
        }

        // Check view expiration
        // We check >= because we are about to view it one more time, or if it was already hit.
        // Actually require: if currently viewCount >= maxViews, then it's dead.
        if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
            return NextResponse.json({ error: 'Paste expired' }, { status: 404 });
        }

        // Increment view count
        // Use update to ensure atomicity
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
        console.error('Error fetching paste:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
