import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

async function getPaste(id: string) {
    const paste = await prisma.paste.findUnique({
        where: { id },
    });

    if (!paste) return null;

    // Manual expiration check for Server Component render
    // (Note: The API handles incrementing, but for the page load we might want to Hit the API? 
    // OR just do the logic here. If we do logic here, we duplicate code. 
    // BETTER: Call the DB logic directly, but handle "view" incrementing. 
    // Since this IS a view, we should increment.

    // Logic: 
    // 1. Check expiry
    if (paste.expiresAt && new Date() > paste.expiresAt) return null;
    if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) return null;

    // 2. Increment view count
    await prisma.paste.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
    });

    return paste;
}

export default async function ViewPaste({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const paste = await getPaste(id);

    if (!paste) {
        notFound();
    }

    return (
        <main className="min-h-screen p-8 max-w-4xl mx-auto font-sans">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Paste #{paste.id}</h1>
                <a href="/" className="text-blue-500 hover:underline">Create New</a>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                    <span>Created: {paste.createdAt.toLocaleString()}</span>
                    <span>Views: {paste.viewCount + 1} / {paste.maxViews ?? '∞'}</span>
                </div>
                <div className="p-4 overflow-x-auto">
                    <pre className="font-mono text-sm whitespace-pre-wrap break-words">{paste.content}</pre>
                </div>
            </div>

            {paste.expiresAt && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                    Expires at: {paste.expiresAt.toLocaleString()}
                </div>
            )}
        </main>
    );
}
