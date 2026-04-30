"use client";

import { ImageIcon } from "lucide-react";
import BottomNav from "../components/BottomNav";

export default function GalleryPage() {
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
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}>Gallery</h1>
        <p style={{ fontSize: 12, color: "#94a3b8" }}>Your saved looks</p>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "16px 16px 80px" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "#fff",
            border: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <ImageIcon size={22} color="#94a3b8" />
        </div>
        <div className="text-center">
          <p
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="text-sm font-semibold text-slate-700"
          >
            Your Gallery is Empty
          </p>
          <p
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="text-xs text-slate-400 mt-1"
          >
            Create and save your custom blends to see them here.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
