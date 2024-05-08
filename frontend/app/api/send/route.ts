import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin';


const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    const id = req.url.split('?id=')[1];
    try {

        const { data: metadata, error: metadata_error } = await supabaseAdmin
            .from('metadata')
            .select('user_id,name')
            .eq('id', id)
            .single();

        if (metadata_error) {
            return NextResponse.error();
        }

        const { data: user, error: user_error } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', metadata?.user_id)
            .single();

        if (user_error) {
            return NextResponse.error();
        }

        if(!user?.email) {
            return NextResponse.error();
        }

        const data = await resend.emails.send({
            from: 'LongToShort <contact@email.longtoshort.tech>',
            to: [`${user?.email}`],
            subject: `Video ${metadata?.name} has been processed`,
            react: EmailTemplate({ video_id: id }),
            text: `${metadata?.name} has been processed`,
        });

        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.error();
    }
}
