"use client";

import { useState } from "react";
import BottomNav from "../components/BottomNav";
import FeedbackModal from "../components/FeedbackModal";
import { MessageSquareText, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div
      className="main-container min-h-screen bg-[#f8fafc] flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto relative font-['DM_Sans',sans-serif]"
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "18px 20px 10px",
          borderBottom: "1px solid #f1f5f9",
          background: "rgba(248,250,252,0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}>Settings</h1>
        <p style={{ fontSize: 12, color: "#94a3b8" }}>Customize your experience</p>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 80px" }}>
        <div className="flex flex-col gap-3">
          {/* Main Settings */}
          {[
            "Skin Tone Calibration",
            "Blend Mode",
            "Camera Resolution",
            "Notifications",
            "Privacy",
            "About",
          ].map((item) => (
            <div
              key={item}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "#fff",
                border: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <span
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                className="text-sm text-slate-700 font-medium"
              >
                {item}
              </span>
              <ChevronRight size={16} color="#cbd5e1" />
            </div>
          ))}

          {/* Feedback Section */}
          <div style={{ marginTop: 12, borderTop: "1px solid #f1f5f9", paddingTop: 24 }}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-4 px-2">
              Support
            </p>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 16,
                background: "linear-gradient(135deg, #e03050 0%, #F88F9A 100%)",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(224, 48, 80, 0.2)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "#DE4B52",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MessageSquareText size={18} color="#fff" />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>Send Feedback</p>
                <p style={{ fontSize: 10, opacity: 0.8 }}>Tell us what you think</p>
              </div>
              <ChevronRight size={16} style={{ marginLeft: "auto", opacity: 0.7 }} />
            </button>
          </div>
        </div>
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <BottomNav />
    </div>
  );
}
