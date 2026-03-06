"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Star } from "lucide-react";

export function ProductRating({ productId }: { productId: Id<"products"> }) {
    const stats = useQuery(api.reviews.getStats, { productId });

    if (!stats || stats.count === 0) return null;

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-3 w-3 ${
                            star <= Math.round(stats.average)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                        }`}
                    />
                ))}
            </div>
            <span className="text-xs text-muted-foreground">({stats.count})</span>
        </div>
    );
}
