"use client";

import { useState, useEffect } from "react";
import { Star, User } from "lucide-react";

export default function GoogleReviews({ slug, breederName }) {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch(`/api/breeders/${slug}/google-reviews`);
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || "Failed to load reviews");
                } else {
                    setReviews(data.reviews || []);
                    setRating(data.rating);
                    setTotal(data.total_reviews || 0);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, [slug]);

    if (loading) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
                    <p className="text-sm text-slate-500">Loading Google reviews...</p>
                </div>
            </div>
        );
    }

    if (error || reviews.length === 0) {
        return null;
    }

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-[#FFB545]" />
                    <h2 className="text-xl font-semibold text-slate-900">Google Reviews</h2>
                </div>
                {rating && (
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-900">{rating}</span>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= Math.round(rating) ? "fill-[#FFB545] text-[#FFB545]" : "text-slate-300"}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-slate-500">({total} reviews)</span>
                    </div>
                )}
            </div>

            <div className="mt-6 space-y-4">
                {reviews.slice(0, 5).map((review, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-100 bg-[#F1F4F6] p-4">
                        <div className="flex items-start gap-3">
                            {review.profile_photo_url ? (
                                <img
                                    src={review.profile_photo_url}
                                    alt={review.author_name}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900">{review.author_name}</p>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-3 w-3 ${star <= review.rating ? "fill-[#FFB545] text-[#FFB545]" : "text-slate-300"}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{review.relative_time_description}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {expanded[idx] || review.text.length <= 200
                                        ? review.text
                                        : review.text.slice(0, 200) + "..."}
                                    {review.text.length > 200 && (
                                        <button
                                            onClick={() => setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                                            className="ml-1 text-xs font-semibold text-[#00BFA5] hover:text-[#008f7a]"
                                        >
                                            {expanded[idx] ? "Show less" : "Read more"}
                                        </button>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-4 text-xs text-slate-400">
                Reviews powered by Google. All reviews are the opinions of their respective authors.
            </p>
        </div>
    );
}
