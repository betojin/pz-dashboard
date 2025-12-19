/**
 * Vercel API Route to proxy requests to HTTP API
 * Solves mixed-content blocking (HTTPS → HTTP)
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TIMEOUT = 10000; // 10 seconds

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
        return NextResponse.json(
            { error: 'Missing endpoint parameter' },
            { status: 400 }
        );
    }

    if (!API_URL) {
        return NextResponse.json(
            { error: 'API URL not configured' },
            { status: 500 }
        );
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

        const response = await fetch(`${API_URL}${endpoint}`, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json(
                { error: `API returned ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch from API' },
            { status: 502 }
        );
    }
}
