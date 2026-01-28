export function getMockDate(headerValue: string | null): Date {
    if (process.env.TEST_MODE === '1' && headerValue) {
        const ms = parseInt(headerValue, 10);
        if (!isNaN(ms)) {
            return new Date(ms);
        }
    }
    return new Date();
}

export function getMockableNow(req?: Request): Date {
    if (!req) return new Date();
    return getMockDate(req.headers.get('x-test-now-ms'));
}
