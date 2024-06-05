import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { type downloadAll } from '@/types/constants';

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

    const fetch_url = 'https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink';
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
            'X-RapidAPI-Host': 'auto-download-all-in-one.p.rapidapi.com'
        },
        body: JSON.stringify({
            url: video_url
        })
    };

    try {
        const response = await fetch(fetch_url, options);
        const result = await response.json();
        return NextResponse.json({
            thumbnail: result.thumbnail,
            duration: result.duration,
            url: result.medias[0].url,
            quality: result.medias[0].quality,
            title: result.title,
        });

    } catch (error) {
        console.error(error);
        return NextResponse.error();
    }
}