import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { handleITN } from "./payfastWebhook";

const http = httpRouter();

auth.addHttpRoutes(http);

// PayFast ITN (Instant Transaction Notification) webhook
http.route({
    path: "/payfast-itn",
    method: "POST",
    handler: handleITN,
});

export default http;
