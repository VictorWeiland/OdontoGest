import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? process.env['STRIPE_SECRET-KEY'];

export const stripe: Stripe | null = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2026-08-26.dahlia',
    })
  : null;