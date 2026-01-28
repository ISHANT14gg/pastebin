import { notFound } from 'next/navigation';
import { getAndIncrementPaste } from '@/lib/pasteService';
import { headers } from 'next/headers';
import { getMockDate } from '@/lib/time';

// Force dynamic because we are reading/writing DB on every request (views)
export const dynamic = 'force-dynamic';

export default async function ViewPaste({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const headersList = await headers();
    const mockTimeHeader = headersList.get('x-test-now-ms');
    const mockNow = getMockDate(mockTimeHeader);

    // Call logic directly - no network fetch => No 401 errors
    const result = await getAndIncrementPaste(id, mockNow);

    if (!result.success) {
        if (result.status === 404) {
            notFound();
        }
        // Handle 500 or other errors by showing 404 for security/simplicity in this assignment
        notFound();
    }

    const paste = result.data;

    return (
        <main className="min-h-screen p-8 max-w-4xl mx-auto font-sans">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Paste #{paste.id}</h1>
                <a href="/" className="text-blue-500 hover:underline">Create New</a>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                    <span>Created: {new Date(paste.createdAt).toLocaleString()}</span>
                    <span>Views: {paste.viewCount + 1} / {paste.maxViews ?? '∞'}</span>
                </div>
                <div className="p-4 overflow-x-auto">
                    <pre className="font-mono text-sm whitespace-pre-wrap break-words">{paste.content}</pre>
                </div>
            </div>

            {paste.expiresAt && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                    Expires at: {new Date(paste.expiresAt).toLocaleString()}
                </div>
            )}
        </main>
    );
}
