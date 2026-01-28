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
        console.log(`[API] Creating paste with ID: ${id}`);

        // Parse expiresAt if provided
        let expiresDate = null;
        if (expiresAt) {
            expiresDate = new Date(expiresAt);
            if (isNaN(expiresDate.getTime())) {
                return NextResponse.json({ error: 'Invalid expiresAt date' }, { status: 400 });
            }
        }

        const newPaste = await prisma.paste.create({
            data: {
                id,
                content,
                expiresAt: expiresDate,
                maxViews: maxViews ? parseInt(maxViews) : null,
            },
        });

        console.log(`[API] Paste created successfully:`, newPaste.id);

        return NextResponse.json({
            id,
            url: `${process.env.NEXT_PUBLIC_URL}/${id}`
        }, { status: 201 });

    } catch (error) {
        console.error('[API] Error creating paste:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
