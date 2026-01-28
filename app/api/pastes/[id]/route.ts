import { NextRequest, NextResponse } from 'next/server';
import { getAndIncrementPaste } from '@/lib/pasteService';
import { getMockableNow } from '@/lib/time';

type RouteProps = {
    params: Promise<{ id: string }>
}

export async function GET(
    req: NextRequest,
    props: RouteProps
) {
    const params = await props.params;
    const { id } = params;

    const mockNow = getMockableNow(req as unknown as Request);

    const result = await getAndIncrementPaste(id, mockNow);

    if (!result.success) {
        // Spec requires 404 for all unavailable cases
        return NextResponse.json({ error: result.error }, { status: 404 });
    }

    const paste = result.data;
    // remaining_views = maxViews - currentViewCount
    // If maxViews is null, remaining_views is null
    const remaining_views = paste.maxViews !== null ? Math.max(0, paste.maxViews - paste.viewCount) : null;

    return NextResponse.json({
        content: paste.content,
        remaining_views,
        expires_at: paste.expiresAt
    });
}
