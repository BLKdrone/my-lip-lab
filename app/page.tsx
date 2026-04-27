"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FlaskConical,
  ImageIcon,
  Settings,
  Plus,
  Minus,
  Video,
  VideoOff,
  ExternalLink,
  Droplets,
  Sparkles,
  RotateCcw,
} from "lucide-react";
interface ColorObject {
   id: string;
  hex: string;
  name?: string; // Adding this (the '?' means it might be missing)
}

interface OriginalColor {
   id: string;
  hex: string;
  name: string;
}
interface Pigment {
  id: string;
  label: string;
  hex: string;
  rgb: number[];
  count: number;
}
interface OriginalColor {
  name: string;
  hex: string;
}
// ─── Palette ───────────────────────────────────────────────────────────────
const ORIGINALS = [
  { id: "sunset-rose", name: "Sunset Rose", hex: "#E8637A", glow: "#f08090" },
  { id: "coral-bliss", name: "Coral Bliss", hex: "#F4845F", glow: "#f9a07a" },
  { id: "berry-pop", name: "Berry Pop", hex: "#9B4B7E", glow: "#c06099" },
];

const PIGMENTS = [
  { id: "red", label: "Red", hex: "#E03050", rgb: [224, 48, 80] },
  { id: "yellow", label: "Yellow", hex: "#F5C518", rgb: [245, 197, 24] },
  { id: "pink", label: "Pink", hex: "#F472B6", rgb: [244, 114, 182] },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function avgColor(drops: Pigment[]) {
  const total = drops.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;
  let r = 0, g = 0, b = 0;
  for (const d of drops) {
    const p = d.count / total;
    r += d.rgb[0] * p;
    g += d.rgb[1] * p;
    b += d.rgb[2] * p;
  }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

function hexToRgbStr(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r},${g},${b})`;
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
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "72%",
        maxWidth: 200,
        mixBlendMode: "multiply",
        opacity: color ? 0.85 : 0,
        transition: "opacity 0.5s ease",
        filter: "blur(0.6px)",
        pointerEvents: "none",
      }}
    >
      {/* Upper lip */}
      <path
        d="M10 50 C10 50, 40 18, 70 30 C85 36, 95 22, 110 22 C125 22, 135 36, 150 30 C180 18, 210 50, 210 50 C210 50, 185 40, 155 42 C140 43, 128 52, 110 52 C92 52, 80 43, 65 42 C35 40, 10 50, 10 50 Z"
        fill={color || "transparent"}
      />
      {/* Lower lip */}
      <path
        d="M10 50 C35 40, 65 42, 80 43 C92 44, 100 60, 110 62 C120 60, 128 44, 140 43 C155 42, 185 40, 210 50 C200 75, 170 82, 140 80 C125 79, 118 74, 110 74 C102 74, 95 79, 80 80 C50 82, 20 75, 10 50 Z"
        fill={color || "transparent"}
      />
    </svg>
  );
}

// ─── Mixing Tube ─────────────────────────────────────────────────────────────
function MixingTube({ pigmentDrops }: { pigmentDrops: Pigment[] }) {
  const total = pigmentDrops.reduce((s, d) => s + d.count, 0);
  const maxDrops = 12;
  const fillPct = Math.min(total / maxDrops, 1);

  // Build layers from bottom (first added pigment = bottom)
  const layers = pigmentDrops
    .filter((d) => d.count > 0)
    .map((d) => ({ hex: d.hex, pct: d.count / Math.max(total, 1) }));

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
        {/* Fill area */}
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

        {/* Tick marks */}
        {[0.25, 0.5, 0.75].map((t) => (
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

      {/* Drop count badge */}
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
  const [permState, setPermState] = useState("idle"); // idle | denied | blocked

  const startCamera = useCallback(async () => {
    // Detect iframe restriction first
    const inIframe = window.self !== window.top;
    if (inIframe) { setPermState("blocked"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
        setPermState("idle");
      }
    } catch {
      setPermState("denied");
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
    // Auto-detect iframe on mount
    if (window.self !== window.top) setPermState("blocked");
    return () => stopCamera();
  }, [stopCamera]);

  const buildStudioHTML = (color:string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>LipLab Studio</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0c0a0f;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;color:#fff}
  h1{font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#94a3b8;margin-bottom:20px}
  .stage{position:relative;width:min(100vw,540px);aspect-ratio:4/3;border-radius:20px;overflow:hidden;background:#111;border:1px solid #1e293b}
  video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
  svg.lip{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:60%;mix-blend-mode:multiply;opacity:.85;transition:opacity .5s}
  .controls{margin-top:16px;display:flex;gap:10px}
  button{padding:10px 20px;border-radius:999px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-size:12px;cursor:pointer;transition:all .2s}
  button:hover{background:#334155;color:#e2e8f0}
  .badge{padding:6px 14px;border-radius:999px;background:${color || '#E8637A'}22;border:1px solid ${color || '#E8637A'}44;color:${color || '#E8637A'};font-size:11px;display:flex;align-items:center;gap:6px}
  .dot{width:8px;height:8px;border-radius:50%;background:${color || '#E8637A'}}
  #status{font-size:11px;color:#64748b;margin-top:10px}
</style>
</head>
<body>
<h1>⬡ LipLab Pro Studio</h1>
<div class="stage" id="stage">
  <video id="v" autoplay playsinline muted></video>
  <svg class="lip" id="lip" viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 50 C10 50, 40 18, 70 30 C85 36, 95 22, 110 22 C125 22, 135 36, 150 30 C180 18, 210 50, 210 50 C210 50, 185 40, 155 42 C140 43, 128 52, 110 52 C92 52, 80 43, 65 42 C35 40, 10 50, 10 50 Z" fill="${color || '#E8637A'}"/>
    <path d="M10 50 C35 40, 65 42, 80 43 C92 44, 100 60, 110 62 C120 60, 128 44, 140 43 C155 42, 185 40, 210 50 C200 75, 170 82, 140 80 C125 79, 118 74, 110 74 C102 74, 95 79, 80 80 C50 82, 20 75, 10 50 Z" fill="${color || '#E8637A'}"/>
  </svg>
</div>
<div class="controls">
  <button onclick="toggleCam()">Toggle Camera</button>
  <div class="badge"><div class="dot"></div>Active Color</div>
</div>
<p id="status">Click "Allow" when your browser asks for camera access.</p>
<script>
let stream=null,on=false;
async function toggleCam(){
  if(on){stream&&stream.getTracks().forEach(t=>t.stop());document.getElementById('v').srcObject=null;on=false;document.getElementById('status')='Camera off';return}
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}});
    document.getElementById('v').srcObject=stream;on=true;
    document.getElementById('status').textContent='Camera active — lip overlay applied';
  }catch(e){document.getElementById('status').textContent='Permission denied. Please allow camera in your browser settings.'}
}
toggleCam();
</script>
</body>
</html>`;

  const openInNewTab = () => {
  const html = buildStudioHTML(activeColor || "#E8637A");
    const blob = new Blob([html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  const isBlocked = permState === "blocked" || permState === "denied";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Main camera box */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: 20,
          overflow: "hidden",
          background: streaming ? "#000" : "#f1f5f9",
          border: isBlocked ? "1.5px dashed #fca5a5" : "1.5px solid #e2e8f0",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          transition: "border-color 0.3s ease",
        }}
      >
        {/* Live video */}
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

        {/* Lip overlay on live feed */}
        {streaming && <LipMask color={activeColor} />}

        {/* Idle / blocked state */}
        {!streaming && (
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 12, padding: 20,
            }}
          >
            {/* Color preview pill */}
            {activeColor && (
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

            {isBlocked ? (
              <>
                <div
                  style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: 12, padding: "10px 14px",
                    display: "flex", alignItems: "flex-start", gap: 8, maxWidth: 260,
                  }}
                >
                  <span style={{ fontSize: 16 }}>🔒</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", marginBottom: 2 }}>
                      Camera blocked in preview
                    </p>
                    <p style={{ fontSize: 10, color: "#ef4444", lineHeight: 1.5 }}>
                      Embedded previews can't access your camera. Launch the full studio in a new tab to use the live AR try-on.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
                {activeColor ? "Select a color above, then launch the studio" : "Pick a shade to preview"}
              </p>
            )}
          </div>
        )}

        {/* Stop button when streaming */}
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

      {/* Launch Studio CTA — prominent */}
      <button
        onClick={openInNewTab}
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
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
      >
        <ExternalLink size={15} />
        Launch Full Studio — Live Camera Try-On
      </button>

      <p style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        Opens a standalone page where your browser can grant camera permission
      </p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LipLabStudio() {
  const [tab, setTab] = useState("lab");
const [selectedOriginal, setSelectedOriginal] = useState<ColorObject | OriginalColor | null>(null);
const [pigmentDrops, setPigmentDrops] = useState<Pigment[]>( // Added <Pigment[]>
  PIGMENTS.map((p) => ({ ...p, count: 0 }))
);
  const totalDrops = pigmentDrops.reduce((s, d) => s + d.count, 0);
  const MAX_DROPS = 12;

  const mixedColor = totalDrops > 0 ? avgColor(pigmentDrops) : null;

  // Active color: if original is selected and no drops, use original. If drops, use mix.
  const activeColor = mixedColor || (selectedOriginal ? selectedOriginal.hex : null);

  const handleOriginal = (orig: Pigment) => {
    setSelectedOriginal(orig);
    setPigmentDrops(PIGMENTS.map((p) => ({ ...p, count: 0 })));
  };

  const adjustDrop = (id: string | number, delta:number) => {
    setSelectedOriginal(null);
    setPigmentDrops((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const next = d.count + delta;
        if (next < 0) return d;
        if (next > MAX_DROPS) return d;
        if (totalDrops + delta > MAX_DROPS) return d;
        return { ...d, count: next };
      })
    );
  };

  const resetLab = () => {
    setPigmentDrops(PIGMENTS.map((p) => ({ ...p, count: 0 })));
    setSelectedOriginal(null);
  };

  // ── Gallery & Settings screens ──────────────────────────────────────────
  const GalleryScreen = () => (
    <div className="flex flex-col items-center justify-center h-full gap-4 pb-20">
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ImageIcon size={22} color="#94a3b8" />
      </div>
      <div className="text-center">
        <p
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          className="text-sm font-semibold text-slate-700"
        >
          Your Gallery
        </p>
        <p
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          className="text-xs text-slate-400 mt-1"
        >
          Saved looks will appear here
        </p>
      </div>
    </div>
  );

  const SettingsScreen = () => (
    <div className="flex flex-col gap-3 pb-20">
      {["Skin Tone Calibration", "Blend Mode", "Camera Resolution", "Notifications", "Privacy", "About"].map((item) => (
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
          }}
        >
          <span
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="text-sm text-slate-700 font-medium"
          >
            {item}
          </span>
          <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
            <path d="M1 1l4 4-4 4" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,500;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8fafc; }
        .drop-btn:active { transform: scale(0.92); }
        .orig-btn:active { transform: scale(0.97); }
        @keyframes dropFall {
          0% { transform: translateY(-8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

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
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">
              Pigment Studio
            </p>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                color: "#1e293b",
                lineHeight: 1.2,
                marginTop: 2,
              }}
            >
              Lip<em>Lab</em>
            </p>
          </div>

          {activeColor && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                background: "#fff",
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: activeColor,
                  boxShadow: `0 0 6px ${activeColor}88`,
                  transition: "background 0.5s ease",
                }}
              />
              <span className="text-xs text-slate-500 font-medium">
                {selectedOriginal ? selectedOriginal.name : "Custom Mix"}
              </span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 80px" }}>
          {tab === "lab" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Shop Originals */}
              <section>
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-medium mb-3">
                  Shop Originals
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {ORIGINALS.map((orig) => {
                    const active = selectedOriginal?.id === orig.id;
                    return (
                      <button
                        key={orig.id}
                        className="orig-btn"
                        onClick={() => handleOriginal(orig)}
                        style={{
                          flex: 1,
                          padding: "10px 6px",
                          borderRadius: 14,
                          border: active
                            ? `2px solid ${orig.hex}`
                            : "1.5px solid #e2e8f0",
                          background: active ? `${orig.hex}12` : "#fff",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                          transition: "all 0.2s ease",
                          boxShadow: active
                            ? `0 4px 16px ${orig.glow}44`
                            : "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: orig.hex,
                            boxShadow: `0 3px 12px ${orig.glow}66`,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            color: active ? orig.hex : "#64748b",
                            lineHeight: 1.3,
                            textAlign: "center",
                          }}
                        >
                          {orig.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Camera */}
              <section>
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-medium mb-3">
                  Pro Camera Studio
                </p>
                <CameraPanel activeColor={activeColor} />
              </section>

              {/* Layered Pigment Lab */}
              <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-medium">
                    Layered Pigment Lab
                  </p>
                  <button
                    onClick={resetLab}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: "1px solid #e2e8f0",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: 10,
                      color: "#94a3b8",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <RotateCcw size={10} />
                    Reset
                  </button>
                </div>

                <div
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    border: "1.5px solid #f1f5f9",
                    padding: "16px 12px",
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-end",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Pigment dispensers */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {pigmentDrops.map((pigment) => (
                      <div
                        key={pigment.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          borderRadius: 12,
                          background: pigment.count > 0 ? `${pigment.hex}0d` : "#fafafa",
                          border: `1px solid ${pigment.count > 0 ? pigment.hex + "33" : "#f1f5f9"}`,
                          transition: "all 0.3s ease",
                        }}
                      >
                        {/* Color swatch */}
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: pigment.hex,
                            flexShrink: 0,
                            boxShadow: `0 2px 8px ${pigment.hex}55`,
                          }}
                        />

                        {/* Label + dots */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 500, color: "#334155" }}>
                            {pigment.label}
                          </p>
                          <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap" }}>
                            {Array.from({ length: pigment.count }).map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: pigment.hex,
                                  opacity: 0.75,
                                  animation: "dropFall 0.25s ease",
                                }}
                              />
                            ))}
                            {pigment.count === 0 && (
                              <span style={{ fontSize: 10, color: "#cbd5e1" }}>
                                no drops
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button
                            className="drop-btn"
                            onClick={() => adjustDrop(pigment.id, -1)}
                            disabled={pigment.count === 0}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              background: pigment.count > 0 ? "#fff" : "#f8fafc",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: pigment.count > 0 ? "pointer" : "not-allowed",
                              opacity: pigment.count > 0 ? 1 : 0.35,
                              transition: "all 0.15s ease",
                            }}
                          >
                            <Minus size={12} color="#64748b" />
                          </button>

                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: pigment.count > 0 ? pigment.hex : "#cbd5e1",
                              minWidth: 16,
                              textAlign: "center",
                              transition: "color 0.3s ease",
                            }}
                          >
                            {pigment.count}
                          </span>

                          <button
                            className="drop-btn"
                            onClick={() => adjustDrop(pigment.id, 1)}
                            disabled={totalDrops >= MAX_DROPS}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              background: totalDrops < MAX_DROPS ? pigment.hex : "#f8fafc",
                              border: `1px solid ${totalDrops < MAX_DROPS ? pigment.hex : "#e2e8f0"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: totalDrops < MAX_DROPS ? "pointer" : "not-allowed",
                              opacity: totalDrops < MAX_DROPS ? 1 : 0.35,
                              transition: "all 0.15s ease",
                              boxShadow: totalDrops < MAX_DROPS ? `0 2px 8px ${pigment.hex}44` : "none",
                            }}
                          >
                            <Plus size={12} color={totalDrops < MAX_DROPS ? "#fff" : "#94a3b8"} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mixing Tube */}
                  <MixingTube pigmentDrops={pigmentDrops} />
                </div>

                {/* Mix result swatch */}
                {mixedColor && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "#fff",
                      border: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: mixedColor,
                        boxShadow: `0 3px 12px ${mixedColor}55`,
                        transition: "background 0.4s ease",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Custom Blend
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {pigmentDrops
                          .filter((d) => d.count > 0)
                          .map((d) => `${d.count}× ${d.label}`)
                          .join(" · ")}
                      </p>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <Sparkles size={14} color="#f472b6" />
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {tab === "gallery" && <GalleryScreen />}
          {tab === "settings" && <SettingsScreen />}
        </div>

        {/* ── Bottom Nav ── */}
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 430,
            borderTop: "1px solid #f1f5f9",
            background: "rgba(248,250,252,0.96)",
            backdropFilter: "blur(16px)",
            display: "flex",
            padding: "10px 0 14px",
            zIndex: 20,
          }}
        >
          {[
            { id: "lab", label: "Lab", Icon: FlaskConical },
            { id: "gallery", label: "Gallery", Icon: ImageIcon },
            { id: "settings", label: "Settings", Icon: Settings },
          ].map(({ id, label, Icon }) => {
            const active = tab === id;
            const accent = "#e03050";
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 0",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: active ? `${accent}15` : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s ease",
                  }}
                >
                  <Icon size={18} color={active ? accent : "#94a3b8"} strokeWidth={active ? 2 : 1.5} />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 600 : 400,
                    color: active ? accent : "#94a3b8",
                    letterSpacing: "0.04em",
                    transition: "color 0.2s ease",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
