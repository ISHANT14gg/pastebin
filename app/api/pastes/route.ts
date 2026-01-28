import { nanoid } from 'nanoid';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { content, expiresAt, maxViews } = await req.json();

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const id = nanoid(10);

        // Parse expiresAt if provided
        let expiresDate = null;
        if (expiresAt) {
            expiresDate = new Date(expiresAt);
            if (isNaN(expiresDate.getTime())) {
                return NextResponse.json({ error: 'Invalid expiresAt date' }, { status: 400 });
            }
        }

        await prisma.paste.create({
            data: {
                id,
                content,
                expiresAt: expiresDate,
                maxViews: maxViews ? parseInt(maxViews) : null,
            },
        });

        return NextResponse.json({
            id,
            url: `${process.env.NEXT_PUBLIC_URL}/${id}`
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating paste:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
