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
        throw new TypeError('unauthorized');
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (!user || userError) {
        throw new TypeError('user not found');
    }

    const body = await req.json();

    if (!body || typeof body !== 'object') {
        throw new TypeError('invalid request body');
    }

    const { bucket, key } = body;

    if (!bucket || !key) {
        throw new TypeError('bucket or key is missing');
    }

    if (bucket !== "output-bucket" && bucket !== "upload-bucket") {
        throw new TypeError('invalid bucket');
    }

    const url = await s3.getSignedUrlPromise('getObject', { Bucket: bucket, Key: `${user.id}/${key}`, Expires: 3600 });

    return NextResponse.json({ url })
}