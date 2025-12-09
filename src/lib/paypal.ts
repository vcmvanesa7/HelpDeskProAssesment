import paypal from "@paypal/checkout-server-sdk";

export function paypalClient() {
  const env =
    process.env.PAYPAL_MODE === "sandbox"
      ? new paypal.core.SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID!,
          process.env.PAYPAL_SECRET!
        )
      : new paypal.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID!,
          process.env.PAYPAL_SECRET!
        );

  return new paypal.core.PayPalHttpClient(env);
}
