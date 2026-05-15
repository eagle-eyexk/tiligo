import Stripe from "npm:stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), { apiVersion: "2023-10-16" });

Deno.serve(async (req) => {
  try {
    const { items, deliveryFee, discount, orderCode, customerName, customerPhone, customerAddress, notes, priority, couponId } = await req.json();

    if (!items || items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://app.base44.com";

    const lineItems = items.map(item => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          description: item.qty > 1 ? `Sasi: ${item.qty}` : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    // Add delivery fee as a line item
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: priority ? "⚡ Dërgesa me Prioritet" : "🛵 Tarifa e Dorëzimit",
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/gjurmo/${orderCode}?payment=success`,
      cancel_url: `${origin}/checkout?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        order_code: orderCode,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        notes: notes || "",
        coupon_id: couponId || "",
        priority: priority ? "true" : "false",
      },
      payment_intent_data: {
        description: `TiliGo Order #${orderCode} — ${customerName}`,
      },
    };

    // Apply discount coupon if present
    if (discount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: "eur",
        duration: "once",
        name: "TiliGo Kupon",
      });
      sessionConfig.discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});