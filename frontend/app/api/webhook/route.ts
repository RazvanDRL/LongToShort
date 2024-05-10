import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';

// stripe listen -e customer.subscription.updated,customer.subscription.deleted,checkout.session.completed --forward-to http://localhost:3000/api/webhook

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
            const userId = session.metadata?.user_id;
            const email = session.customer_details?.email;

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

        return NextResponse.json({ message: 'success' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}