import { prisma } from '@/lib/db';

export type PasteResult =
    | { success: true; data: any }
    | { success: false; error: string; status: number };

export async function getAndIncrementPaste(id: string, customNow?: Date): Promise<PasteResult> {
    try {
        const paste = await prisma.paste.findUnique({
            where: { id },
        });

        if (!paste) {
            return { success: false, error: 'Paste not found', status: 404 };
        }

        const now = customNow || new Date();

        // Check time expiration
        if (paste.expiresAt && now > paste.expiresAt) {
            return { success: false, error: 'Paste expired', status: 404 };
        }

        // Check view expiration
        if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
            return { success: false, error: 'Paste expired', status: 404 };
        }

        // Increment view count
        // Note: We use update to ensure atomicity, and return the updated paste.
        const updatedPaste = await prisma.paste.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });

        return { success: true, data: updatedPaste };

    } catch (error) {
        console.error('Error in getAndIncrementPaste:', error);
        return { success: false, error: 'Internal Server Error', status: 500 };
    }
}
