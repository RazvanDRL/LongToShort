"use client";
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabaseClient';
import { Toaster, toast } from 'sonner';

export default function CheckoutButton() {
    const handleCheckout = async () => {
        const { data } = await supabase.auth.getUser();

        if (!data?.user) {
            toast.error("Please log in to create a new Stripe Checkout session");
            return;
        }

        const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        const stripe = await stripePromise;
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ priceId: 'price_1PE8sDCXyqQaR0H8nWbNvGbm', userId: data.user?.id, email: data.user?.email }),
        });
        const session = await response.json();
        await stripe?.redirectToCheckout({ sessionId: session.id });
    }

    return (
        <div>
            <Toaster />
            <h1>Signup for a Plan</h1>
            <p>Clicking this button creates a new Stripe Checkout session</p>
            <button className="p-4 bg-gray-500" onClick={handleCheckout}>Buy Now</button>
        </div>
    );
}