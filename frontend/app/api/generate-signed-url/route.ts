import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const runtime = "edge";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_AWS_SECRET_ACCESS_KEY!,
    },
});

// Rate limiting for 2 requests per 15 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(2, '15 s'),
    analytics: true,
});

export async function POST(request: NextRequest) {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');

    // Check if the authorization header is present
    if (!authHeader) {
        return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Get the user from the token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const { success, limit, reset, remaining } = await ratelimit.limit(user.id);
    if (!success) {
        return NextResponse.json(
            { error: 'Too many requests', limit, reset },
            { status: 429, headers: { 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString(), 'X-RateLimit-Reset': reset.toString() } }
        );
    }

    // Get the bucket and key from the request body as JSON 
    const { bucket, key } = await request.json();

    // Check if the bucket and key are present
    if (!bucket || !key) {
        return NextResponse.json({ error: 'Missing bucket or key' }, { status: 400 });
    }

    // Check if the bucket is valid
    if (bucket !== "output-bucket" && bucket !== "upload-bucket") {
        return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }

    const fullKey = `${user.id}/${key}`;

    console.log('Generating signed URL for', fullKey);

    try {
        const url = await getSignedUrl(
            S3,
            new GetObjectCommand({
                Bucket: bucket,
                Key: fullKey,
            }),
            {
                expiresIn: 3600, // 1 hour
            }
        );
        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Error generating signed URL:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}