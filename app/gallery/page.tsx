"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Play, Heart } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { SavedLook } from "../constants";

export default function GalleryPage() {
  const router = useRouter();
  const [items, setItems] = useState<SavedLook[]>([]);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (!error && data) {
        setItems(data as SavedLook[]);
      } else {
        console.error("Error fetching gallery:", error?.message);
      }
    };
    fetchGallery();
  }, []);

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (!error) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      console.error("Error deleting look:", error.message);
    }
  };

  const tryOn = (id: string) => {
    router.push(`/?load=${id}`);
  };

  return (
    <div
      className="main-container min-h-screen bg-[#f8fafc] flex flex-col w-full max-w-md md:max-w-4xl lg:max-w-6xl mx-auto relative font-['DM_Sans',sans-serif]"
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
        <p style={{ fontSize: 12, color: "#94a3b8" }}>{items.length} saved looks</p>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: "20px 20px 100px" }} className="no-scrollbar">
        {items.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: 20, background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9"
              }}
            >
              <Heart size={28} color="#cbd5e1" />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#475569" }}>No looks saved yet</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                Custom blends you save in the Lab will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Color Swatch */}
                <div 
                  style={{ 
                    width: "100%", 
                    aspectRatio: "1", 
                    background: item.hex,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                  }}
                >
                  <div style={{ 
                    width: "60%", height: "60%", borderRadius: "50%", 
                    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.2)"
                  }} />
                </div>

                {/* Info */}
                <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{item.name}</p>
                    <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                    <button
                      onClick={() => tryOn(item.id)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: 10,
                        background: "#1e293b",
                        color: "#fff",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      <Play size={12} fill="currentColor" />
                      Try On
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      style={{
                        padding: "8px",
                        borderRadius: 10,
                        background: "#fef2f2",
                        color: "#ef4444",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
