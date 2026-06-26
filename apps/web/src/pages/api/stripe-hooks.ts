import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import { handleStripeWebhookEvent } from "@/lib/billing";
import { stripe } from "@/lib/stripe";

export const config = {
  api: { bodyParser: false },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const signature = req.headers["stripe-signature"];
  const signatureSecret = process.env.STRIPE_SIGNATURE_SECRET;
  const reqBuffer = await buffer(req);

  if (!signature || Array.isArray(signature) || !signatureSecret) {
    return res.status(400).send("Missing Stripe webhook signature configuration");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      reqBuffer,
      signature,
      signatureSecret,
    );
  } catch (err) {
    console.log(err);

    return res.status(400).send(`Webhook error: ${(err as Error).message}`);
  }

  await handleStripeWebhookEvent(event);

  res.json({ received: true });
};

export default handler;
