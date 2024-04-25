import { Resend } from 'resend';
import { supabase } from './supabaseClient';
import { EmailTemplate } from './email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

supabase
    .channel('email-channel')
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
                if (payload.new.processed == true) {
                    const { data, error } = await resend.emails.send({
                        from: 'LongToShort <contact@email.longtoshort.tech>',
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

console.log('Listening for changes on metadata table...');