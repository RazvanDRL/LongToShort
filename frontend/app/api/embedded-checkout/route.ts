import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const { priceId } = await req.json();

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            return_url:
                `${req.headers.get('origin')}/return?session_id={CHECKOUT_SESSION_ID}`,
            automatic_tax: { enabled: false },
        });
        return NextResponse.json({ id: session.id, client_secret: session.client_secret });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}