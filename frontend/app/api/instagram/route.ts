import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { type Tiktok } from '@/types/constants';

export async function POST(req: Request) {
    // const token = req.headers.get('Authorization')?.split('Bearer ')[1];

    // if (!token) {
    //     throw new TypeError('unauthorized');
    // }

    // const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    // if (!user || userError) {
    //     throw new TypeError('user not found');
    // }

    const body = await req.json();

    if (!body || typeof body !== 'object') {
        throw new TypeError('invalid request body');
    }

    const { video_url } = body;

    if (!video_url) {
        throw new TypeError('Video url is missing');
    }

    const fetch_url = 'https://all-media-downloader.p.rapidapi.com/rapid_download/download';
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
            'X-RapidAPI-Host': 'all-media-downloader.p.rapidapi.com'
        },
        body: new URLSearchParams({
            url: video_url
        })
    };

    try {
        const response = await fetch(fetch_url, options);
        const result: Tiktok = await response.json();
        return NextResponse.json({
            url: result.url,
            ext: result.video_ext,
            thumbnail: result.thumbnail,
            height: result.height,
            width: result.width
        });

    } catch (error) {
        console.error(error);
        return NextResponse.error();
    }
}