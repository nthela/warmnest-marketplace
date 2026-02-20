const PAYFAST_SANDBOX_URL = "https://sandbox.payfast.co.za/eng/process";
const PAYFAST_LIVE_URL = "https://www.payfast.co.za/eng/process";

export function getPayFastUrl(): string {
    const isSandbox = process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === "true";
    return isSandbox ? PAYFAST_SANDBOX_URL : PAYFAST_LIVE_URL;
}

export function submitPayFastForm(data: Record<string, string>): void {
    const payFastUrl = getPayFastUrl();
    const form = document.createElement("form");
    form.method = "POST";
    form.action = payFastUrl;

    for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) continue;
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
}
