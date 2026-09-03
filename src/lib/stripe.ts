import Stripe from "stripe";

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key, { typescript: true });
  }
  return client;
}

const CATALOGUE_TTL_MS = 10 * 60_000;
let catalogue: { at: number; byService: Map<string, string> } | null = null;

/**
 * Stripe product id for a service, matched on the product's `serviceId` metadata.
 * Products exist in the Dashboard so payments group per service in reporting; the
 * amount charged always comes from SERVICES, never from the product's price.
 * Returns undefined when the catalogue is unavailable so checkout can fall back
 * to an ad-hoc product.
 */
export async function catalogueProductId(serviceId: string): Promise<string | undefined> {
  if (!catalogue || Date.now() - catalogue.at > CATALOGUE_TTL_MS) {
    try {
      const byService = new Map<string, string>();
      for await (const p of stripe().products.list({ active: true, limit: 100 })) {
        const id = p.metadata?.serviceId;
        if (id && !byService.has(id)) byService.set(id, p.id);
      }
      catalogue = { at: Date.now(), byService };
    } catch (e) {
      console.warn("stripe: could not load product catalogue", e);
      return catalogue?.byService.get(serviceId);
    }
  }
  return catalogue.byService.get(serviceId);
}

export function isLiveMode(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_");
}
