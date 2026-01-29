export interface ShippingRate {
    id: string;
    name: string; // e.g., "The Courier Guy - Overnight"
    price: number;
    days: number;
}

export async function getShippingRates(address: any, weight: number): Promise<ShippingRate[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock rates based on "weight" or random
    return [
        { id: "standard", name: "Standard Delivery (3-5 Days)", price: 85, days: 4 },
        { id: "express", name: "Express Delivery (1-2 Days)", price: 150, days: 1 },
    ];
}
