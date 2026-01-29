export const PAYFAST_URL = "https://sandbox.payfast.co.za/eng/process"; // Sandbox

export interface PayFastData {
    merchant_id: string;
    merchant_key: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    amount: number;
    item_name: string;
    email_address?: string;
}

export function generatePaymentForm(data: Partial<PayFastData>) {
    // In production, you would fetch secrets from Convex env variables via ACTION
    // params: merchant_id, merchant_key, passphrase (for signature)

    // Mock signing for demo
    const params = {
        ...data,
        merchant_id: "10000100", // Sandbox ID
        merchant_key: "46f0cd694581a", // Sandbox Key
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
        notify_url: `${process.env.NEXT_PUBLIC_CONVEX_URL}/payfast/notify`,
    };

    // Convert to form data string or object for frontend form
    return params;
}
