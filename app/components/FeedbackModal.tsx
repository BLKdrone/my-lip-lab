"use client";

import { useState } from "react";
import { X, Send, Smile, Frown, Meh, Star } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log("Feedback submitted:", { rating, comment });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(null);
      setComment("");
      onClose();
    }, 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 24,
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          position: "relative",
          animation: "modalAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            padding: 8,
            borderRadius: "50%",
            background: "#f8fafc",
            border: "none",
            cursor: "pointer",
            color: "#94a3b8",
          }}
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#22c55e",
              }}
            >
              <Star size={32} fill="currentColor" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
              Thank You!
            </h3>
            <p style={{ fontSize: 14, color: "#64748b" }}>
              Your feedback helps us make LipLab better.
            </p>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
              Share Your Thoughts
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
              How is your experience with the LipLab Studio?
            </p>

            <form onSubmit={handleSubmit}>
              {/* Rating Selector */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                {[
                  { icon: Frown, value: 1, label: "Poor" },
                  { icon: Meh, value: 2, label: "Okay" },
                  { icon: Smile, value: 3, label: "Great" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRating(item.value)}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "12px 0",
                      borderRadius: 16,
                      background: rating === item.value ? "#f8fafc" : "transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <item.icon
                      size={28}
                      color={rating === item.value ? "#e03050" : "#cbd5e1"}
                      strokeWidth={rating === item.value ? 2.5 : 1.5}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: rating === item.value ? 600 : 400,
                        color: rating === item.value ? "#1e293b" : "#94a3b8",
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Comment Field */}
              <textarea
                placeholder="Tell us more (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: "100%",
                  height: 100,
                  padding: 12,
                  borderRadius: 16,
                  border: "1.5px solid #f1f5f9",
                  background: "#f8fafc",
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "none",
                  outline: "none",
                  marginBottom: 20,
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#f1f5f9")}
              />

              <button
                type="submit"
                disabled={!rating}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 16,
                  background: rating ? "#1e293b" : "#f1f5f9",
                  color: rating ? "#fff" : "#cbd5e1",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: rating ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                }}
              >
                <Send size={16} />
                Submit Feedback
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
