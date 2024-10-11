import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const secretAccessKey = process.env.CLOUDFLARE_AWS_SECRET_ACCESS_KEY!;

const MAX_UPLOAD_SIZE = 52428800 * 10; // 500MB

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

// Create a new ratelimiter, that allows 5 requests per 5 minutes
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "5 m"),
});

async function executePutRequest(url: string, data: ArrayBuffer, authToken?: string): Promise<Response> {
    const headers = {
        'Content-Type': 'video/mp4',
        'Authorization': `Bearer ${authToken}`,
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: data,
        });

        return response;
    } catch (error) {
        console.error('Error executing PUT request:', error);
        throw error;
    }
}

export async function PUT(req: Request): Promise<Response> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Rate limiting
    const { success } = await ratelimit.limit(user.id);
    if (!success) {
        return new Response('Too many requests', { status: 429 });
    }

    const key = req.headers.get('X-File-Key');
    if (!key) {
        return new Response('Missing file key', { status: 400 });
    }

    const data = await req.arrayBuffer();
    const dataSize = data.byteLength;

    if (dataSize > MAX_UPLOAD_SIZE) {
        return new Response('File size exceeds the maximum upload limit of 500MB.', {
            status: 413,
            headers: {
                'Content-Security-Policy': "default-src 'self'",
            },
        });
    }

    const uploadUrl = process.env.CLOUDFLARE_WORKER_URL!;
    try {
        const response = await executePutRequest(`${uploadUrl}/${key}`, data, secretAccessKey);
        if (response.status !== 200) {
            const errorMessage = await response.text();
            return new Response(`Error uploading file: ${errorMessage}`, { status: response.status });
        }
        return response;
    } catch (error) {
        console.error('Error uploading file:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}