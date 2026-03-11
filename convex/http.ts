import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { handleITN } from "./payfastWebhook";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

// PayFast ITN (Instant Transaction Notification) webhook
http.route({
    path: "/payfast-itn",
    method: "POST",
    handler: handleITN,
});

// ShipRazor webhook — receives order status updates
// Configure this URL in ShipRazor Settings → Configure Webhooks
http.route({
    path: "/shiprazor-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const body = await request.json();
            const { orderId, status } = body as { orderId: number; status: string };

            if (!orderId || !status) {
                return new Response("Missing orderId or status", { status: 400 });
            }

            await ctx.runMutation(internal.shiprazorHelpers.updateStatusFromWebhook, {
                shiprazorOrderId: orderId,
                status,
            });

            return new Response("OK", { status: 200 });
        } catch (error) {
            console.error("ShipRazor webhook error:", error);
            return new Response("Internal error", { status: 500 });
        }
    }),
});

export default http;
