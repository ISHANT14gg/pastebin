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
        if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
            return NextResponse.json({ error: 'Paste expired' }, { status: 404 });
        }

        // Increment view count
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
