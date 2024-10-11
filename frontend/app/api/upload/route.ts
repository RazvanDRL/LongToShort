import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

const BUNNY_STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY!;

// Rate limiting for 2 requests per 15 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(2, '15 s'),
    analytics: true,
});

export async function POST(request: NextRequest) {
    // Authenticate user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const identifier = user.id;
    const result = await ratelimit.limit(identifier);
    if (!result.success) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file || !fileName) {
        return NextResponse.json({ error: 'File or fileName is missing' }, { status: 400 });
    }

    // Check if the fileName starts with the user's ID
    if (!fileName.startsWith(`${user.id}/`)) {
        return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    const stream = new ReadableStream({
        async start(controller) {
            try {
                // Step 1: Create the video object
                const createResponse = await fetch(`https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/*+json',
                        'AccessKey': BUNNY_API_KEY
                    },
                    body: JSON.stringify({ title: fileName })
                });

                if (!createResponse.ok) {
                    throw new Error('Failed to create video object');
                }

                const { guid } = await createResponse.json();

                // Step 2: Upload the video
                const fileBuffer = await file.arrayBuffer();
                const uploadResponse = await fetch(`https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos/${guid}`, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': file.type,
                        'AccessKey': BUNNY_API_KEY
                    },
                    body: fileBuffer
                });

                if (!uploadResponse.ok) {
                    throw new Error('Upload failed');
                }

                controller.enqueue(`data: 100\n\n`);
                controller.close();

                // Update Supabase with the video information
                // const { error: supabaseError } = await supabase
                //     .from('metadata')
                //     .insert({
                //         id: guid,
                //         user_id: user.id,
                //         name: fileName,
                //         bunny_id: guid
                //     });

                // if (supabaseError) {
                //     console.error('Error updating Supabase:', supabaseError);
                // }

            } catch (error) {
                console.error('Error uploading file:', error);
                controller.error(error);
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
