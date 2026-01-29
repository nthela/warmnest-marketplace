import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("vendor"), v.literal("customer")),
    vendorId: v.optional(v.id("vendors")),
  }).index("by_email", ["email"]),

  vendors: defineTable({
    userId: v.id("users"),
    storeName: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    commissionRate: v.number(), // e.g., 0.10 for 10%
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"]),

  products: defineTable({
    vendorId: v.id("vendors"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    salePrice: v.optional(v.number()),
    stock: v.number(),
    images: v.array(v.string()), // URLs
    category: v.string(),
    tags: v.array(v.string()),
    isActive: v.boolean(),
  })
    .index("by_vendor", ["vendorId"])
    .index("by_category", ["category"]),

  orders: defineTable({
    userId: v.optional(v.id("users")), // Optional for guest checkout
    guestEmail: v.optional(v.string()),
    totalAmount: v.number(), // Store in cents/lowest unit
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    paymentId: v.optional(v.string()), // PayFast ID
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      province: v.string(),
      code: v.string(),
      country: v.string(),
    }),
    createdAt: v.number(), // Timestamp
  }).index("by_user", ["userId"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    vendorId: v.id("vendors"),
    quantity: v.number(),
    price: v.number(), // Snapshot price at purchase
  }).index("by_order", ["orderId"])
    .index("by_vendor", ["vendorId"]),

});
