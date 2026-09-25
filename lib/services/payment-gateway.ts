import "server-only";

type PaymentInput = { orderId: string; amount: number; customerEmail: string; itemName: string };

export async function createGatewayPayment(input: PaymentInput) {
  const provider = process.env.PAYMENT_GATEWAY;
  if (provider === "midtrans" && process.env.MIDTRANS_SERVER_KEY) {
    const base = process.env.PAYMENT_MODE === "live" ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
    const response = await fetch(`${base}/snap/v1/transactions`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64")}`, "Content-Type": "application/json" }, body: JSON.stringify({ transaction_details: { order_id: input.orderId, gross_amount: input.amount }, item_details: [{ id: input.orderId, price: input.amount, quantity: 1, name: input.itemName }], customer_details: { email: input.customerEmail } }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.status_message ?? "Midtrans gagal membuat transaksi");
    return { provider, token: data.token, redirect_url: data.redirect_url, demo: false };
  }
  if (provider === "xendit" && process.env.XENDIT_SECRET_KEY) {
    const response = await fetch("https://api.xendit.co/v2/invoices", { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString("base64")}`, "Content-Type": "application/json" }, body: JSON.stringify({ external_id: input.orderId, amount: input.amount, payer_email: input.customerEmail, description: input.itemName, invoice_duration: 86400 }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message ?? "Xendit gagal membuat invoice");
    return { provider, invoice_id: data.id, redirect_url: data.invoice_url, demo: false };
  }
  return { provider: provider ?? "demo", redirect_url: `/dashboard/billing?order=${input.orderId}&demo=1`, demo: true };
}