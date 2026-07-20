"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Ship, Star, MessageSquare, CheckCircle2, ArrowRight, Shield } from "lucide-react";

const CATEGORIES = ["Room Cleanliness", "Staff Service", "Check-In Process", "Food & Beverages", "Overall Experience"];

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#E5E7E6] font-sans flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#F7F5F0] rounded-[28px] border border-white/50 shadow-2xl p-10 text-center">
          <div className="w-16 h-16 bg-[#2A9D8F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#2A9D8F]" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#1C2D37] mb-2">Thank you!</h2>
          <p className="text-sm text-[#1C2D37]/55 leading-relaxed mb-6">
            Your feedback helps us improve every stay. We read every review personally.
          </p>
          {rating >= 4 && (
            <div className="bg-[#F4A261]/10 border border-[#F4A261]/20 rounded-xl p-4 mb-6">
              <p className="text-xs text-[#1C2D37]/60 leading-relaxed">
                💛 Loved your experience? Consider leaving a public Google Review to help other travellers find us.
              </p>
            </div>
          )}
          <button
            onClick={() => router.push("/bookings")}
            className="w-full bg-[#1C2D37] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#253945] transition-all"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5E7E6] font-sans text-[#1C2D37]">
      <nav className="bg-[#1C2D37]/95 backdrop-blur-sm border-b border-white/5 px-6 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center shadow-md shrink-0">
          <Ship className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-sm">Share Your Experience</span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-[#F7F5F0] rounded-[28px] border border-white/50 shadow-xl p-8 space-y-7">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-[#1C2D37]">How was your stay?</h1>
            <p className="text-sm text-[#1C2D37]/45 mt-1">Sunrise Varanasi Ghat · Jul 18–21, 2026</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/35 mb-3">Overall Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHoveredRating(s)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 transition-all ${
                      s <= (hoveredRating || rating)
                        ? "fill-[#F4A261] text-[#F4A261]"
                        : "text-[#1C2D37]/15"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-semibold mt-2 text-[#F4A261]">
                {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
              </p>
            )}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/35 mb-3">What stood out?</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleTag(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    tags.includes(cat)
                      ? "bg-[#2A9D8F] text-white border-transparent"
                      : "bg-white/60 text-[#1C2D37]/60 border-[#1C2D37]/10 hover:bg-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/35 mb-2">
              <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
              Tell us more (optional)
            </label>
            <textarea
              rows={4}
              placeholder="What made your stay memorable? Any suggestions for improvement?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm focus:outline-none focus:border-[#E76F51]/50 focus:ring-1 focus:ring-[#E76F51]/20 transition-all resize-none"
            />
            <p className="text-[10px] text-[#1C2D37]/30 mt-1 text-right">{comment.length}/500</p>
          </div>

          <div className="flex items-start gap-3 bg-[#1C2D37]/3 p-4 rounded-xl border border-[#1C2D37]/5">
            <Shield className="w-4 h-4 text-[#2A9D8F] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#1C2D37]">Share Anonymously</p>
                <button
                  onClick={() => setAnonymous(!anonymous)}
                  className={`w-10 h-5 rounded-full relative transition-all ${anonymous ? "bg-[#2A9D8F]" : "bg-[#1C2D37]/15"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${anonymous ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
              <p className="text-[10px] text-[#1C2D37]/40 mt-1">
                Your name will be hidden from public reviews. The property still receives your feedback.
              </p>
            </div>
          </div>

          <button
            disabled={rating === 0 || loading}
            onClick={handleSubmit}
            className="w-full bg-[#E76F51] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#d85c3e] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-[#E76F51]/15"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Submit Feedback <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
