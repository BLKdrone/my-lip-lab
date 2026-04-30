"use client";

import BottomNav from "../components/BottomNav";

export default function SettingsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        maxWidth: 430,
        margin: "0 auto",
        fontFamily: "'DM Sans', sans-serif",
      }}
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
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                <path
                  d="M1 1l4 4-4 4"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
