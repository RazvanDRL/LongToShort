import S3 from 'aws-sdk/clients/s3.js';
import { NextResponse } from 'next/server'


const s3 = new S3({
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
    accessKeyId: process.env.CLOUDFLARE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_AWS_SECRET_ACCESS_KEY!,
    signatureVersion: 'v4',
});

export async function POST(req: Request) {
    const key = req.url.split('?key=')[1];
    const url = await s3.getSignedUrlPromise('getObject', { Bucket: 'output-bucket', Key: key, Expires: 3600 });
    return NextResponse.json({ url })
}