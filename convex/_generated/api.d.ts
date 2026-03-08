/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _tmp_debug from "../_tmp_debug.js";
import type * as admin from "../admin.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as email from "../email.js";
import type * as emailQueries from "../emailQueries.js";
import type * as emailVerification from "../emailVerification.js";
import type * as http from "../http.js";
import type * as orders from "../orders.js";
import type * as payfast from "../payfast.js";
import type * as payfastWebhook from "../payfastWebhook.js";
import type * as products from "../products.js";
import type * as reviews from "../reviews.js";
import type * as siteSettings from "../siteSettings.js";
import type * as users from "../users.js";
import type * as vendors from "../vendors.js";
import type * as waitlist from "../waitlist.js";
import type * as wishlist from "../wishlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _tmp_debug: typeof _tmp_debug;
  admin: typeof admin;
  analytics: typeof analytics;
  auth: typeof auth;
  email: typeof email;
  emailQueries: typeof emailQueries;
  emailVerification: typeof emailVerification;
  http: typeof http;
  orders: typeof orders;
  payfast: typeof payfast;
  payfastWebhook: typeof payfastWebhook;
  products: typeof products;
  reviews: typeof reviews;
  siteSettings: typeof siteSettings;
  users: typeof users;
  vendors: typeof vendors;
  waitlist: typeof waitlist;
  wishlist: typeof wishlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
