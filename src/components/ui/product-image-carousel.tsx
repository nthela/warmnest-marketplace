"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageCarouselProps {
    images: string[];
    alt: string;
}

export function ProductImageCarousel({ images, alt }: ProductImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchRef = useRef<{ startX: number; startY: number; isDragging: boolean } | null>(null);
    const dragOffsetRef = useRef(0);

    const goNext = useCallback(() => {
        setIsTransitioning(true);
        setCurrentIndex((prev) => Math.min(prev + 1, images.length - 1));
        setTimeout(() => setIsTransitioning(false), 300);
    }, [images.length]);

    const goPrev = useCallback(() => {
        setIsTransitioning(true);
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
        setTimeout(() => setIsTransitioning(false), 300);
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || images.length <= 1) return;

        function onTouchStart(e: TouchEvent) {
            touchRef.current = {
                startX: e.touches[0].clientX,
                startY: e.touches[0].clientY,
                isDragging: false,
            };
            dragOffsetRef.current = 0;
            setDragOffset(0);
        }

        function onTouchMove(e: TouchEvent) {
            if (!touchRef.current) return;
            const diffX = e.touches[0].clientX - touchRef.current.startX;
            const diffY = e.touches[0].clientY - touchRef.current.startY;

            if (!touchRef.current.isDragging && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
                touchRef.current.isDragging = true;
            }

            if (touchRef.current.isDragging) {
                e.preventDefault();
                dragOffsetRef.current = diffX;
                setDragOffset(diffX);
            }
        }

        function onTouchEnd() {
            if (!touchRef.current) return;
            const offset = dragOffsetRef.current;
            const threshold = 40;

            if (touchRef.current.isDragging) {
                if (offset < -threshold) {
                    setIsTransitioning(true);
                    setCurrentIndex((prev) => Math.min(prev + 1, images.length - 1));
                    setTimeout(() => setIsTransitioning(false), 300);
                } else if (offset > threshold) {
                    setIsTransitioning(true);
                    setCurrentIndex((prev) => Math.max(prev - 1, 0));
                    setTimeout(() => setIsTransitioning(false), 300);
                }
            }

            dragOffsetRef.current = 0;
            setDragOffset(0);
            touchRef.current = null;
        }

        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        el.addEventListener("touchend", onTouchEnd, { passive: true });

        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("touchend", onTouchEnd);
        };
    }, [images.length]);

    if (images.length === 0) {
        return (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                No Image
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <img src={images[0]} alt={alt} className="object-cover w-full h-full" />
        );
    }

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden select-none">
            {/* Sliding images track */}
            <div
                className="flex h-full"
                style={{
                    transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                    transition: dragOffset !== 0 ? "none" : isTransitioning ? "transform 300ms ease-out" : "none",
                }}
            >
                {images.map((img, i) => (
                    <div key={i} className="w-full h-full flex-shrink-0">
                        <img
                            src={img}
                            alt={`${alt} ${i + 1}`}
                            className="object-cover w-full h-full"
                            draggable={false}
                        />
                    </div>
                ))}
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                    <span
                        key={i}
                        className={`rounded-full transition-all ${
                            i === currentIndex
                                ? "w-4 h-1.5 bg-white"
                                : "w-1.5 h-1.5 bg-white/50"
                        }`}
                    />
                ))}
            </div>

            {/* Desktop hover arrows */}
            {currentIndex > 0 && (
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); goPrev(); }}
                    className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1 transition-opacity opacity-0 group-hover:opacity-100 hidden md:block"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            )}
            {currentIndex < images.length - 1 && (
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNext(); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1 transition-opacity opacity-0 group-hover:opacity-100 hidden md:block"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
