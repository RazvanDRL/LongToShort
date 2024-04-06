import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';

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
            console.log(session);
            const userId = session.metadata?.user_id;
            const email = session.customer_details?.email;

            // Create or update the stripe_customer_id in the stripe_customers table
            const { error } = await supabaseAdmin
                .from('stripe_customers')
                .upsert({
                    user_id: userId,
                    email: email,
                    stripe_customer_id: session.customer,
                    subscription_id: session.subscription,
                    plan_active: true,
                    plan_expires: null
                })


        }

        if (event.type === 'customer.subscription.updated') {

        }

        if (event.type === 'customer.subscription.deleted') {

        }

        return NextResponse.json({ message: 'success' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}