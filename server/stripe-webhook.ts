import { Request, Response } from "express";
import Stripe from "stripe";
import { updateBookingStatus, updateBookingPaymentIntent, getBookingById, createNotification } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    return res.status(400).send("Missing signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Webhook] Signature verification failed:", errorMessage);
    return res.status(400).send(`Webhook Error: ${errorMessage}`);
  }

  // Handle test events
  if (event.id.startsWith('evt_test_')) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ 
      verified: true,
    });
  }

  console.log(`[Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("[Webhook] Processing checkout.session.completed");
  
  const bookingId = session.metadata?.bookingId;
  
  if (!bookingId) {
    console.error("[Webhook] Missing bookingId in session metadata");
    return;
  }

  const booking = await getBookingById(parseInt(bookingId));
  
  if (!booking) {
    console.error(`[Webhook] Booking not found: ${bookingId}`);
    return;
  }

  // Update booking status to confirmed
  await updateBookingStatus(parseInt(bookingId), "confirmed");
  
  // Store payment intent ID if available
  if (session.payment_intent && typeof session.payment_intent === "string") {
    await updateBookingPaymentIntent(parseInt(bookingId), session.payment_intent);
  }

  // Send notifications to both student and mentor
  await createNotification({
    userId: booking.studentId,
    type: "booking_confirmed",
    title: "예약이 확정되었습니다",
    message: `상담 예약이 성공적으로 확정되었습니다. 일정: ${booking.scheduledAt.toLocaleString("ko-KR")}`,
    relatedId: parseInt(bookingId),
  });

  await createNotification({
    userId: booking.mentorId,
    type: "booking_confirmed",
    title: "새로운 상담 예약",
    message: `새로운 상담 예약이 확정되었습니다. 일정: ${booking.scheduledAt.toLocaleString("ko-KR")}`,
    relatedId: parseInt(bookingId),
  });

  console.log(`[Webhook] Booking ${bookingId} confirmed successfully`);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("[Webhook] Processing payment_intent.succeeded");
  console.log(`[Webhook] Payment Intent ID: ${paymentIntent.id}`);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("[Webhook] Processing payment_intent.payment_failed");
  console.log(`[Webhook] Payment Intent ID: ${paymentIntent.id}`);
  
  // You might want to notify the user about the failed payment
  const bookingId = paymentIntent.metadata?.bookingId;
  
  if (bookingId) {
    const booking = await getBookingById(parseInt(bookingId));
    
    if (booking) {
      await createNotification({
        userId: booking.studentId,
        type: "booking_cancelled",
        title: "결제 실패",
        message: "상담 예약 결제가 실패했습니다. 다시 시도해주세요.",
        relatedId: parseInt(bookingId),
      });
    }
  }
}
