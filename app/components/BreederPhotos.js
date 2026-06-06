"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function BreederPhotos({ photos, breederName }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const visiblePhotos = photos.filter((p) => p.photo_url);
    if (visiblePhotos.length === 0) return null;

    function openLightbox(index) {
        setActiveIndex(index);
        setLightboxOpen(true);
    }

    function next() {
        setActiveIndex((i) => (i + 1) % visiblePhotos.length);
    }

    function prev() {
        setActiveIndex((i) => (i - 1 + visiblePhotos.length) % visiblePhotos.length);
    }

    return (
        <>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">Photos</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {visiblePhotos.map((photo, idx) => (
                        <button
                            key={photo.id}
                            onClick={() => openLightbox(idx)}
                            className="group relative aspect-square overflow-hidden rounded-2xl"
                        >
                            <img
                                src={photo.photo_url}
                                alt={`${breederName} photo ${idx + 1}`}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                            {photo.attribution && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                                    Photo from Google
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {visiblePhotos.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                                onClick={(e) => { e.stopPropagation(); prev(); }}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                                onClick={(e) => { e.stopPropagation(); next(); }}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </>
                    )}

                    <img
                        src={visiblePhotos[activeIndex].photo_url}
                        alt={`${breederName} photo ${activeIndex + 1}`}
                        className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
                        {activeIndex + 1} / {visiblePhotos.length}
                    </div>
                </div>
            )}
        </>
    );
}
