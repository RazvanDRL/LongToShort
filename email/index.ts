import { Resend } from 'resend';
import { supabase } from './supabaseClient';
import { EmailTemplate } from './email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

supabase
    .channel('metadata-update-channel-email')
    .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'metadata' },
        async (payload) => {
            console.log('payload:', payload.new);

            let { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', payload.new.user_id);

            if (error) {
                console.log('Error fetching profiles:', error);
                return;
            }

            if (profiles && profiles.length > 0 && profiles[0].email) {
                const pN = payload.new.processed;
                const pO = payload.old.processed;

                if (pN !== pO && pN === true) {
                    const { data, error } = await resend.emails.send({
                        from: 'LongToShort <onboarding@resend.dev>',
                        to: [`${profiles[0].email}`],
                        subject: `Video ${payload.new.name} has been processed`,
                        react: EmailTemplate({ video_id: payload.new.id }),
                        text: `${payload.new.name} has been processed`,
                    });
                }
            }
        }
    )
    .subscribe();