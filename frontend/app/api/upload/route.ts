import { NextRequest, NextResponse } from 'next/server';
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = 'upload-bucket';
const PART_SIZE = 5 * 1024 * 1024; // 5MB part size

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

    const fileSize = file.size;
    let uploadedSize = 0;

    const stream = new ReadableStream({
        async start(controller) {
            try {
                // Step 1: Initiate multipart upload
                const createMultipartUpload = await s3Client.send(new CreateMultipartUploadCommand({
                    Bucket: BUCKET_NAME,
                    Key: fileName,
                }));

                const uploadId = createMultipartUpload.UploadId;

                // Step 2: Upload parts
                const fileBuffer = await file.arrayBuffer();
                const parts = [];

                for (let i = 0; i < fileBuffer.byteLength; i += PART_SIZE) {
                    const end = Math.min(i + PART_SIZE, fileBuffer.byteLength);
                    const partNumber = Math.floor(i / PART_SIZE) + 1;

                    const uploadPartResult = await s3Client.send(new UploadPartCommand({
                        Bucket: BUCKET_NAME,
                        Key: fileName,
                        UploadId: uploadId,
                        PartNumber: partNumber,
                        Body: Buffer.from(fileBuffer.slice(i, end)),
                    }));

                    parts.push({
                        ETag: uploadPartResult.ETag,
                        PartNumber: partNumber,
                    });

                    uploadedSize += end - i;
                    const progress = Math.round((uploadedSize / fileSize) * 100);
                    controller.enqueue(`data: ${progress}\n\n`);
                }

                // Step 3: Complete multipart upload
                await s3Client.send(new CompleteMultipartUploadCommand({
                    Bucket: BUCKET_NAME,
                    Key: fileName,
                    UploadId: uploadId,
                    MultipartUpload: { Parts: parts },
                }));

                controller.enqueue(`data: 100\n\n`);
                controller.close();
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
