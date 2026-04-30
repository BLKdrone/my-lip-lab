"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Minus,
  Video,
  VideoOff,
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
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.12em" }}
        className="text-[9px] uppercase text-slate-400 font-medium tracking-widest"
      >
        Mix
      </p>
      <div
        style={{
          width: 24,
          height: 120,
          borderRadius: 12,
          border: "1px solid #f0f0f0",
          background: "#fafafa",
          overflow: "hidden",
          position: "relative",
          boxShadow: "inset 0 1px 4px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${fillPct * 100}%`,
            transition: "height 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
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
      </div>
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
      setErrorMsg("Camera requires HTTPS.");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermState("error");
      setErrorMsg("Not supported.");
      return;
    }

    try {
      const constraints = {
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
      };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (innerErr: unknown) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            setStreaming(true);
            setPermState("idle");
          } catch (playErr: unknown) {
            setErrorMsg("Click to start.");
          }
        };
      }
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setPermState("denied");
        setErrorMsg("Blocked.");
      } else {
        setPermState("error");
        setErrorMsg(error.message || "Error.");
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
          aspectRatio: "4/5",
          borderRadius: 24,
          overflow: "hidden",
          background: streaming ? "#000" : "#fcfcfc",
          transition: "all 0.4s ease",
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
                  width: 80, height: 32, borderRadius: 999,
                  background: activeColor, opacity: 0.8,
                  transition: "background 0.5s ease",
                  marginBottom: 4,
                }}
              />
            )}
            {isFailed ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Camera Error</p>
                <p style={{ fontSize: 10, color: "#999", marginTop: 4 }}>{errorMsg}</p>
              </div>
            ) : (
              <p style={{ fontSize: 10, color: "#d1d1d1", fontWeight: 500, letterSpacing: "0.05em" }}>
                {activeColor ? "Calibrating view..." : "Select a shade"}
              </p>
            )}
          </div>
        )}
        {streaming && (
          <button
            onClick={stopCamera}
            style={{
              position: "absolute", bottom: 16, right: 16,
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.8)",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", backdropFilter: "blur(10px)",
            }}
          >
            <VideoOff size={16} color="#1a1a1a" />
          </button>
        )}
      </div>
      {!streaming && (
        <button
          onClick={startCamera}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 18,
            background: "#1a1a1a",
            border: "none",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: "0.05em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.3s ease",
          }}
        >
          <Video size={16} strokeWidth={2.5} />
          Try-on Live
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
          background: #fdfcfd; 
          overflow-x: hidden; 
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a1a1a;
        }

        .main-container {
          background: #fff;
          min-height: 100vh;
          box-shadow: 0 0 80px rgba(0,0,0,0.02);
        }

        .glass-header {
          background: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(25px) saturate(200%);
          -webkit-backdrop-filter: blur(25px) saturate(200%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
        }

        .soft-card {
          background: #ffffff;
          border: 1px solid #f1f1f1;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.04);
          border-radius: 28px;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .drop-btn {
          border: 1px solid #eeeeee !important;
          background: #ffffff !important;
          transition: all 0.3s ease;
        }

        .drop-btn:hover:not(:disabled) {
          background: #fafafa !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .drop-btn:active {
          transform: translateY(0px);
        }

        .orig-btn {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .orig-btn:hover {
          transform: scale(1.1);
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes subtle-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }

        .floating-soft {
          animation: subtle-float 4s ease-in-out infinite;
        }
      `}</style>

      <div
        className="main-container min-h-screen flex flex-col w-full max-w-md md:max-w-4xl lg:max-w-6xl mx-auto relative bg-white"
      >
        <div
          className="glass-header"
          style={{
            padding: "20px 24px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="floating-soft" style={{ position: "relative" }}>
              <Image src="/logo.png" alt="LipLab Logo" width={40} height={40} style={{ borderRadius: "14px", filter: "grayscale(0.1)" }} priority />
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#a1a1a1", marginBottom: -2 }}>Lab Edition</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em" }}>LipLab</p>
            </div>
          </div>
          {activeColor && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 999, background: "#f8f8f8", border: "1px solid #efefef" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: activeColor }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#444" }}>{selectedOriginal ? selectedOriginal.name : "Custom"}</span>
              <button 
                onClick={saveToGallery}
                disabled={saveStatus !== "idle"}
                style={{ 
                  marginLeft: 4, padding: 4, borderRadius: 8, border: "none", background: "none", cursor: "pointer",
                  color: saveStatus === "saved" ? "#10b981" : "#d1d1d1", display: "flex", alignItems: "center", transition: "all 0.3s"
                }}
              >
                {saveStatus === "saved" ? <Check size={16} strokeWidth={2.5} /> : <Heart size={16} strokeWidth={2.5} fill={saveStatus === "saving" ? "#ff4d4d" : "none"} />}
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "24px 24px 100px" }} className="no-scrollbar">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Column: Preview (Sticky on LG) */}
            <div className="lg:w-1/2 lg:sticky lg:top-24 lg:self-start">
              <section>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Preview</p>
                <div style={{ borderRadius: 32, overflow: "hidden", background: "#fdfdfd", border: "1px solid #f1f1f1", boxShadow: "0 20px 40px -20px rgba(0,0,0,0.08)" }}>
                  <CameraPanel activeColor={activeColor} />
                </div>
              </section>
            </div>

            {/* Right Column: Controls */}
            <div className="lg:w-1/2 flex flex-col gap-8">
              <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Originals</p>
                </div>
                <div className="no-scrollbar" style={{ display: "flex", alignItems: "center", gap: 14, overflowX: "auto", padding: "4px 0" }}>
                  {ORIGINALS.map((orig) => {
                    const active = selectedOriginal?.id === orig.id;
                    return (
                      <button 
                        key={orig.id} 
                        onClick={() => handleOriginal(orig)} 
                        className="orig-btn"
                        style={{ 
                          width: 44, height: 44, borderRadius: "50%", background: orig.hex, 
                          border: active ? "2px solid #1a1a1a" : "2px solid #fff", 
                          cursor: "pointer", flexShrink: 0,
                          boxShadow: active ? "0 0 0 2px rgba(0,0,0,0.05)" : "0 4px 12px rgba(0,0,0,0.06)",
                          transform: active ? "scale(1.1)" : "scale(1)"
                        }} 
                      />
                    );
                  })}
                </div>
              </section>

              <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Mixing</p>
                  <button onClick={resetLab} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 999, border: "1px solid #f0f0f0", background: "#fff", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#999" }}>
                    <RotateCcw size={11} strokeWidth={2.5} /> Clear
                  </button>
                </div>
                
                <div className="soft-card" style={{ padding: "24px 20px", display: "flex", gap: 16, alignItems: "flex-end" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    {slots.map((slot, slotIdx) => {
                      const pigment = PIGMENTS.find(p => p.id === slot.id)!;
                      const count = slot.count;
                      return (
                        <div key={slotIdx} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px", borderRadius: 20, background: count > 0 ? `${pigment.hex}08` : "#fafafa", border: `1px solid ${count > 0 ? pigment.hex + "20" : "#f1f1f1"}`, transition: "all 0.4s ease" }}>
                          <div className="no-scrollbar" style={{ display: "flex", alignItems: "center", gap: 10, overflow: "auto" }}>
                            {PIGMENTS.map((p) => (
                              <button key={p.id} onClick={() => changeSlotColor(slotIdx, p.id)} style={{ width: 18, height: 18, borderRadius: "50%", background: p.hex, border: slot.id === p.id ? "1.5px solid #1a1a1a" : "1.5px solid #fff", cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }} />
                            ))}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#1a1a1a", textTransform: "lowercase", letterSpacing: "0.02em" }}>{pigment.label}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <button className="drop-btn" onClick={() => adjustDrop(slotIdx, -1)} disabled={count === 0} style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: count > 0 ? "pointer" : "not-allowed", opacity: count > 0 ? 1 : 0.3 }}><Minus size={12} strokeWidth={2.5} color="#1a1a1a" /></button>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", minWidth: 16, textAlign: "center" }}>{count}</span>
                              <button className="drop-btn" onClick={() => adjustDrop(slotIdx, 1)} disabled={totalDrops >= MAX_DROPS} style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: totalDrops < MAX_DROPS ? "pointer" : "not-allowed" }}><Plus size={12} strokeWidth={2.5} color="#1a1a1a" /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <MixingTube pigmentDrops={pigmentDrops} />
                </div>

                {mixedColor && (
                  <div style={{ marginTop: 20, padding: "20px", borderRadius: 28, background: "#fefcfd",border: "2px solid rgba(255, 255, 255, 0.4)", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "16px", background: mixedColor, border: "2px solid rgba(255,255,255,0.1)", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#DE4B52" }}>Curated Blend</p>
                      <p style={{ fontSize: 10, color: "#000000", fontWeight: 500, marginTop: 2 }}>{pigmentDrops.filter((d) => (d.count || 0) > 0).map((d) => `${d.count}× ${d.label}`).join(" · ")}</p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </>
  );
}
