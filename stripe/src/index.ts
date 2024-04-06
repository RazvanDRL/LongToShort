import { Hono } from 'hono'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/checkout', async (c) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: "price_1P27J2B0iKO7xPnMjhRYoQxP",
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
    return c.json(session);
  }
  catch (error: any) {
    console.error(error);
  }
})

app.post('/webhook', async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
  }

  // Handle the checkout.session.completed event
  if (event!.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(session)

    // TODO Fulfill the purchase with your own business logic, for example:
    // Update Database with order details
    // Add credits to customer account
    // Send confirmation email
    // Print shipping label
    // Trigger order fulfillment workflow
    // Update inventory
    // Etc.
  }

  return c.text('success');
});

app.get('/success', (c) => {
  return c.text('Payment Success')
});

app.get('/cancel', (c) => {
  return c.text('Payment Cancelled')
});

export default app