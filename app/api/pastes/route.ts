import { nanoid } from 'nanoid';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, ttl_seconds, max_views } = body;

        // Strict Validation
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required and must be a non-empty string' }, { status: 400 });
        }

        if (ttl_seconds !== undefined) {
            if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
                return NextResponse.json({ error: 'ttl_seconds must be a positive integer' }, { status: 400 });
            }
        }

        if (max_views !== undefined) {
            if (!Number.isInteger(max_views) || max_views < 1) {
                return NextResponse.json({ error: 'max_views must be a positive integer' }, { status: 400 });
            }
        }

        const id = nanoid(10);

        // Calculate expiresAt from ttl_seconds
        let expiresDate = null;
        if (ttl_seconds) {
            expiresDate = new Date(Date.now() + ttl_seconds * 1000);
        }

        const newPaste = await prisma.paste.create({
            data: {
                id,
                content,
                expiresAt: expiresDate,
                maxViews: max_views ? max_views : null,
            },
        });

        return NextResponse.json({
            id,
            url: `${process.env.NEXT_PUBLIC_URL}/p/${id}`
        }, { status: 201 });

    } catch (error) {
        console.error('[API] Error creating paste:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
