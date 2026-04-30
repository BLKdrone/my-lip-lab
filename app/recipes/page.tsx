"use client";

import Link from "next/link";
import { ArrowLeft, Beaker } from "lucide-react";
import { ORIGINALS } from "../constants";
import BottomNav from "../components/BottomNav";

export default function RecipesPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#f8fafc", 
      fontFamily: "'DM Sans', sans-serif",
      padding: "24px 20px 100px",
      maxWidth: 430,
      margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <Link href="/" style={{ 
          width: 40, height: 40, borderRadius: 12, background: "#fff", 
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          color: "#64748b"
        }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", letterSpacing: "-0.02em" }}>
            Color Recipes
          </h1>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            The official Shop Originals formulas
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 24, 
        border: "1.5px solid #f1f5f9", 
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <th style={{ textAlign: "left", padding: "16px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Color</th>
              <th style={{ textAlign: "left", padding: "16px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Recipe Formula</th>
            </tr>
          </thead>
          <tbody>
            {ORIGINALS.map((orig) => (
              <tr key={orig.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                <td style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: 10, background: orig.hex,
                      boxShadow: `0 4px 12px ${orig.hex}44`
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{orig.name}</span>
                  </div>
                </td>
                <td style={{ padding: "16px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {Object.entries(orig.recipe).map(([pigment, count]) => (
                      <div key={pigment} style={{ 
                        background: "#f1f5f9", 
                        padding: "4px 8px", 
                        borderRadius: 6, 
                        fontSize: 10, 
                        fontWeight: 600, 
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}>
                        <span style={{ color: "#334155" }}>{count}</span>
                        <span style={{ textTransform: "capitalize" }}>{pigment}</span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lab CTA */}
      <div style={{ 
        marginTop: 24, 
        padding: 20, 
        borderRadius: 20, 
        background: "linear-gradient(135deg, #DE4B52 0%, #f88f9a 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Ready to mix?</p>
          <p style={{ fontSize: 11, color: "#ffffff" }}>Try these formulas in the lab</p>
        </div>
        <Link href="/" style={{ 
          background: "#fff", color: "#DE4B52", padding: "10px 16px", borderRadius: 12,
          fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
          textDecoration: "none"
        }}>
          <Beaker size={14} />
          Open Lab
        </Link>
      </div>

      <BottomNav />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>
    </div>
  );
}
