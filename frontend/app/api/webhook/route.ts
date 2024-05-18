import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';

// stripe listen --forward-to http://localhost:3000/api/webhook

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('stripe-signature');

        let event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
        } catch (error: any) {
            console.error(`Webhook signature verification failed: ${error.message}`);
            return NextResponse.json({ message: 'Webhook Error' }, { status: 400 });
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session: Stripe.Checkout.Session = event.data.object;
            const userId = session.client_reference_id;
            const email = session.customer_details?.email;

            // increment users credits
            const { data: credits, error: creditsError } = await supabaseAdmin
                .from('profiles')
                .select('credits')
                .eq('id', userId)
                .single();

            if (creditsError) {
                console.error(creditsError.message);
                return NextResponse.json({ message: creditsError.message }, { status: 500 });
            }

            const newCredits = credits!.credits + 100;

            const { error: newCreditsError } = await supabaseAdmin
                .from('profiles')
                .update({ credits: newCredits })
                .eq('id', userId);

            if (newCreditsError) {
                console.error(newCreditsError.message);
                return NextResponse.json({ message: newCreditsError.message }, { status: 500 });
            }

            if (session.customer !== null) {
                const { error } = await supabaseAdmin
                    .from('stripe_customers')
                    .upsert({
                        id: userId,
                        email: email,
                        stripe_customer_id: session.customer,
                    })

                if (error) {
                    console.error(error.message);
                    return NextResponse.json({ message: error.message }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ message: 'success' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}