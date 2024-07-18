import S3 from 'aws-sdk/clients/s3.js';
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const s3 = new S3({
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
    accessKeyId: process.env.CLOUDFLARE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_AWS_SECRET_ACCESS_KEY!,
    signatureVersion: 'v4',
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
        await s3.headObject({ Bucket: bucket, Key: fullKey }).promise();

        // If the file exists, generate the signed URL
        const url = await s3.getSignedUrlPromise('getObject', {
            Bucket: bucket,
            Key: fullKey,
            Expires: 3600
        });

        return NextResponse.json({ url });
    } catch (error: any) {
        if (error.code === 'NotFound') {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        console.error('Error checking file existence:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}