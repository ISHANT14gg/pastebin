import { notFound } from 'next/navigation';

// Allow this page to be dynamic so it fetches fresh data every time
export const dynamic = 'force-dynamic';

async function getPaste(id: string) {
    // Use the API route to ensure consistent logic (validation, view counting, etc.)
    // We need an absolute URL for server-side fetches
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${baseUrl}/api/pastes/${id}`, {
            cache: 'no-store', // Never cache, we need fresh view counts
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to fetch paste');
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching paste:", error);
        return null;
    }
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
                    <span>Created: {new Date(paste.createdAt).toLocaleString()}</span>
                    <span>Views: {paste.viewCount} / {paste.maxViews ?? '∞'}</span>
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
