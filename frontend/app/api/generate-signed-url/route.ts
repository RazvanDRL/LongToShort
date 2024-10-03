import { S3Client, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(req: Request) {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (!user || userError) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();

    if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { bucket, key } = body;

    if (!bucket || !key) {
        return NextResponse.json({ error: 'Bucket or key is missing' }, { status: 400 });
    }

    if (bucket !== "output-bucket" && bucket !== "upload-bucket") {
        return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }

    const fullKey = `${user.id}/${key}`;

    try {
        // Check if the file exists
        await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: fullKey }));

        // If the file exists, generate the signed URL
        const command = new GetObjectCommand({ Bucket: bucket, Key: fullKey });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return NextResponse.json({ url });
    } catch (error: any) {
        if (error.name === 'NotFound') {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        console.error('Error checking file existence:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}