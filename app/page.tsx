"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Minus,
  Video,
  VideoOff,
  Sparkles,
  RotateCcw,
  Heart,
  Check,
} from "lucide-react";
import { ORIGINALS, PIGMENTS, type Pigment, type OriginalColor } from "./constants";
import BottomNav from "./components/BottomNav";
import { supabase } from "@/lib/supabaseClient";

// ─── Helpers ────────────────────────────────────────────────────────────────
function avgColor(drops: Pigment[]) {
  const total = drops.reduce((s, d) => s + (d.count || 0), 0);
  if (total === 0) return null;
  let r = 0, g = 0, b = 0;
  for (const d of drops) {
    const count = d.count || 0;
    const p = count / total;
    r += d.rgb[0] * p;
    g += d.rgb[1] * p;
    b += d.rgb[2] * p;
  }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

// ─── Lip SVG (professional shape) ───────────────────────────────────────────
function LipMask({ color }: { color: string | null }) {
  return (
    <svg
      viewBox="0 0 220 90"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        left: "50%",
        top: "75%",
        transform: "translate(-50%, -50%)",
        width: "24%",
        maxWidth: 200,
        mixBlendMode: "multiply",
        opacity: color ? 0.85 : 0,
        transition: "opacity 0.5s ease",
        filter: "blur(0.6px)",
        pointerEvents: "none",
      }}
    >
      <path
        d="M10 50 C10 50, 40 18, 70 30 C85 36, 95 22, 110 22 C125 22, 135 36, 150 30 C180 18, 210 50, 210 50 C210 50, 185 40, 155 42 C140 43, 128 52, 110 52 C92 52, 80 43, 65 42 C35 40, 10 50, 10 50 Z"
        fill={color || "transparent"}
      />
      <path
        d="M10 50 C35 40, 65 42, 80 43 C92 44, 100 60, 110 62 C120 60, 128 44, 140 43 C155 42, 185 40, 210 50 C200 75, 170 82, 140 80 C125 79, 118 74, 110 74 C102 74, 95 79, 80 80 C50 82, 20 75, 10 50 Z"
        fill={color || "transparent"}
      />
    </svg>
  );
}

