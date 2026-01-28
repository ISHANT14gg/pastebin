import { NextRequest, NextResponse } from 'next/server';
import { getAndIncrementPaste } from '@/lib/pasteService';

type RouteProps = {
    params: Promise<{ id: string }>
}

export async function GET(
    req: NextRequest,
    props: RouteProps
) {
    const params = await props.params;
    const { id } = params;

    const result = await getAndIncrementPaste(id);

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
}
