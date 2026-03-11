"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

// Flat shipping rates — predictable pricing for customers.
// ShipRazor handles actual courier assignment after payment.
const FLAT_RATES = [
    { id: "standard", name: "Standard Delivery (3-5 Days)", price: 99, days: 4 },
    { id: "express", name: "Express Delivery (1-2 Days)", price: 149, days: 1 },
];

export const getRates = action({
    args: {
        street: v.string(),
        city: v.string(),
        code: v.string(),
        province: v.string(),
        productIds: v.optional(v.array(v.string())),
    },
    handler: async (_ctx, _args) => {
        // Flat rates — no external API call needed.
        // ShipRazor books the actual courier after payment is confirmed.
        return FLAT_RATES;
    },
});