// ─── Mixing Tube ─────────────────────────────────────────────────────────────
function MixingTube({ pigmentDrops }: { pigmentDrops: Pigment[] }) {
  const total = pigmentDrops.reduce((s, d) => s + (d.count || 0), 0);
  const maxDrops = 9;
  const fillPct = Math.min(total / maxDrops, 1);

  const layers = pigmentDrops
    .filter((d) => (d.count || 0) > 0)
    .map((d) => ({ hex: d.hex, pct: (d.count || 0) / Math.max(total, 1) }));

  return (
    <div className="flex flex-col items-center gap-2">
      <p
        style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.12em" }}
        className="text-[9px] uppercase text-slate-400 font-medium tracking-widest"
      >
        Mixing Tube
      </p>
      <div
        style={{
          width: 28,
          height: 140,
          borderRadius: 14,
          border: "1.5px solid #e2e8f0",
          background: "#f8fafc",
          overflow: "hidden",
          position: "relative",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${fillPct * 100}%`,
            transition: "height 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            display: "flex",
            flexDirection: "column-reverse",
            overflow: "hidden",
          }}
        >
          {layers.map((layer, i) => (
            <div
              key={i}
              style={{
                flex: `0 0 ${layer.pct * 100}%`,
                background: layer.hex,
                transition: "flex 0.4s ease",
              }}
            />
          ))}
        </div>
        {[3/9, 6/9].map((t) => (
          <div
            key={t}
            style={{
              position: "absolute",
              bottom: `${t * 100}%`,
              left: 4,
              right: 4,
              height: 1,
              background: "rgba(148,163,184,0.4)",
              pointerEvents: "none",
            }}
          />
        ))}
      </div>
      <span
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        className="text-[10px] text-slate-400"
      >
        {total}/{maxDrops} drops
      </span>
    </div>
  );
}

// ─── Camera Panel ────────────────────────────────────────────────────────────
function CameraPanel({ activeColor }: { activeColor: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permState, setPermState] = useState("idle");

  const startCamera = useCallback(async () => {
    setErrorMsg(null);
    setPermState("idle");
    
    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
      setPermState("error");
      setErrorMsg("Camera requires HTTPS (Secure Connection).");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermState("error");
      setErrorMsg("Camera API not supported.");
      return;
    }

    try {
      const constraints = {
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
      };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (innerErr) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            setStreaming(true);
            setPermState("idle");
          } catch (playErr) {
            setErrorMsg("Click to start video.");
          }
        };
      }
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setPermState("denied");
        setErrorMsg("Camera blocked. Please allow access.");
      } else {
        setPermState("error");
        setErrorMsg(error.message || "Could not start camera.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  }, []);

  useEffect(() => {
    const initCamera = async () => {
      await startCamera();
    };
    initCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const isFailed = permState === "denied" || permState === "error";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: 20,
          overflow: "hidden",
          background: streaming ? "#000" : "#f1f5f9",
          border: isFailed ? "1.5px dashed #fca5a5" : "1.5px solid #e2e8f0",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          transition: "border-color 0.3s ease",
        }}
      >
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
            display: streaming ? "block" : "none",
          }}
        />
        {streaming && <LipMask color={activeColor} />}
        {!streaming && (
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 12, padding: 20,
            }}
          >
            {activeColor && !isFailed && (
              <div
                style={{
                  width: 110, height: 44, borderRadius: 999,
                  background: activeColor, opacity: 0.85,
                  boxShadow: `0 6px 24px ${activeColor}66`,
                  transition: "background 0.5s ease",
                  marginBottom: 4,
                }}
              />
            )}
            {isFailed ? (
              <div
                style={{
                  background: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: 12, padding: "10px 14px",
                  display: "flex", alignItems: "flex-start", gap: 8, maxWidth: 260,
                }}
              >
                <span style={{ fontSize: 16 }}>⚠️</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", marginBottom: 2 }}>Camera Issue</p>
                  <p style={{ fontSize: 10, color: "#ef4444", lineHeight: 1.5 }}>{errorMsg}</p>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
                {activeColor ? "Initializing live try-on..." : "Pick a shade to begin preview"}
              </p>
            )}
          </div>
        )}
        {streaming && (
          <button
            onClick={stopCamera}
            style={{
              position: "absolute", bottom: 10, right: 10,
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255,255,255,0.92)",
              border: "1px solid #e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", backdropFilter: "blur(8px)",
            }}
          >
            <VideoOff size={14} color="#64748b" />
          </button>
        )}
      </div>
      {!streaming && (
        <button
          onClick={startCamera}
          style={{
            width: "100%",
            padding: "13px 16px",
            borderRadius: 14,
            background: activeColor || "#E03050",
            border: "none",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.03em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: `0 4px 20px ${activeColor || "#E03050"}55`,
            transition: "all 0.3s ease",
          }}
        >
          <Video size={15} />
          {permState === "denied" ? "Retry Camera" : "Start Live Try-On"}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LipLabStudio() {
  const [selectedOriginal, setSelectedOriginal] = useState<OriginalColor | null>(null);
  const [slots, setSlots] = useState([
    { id: "red", count: 0 },
    { id: "yellow", count: 0 },
    { id: "pink", count: 0 }
  ]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const totalDrops = slots.reduce((s, slot) => s + slot.count, 0);
  const MAX_DROPS = 9;

  const pigmentDrops: Pigment[] = slots.map((slot) => {
    const p = PIGMENTS.find(pig => pig.id === slot.id)!;
    return { ...p, count: slot.count };
  });

  const mixedColor = totalDrops > 0 ? avgColor(pigmentDrops) : null;
  const activeColor = mixedColor || (selectedOriginal ? selectedOriginal.hex : null);

  const handleOriginal = (orig: OriginalColor) => {
    setSelectedOriginal(orig);
    const recipeEntries = Object.entries(orig.recipe).filter(([_, count]) => (count as number) > 0);
    const newSlots = [
      { id: "white", count: 0 },
      { id: "white", count: 0 },
      { id: "white", count: 0 }
    ];
    recipeEntries.forEach(([id, count], i) => {
      if (i < 3) newSlots[i] = { id, count: count as number };
    });
    setSlots(newSlots);
  };

  const saveToGallery = async () => {
    if (!activeColor || saveStatus !== "idle") return;
    
    setSaveStatus("saving");
    
    const recipe: Record<string, number> = {};
    slots.forEach(s => {
      if (s.count > 0) recipe[s.id] = s.count;
    });

    const newLook = {
      name: selectedOriginal ? selectedOriginal.name : "Custom Blend",
      hex: activeColor,
      timestamp: new Date().toISOString(),
      recipe: selectedOriginal ? selectedOriginal.recipe : recipe
    };

    const { error } = await supabase
      .from('gallery')
      .insert([newLook]);

    if (!error) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      console.error("Error saving to gallery:", error.message);
      setSaveStatus("idle");
    }
  };

  const adjustDrop = (slotIdx: number, delta: number) => {
    setSelectedOriginal(null);
    const next = slots[slotIdx].count + delta;
    if (next < 0 || totalDrops + delta > MAX_DROPS) return;
    const newSlots = [...slots];
    newSlots[slotIdx] = { ...newSlots[slotIdx], count: next };
    setSlots(newSlots);
  };

  const changeSlotColor = (slotIdx: number, newId: string) => {
    if (slots[slotIdx].id === newId) return;
    const newSlots = [...slots];
    newSlots[slotIdx] = { id: newId, count: 0 };
    setSlots(newSlots);
  };

  const resetLab = () => {
    setSlots(slots.map(s => ({ ...s, count: 0 })));
    setSelectedOriginal(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,500;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8fafc; overflow-x: hidden; }
        .drop-btn:active { transform: scale(0.92); }
        .orig-btn:active { transform: scale(0.97); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media (min-width: 480px) {
          .main-container {
            border-left: 1px solid #f1f5f9;
            border-right: 1px solid #f1f5f9;
            box-shadow: 0 0 50px rgba(0,0,0,0.02);
          }
        }
      `}</style>

      <div
        className="main-container"
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          fontFamily: "'DM Sans', sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "18px 20px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f1f5f9",
            background: "rgba(248,250,252,0.95)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image src="/logo.png" alt="LipLab Logo" width={38} height={38} style={{ borderRadius: "8px" }} priority />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">Pigment Studio</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#1e293b", lineHeight: 1.2, marginTop: 2 }}>Lip<em>Lab</em></p>
            </div>
          </div>
          {activeColor && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: activeColor, boxShadow: `0 0 6px ${activeColor}88`, transition: "background 0.5s ease" }} />
              <span className="text-xs text-slate-500 font-medium">{selectedOriginal ? selectedOriginal.name : "Custom Mix"}</span>
              <button 
                onClick={saveToGallery}
                disabled={saveStatus !== "idle"}
                style={{ 
                  marginLeft: 4, padding: 4, borderRadius: 6, border: "none", background: "none", cursor: "pointer",
                  color: saveStatus === "saved" ? "#22c55e" : "#94a3b8", display: "flex", alignItems: "center"
                }}
              >
                {saveStatus === "saved" ? <Check size={14} /> : <Heart size={14} fill={saveStatus === "saving" ? "#f472b6" : "none"} />}
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 80px" }} className="no-scrollbar">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-medium">Shop Originals</p>
                {selectedOriginal && <span style={{ fontSize: 10, fontWeight: 700, color: selectedOriginal.hex }}>{selectedOriginal.name}</span>}
              </div>
              <div className="no-scrollbar" style={{ display: "flex", alignItems: "center", gap: 12, overflowX: "auto", padding: "4px 2px 10px" }}>
                {ORIGINALS.map((orig) => {
                  const active = selectedOriginal?.id === orig.id;
                  return (
                    <button key={orig.id} onClick={() => handleOriginal(orig)} style={{ width: 38, height: 38, borderRadius: "50%", background: orig.hex, border: active ? "2.5px solid #1e293b" : "1.5px solid #fff", cursor: "pointer", flexShrink: 0, transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)", boxShadow: active ? `0 6px 14px ${orig.hex}66` : `0 2px 5px rgba(0,0,0,0.08)`, transform: active ? "scale(1.15)" : "scale(1)" }} title={orig.name} />
                  );
                })}
              </div>
            </section>

            <section>
              <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-medium mb-3">Pro Camera Studio</p>
              <CameraPanel activeColor={activeColor} />
            </section>

            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-medium">Layered Pigment Lab</p>
                <button onClick={resetLab} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 10, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
                  <RotateCcw size={10} /> Reset
                </button>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #f1f5f9", padding: "16px 12px", display: "flex", gap: 8, alignItems: "flex-end", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {slots.map((slot, slotIdx) => {
                    const pigment = PIGMENTS.find(p => p.id === slot.id)!;
                    const count = slot.count;
                    return (
                      <div key={slotIdx} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px", borderRadius: 16, background: count > 0 ? `${pigment.hex}0d` : "#fafafa", border: `1px solid ${count > 0 ? pigment.hex + "33" : "#f1f5f9"}`, transition: "all 0.3s ease" }}>
                        <div className="no-scrollbar" style={{ display: "flex", alignItems: "center", gap: 8, overflow: "auto", paddingBottom: 2 }}>
                          {PIGMENTS.map((p) => (
                            <button key={p.id} onClick={() => changeSlotColor(slotIdx, p.id)} style={{ width: 18, height: 18, borderRadius: "50%", background: p.hex, border: slot.id === p.id ? "2.5px solid #1e293b" : "1px solid #e2e8f0", cursor: "pointer", flexShrink: 0, transition: "transform 0.2s ease" }} title={p.label} />
                          ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 12, height: 12, borderRadius: "50%", background: pigment.hex }} />
                          <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#334155", textTransform: "uppercase", letterSpacing: "0.02em" }}>{pigment.label}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button className="drop-btn" onClick={() => adjustDrop(slotIdx, -1)} disabled={count === 0} style={{ width: 26, height: 26, borderRadius: "50%", background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: count > 0 ? "pointer" : "not-allowed", opacity: count > 0 ? 1 : 0.4 }}><Minus size={12} color="#64748b" /></button>
                            <span style={{ fontSize: 13, fontWeight: 700, color: count > 0 ? pigment.hex : "#cbd5e1", minWidth: 16, textAlign: "center" }}>{count}</span>
                            <button className="drop-btn" onClick={() => adjustDrop(slotIdx, 1)} disabled={totalDrops >= MAX_DROPS} style={{ width: 26, height: 26, borderRadius: "50%", background: totalDrops < MAX_DROPS ? pigment.hex : "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: totalDrops < MAX_DROPS ? "pointer" : "not-allowed", boxShadow: totalDrops < MAX_DROPS ? `0 2px 8px ${pigment.hex}44` : "none" }}><Plus size={12} color={totalDrops < MAX_DROPS ? "#fff" : "#94a3b8"} /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <MixingTube pigmentDrops={pigmentDrops} />
              </div>
              {mixedColor && (
                <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: "#fff", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: mixedColor, boxShadow: `0 3px 12px ${mixedColor}55`, transition: "background 0.4s ease", flexShrink: 0 }} />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Custom Blend</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{pigmentDrops.filter((d) => (d.count || 0) > 0).map((d) => `${d.count}× ${d.label}`).join(" · ")}</p>
                  </div>
                  <div style={{ marginLeft: "auto" }}><Sparkles size={14} color="#f472b6" /></div>
                </div>
              )}
            </section>
          </div>
        </div>

        <BottomNav />
      </div>
    </>
  );
}
