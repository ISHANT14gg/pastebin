import { prisma } from '@/lib/db';

export type PasteResult =
    | { success: true; data: any }
    | { success: false; error: string; status: number };

export async function getAndIncrementPaste(id: string): Promise<PasteResult> {
    try {
        const paste = await prisma.paste.findUnique({
            where: { id },
        });

        if (!paste) {
            return { success: false, error: 'Paste not found', status: 404 };
        }

        // Check time expiration
        if (paste.expiresAt && new Date() > paste.expiresAt) {
            return { success: false, error: 'Paste expired', status: 404 };
        }

        // Check view expiration
        if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
            return { success: false, error: 'Paste expired', status: 404 };
        }

        // Increment view count
        // Note: We use update to ensure atomicity, but for the returned data
        // we return the *original* paste (or updated). 
        // Usually view pages show the state *before* the current view counts? 
        // Or *after*? Let's return the one we found, but fire-and-forget the update 
        // or await it. Awaiting is safer.

        await prisma.paste.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });

        return { success: true, data: paste };

    } catch (error) {
        console.error('Error in getAndIncrementPaste:', error);
        return { success: false, error: 'Internal Server Error', status: 500 };
    }
}
