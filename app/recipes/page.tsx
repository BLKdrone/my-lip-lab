"use client";

import Link from "next/link";
import { ArrowLeft, Beaker } from "lucide-react";

const ORIGINALS = [
  { 
    id: "sunset-rose", 
    name: "Sunset Rose", 
    hex: "#E8637A", 
    recipe: { red: 5, pink: 3, white: 1 }
  },
  { 
    id: "coral-bliss", 
    name: "Coral Bliss", 
    hex: "#F4845F", 
    recipe: { orange: 5, yellow: 3, white: 1 }
  },
  { 
    id: "berry-pop", 
    name: "Berry Pop", 
    hex: "#9B4B7E", 
    recipe: { purple: 5, pink: 3, glitter: 1 }
  },
  { 
    id: "dusty-pink", 
    name: "Dusty Pink", 
    hex: "#D3827B", 
    recipe: { yellow: 3, red: 2, pink: 4 }
  },
  { 
    id: "nude-satin", 
    name: "Nude Satin", 
    hex: "#d2b48c", 
    recipe: { white: 5, orange: 2, pink: 2 }
  },
  { 
    id: "cherry-glaze", 
    name: "Cherry Glaze", 
    hex: "#be123c", 
    recipe: { red: 7, orange: 1, yellow: 1 }
  },
  { 
    id: "peach-sorbet", 
    name: "Peach Sorbet", 
    hex: "#ffb07c", 
    recipe: { white: 5, yellow: 3, orange: 1 }
  },
  { 
    id: "crimson-velvet", 
    name: "Crimson Velvet", 
    hex: "#991b1b", 
    recipe: { red: 8, purple: 1 }
  },
  { 
    id: "electric-mauve", 
    name: "Electric Mauve", 
    hex: "#a855f7", 
    recipe: { purple: 5, pink: 3, white: 1 }
  }
];

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
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Ready to mix?</p>
          <p style={{ fontSize: 11, color: "#94a3b8" }}>Try these formulas in the lab</p>
        </div>
        <Link href="/" style={{ 
          background: "#fff", color: "#1e293b", padding: "10px 16px", borderRadius: 12,
          fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
          textDecoration: "none"
        }}>
          <Beaker size={14} />
          Open Lab
        </Link>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>
    </div>
  );
}
