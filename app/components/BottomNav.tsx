"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, ImageIcon, Settings, BookOpen } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { id: "lab", label: "Lab", Icon: FlaskConical, href: "/" },
    { id: "recipes", label: "Recipes", Icon: BookOpen, href: "/recipes" },
    { id: "gallery", label: "Gallery", Icon: ImageIcon, href: "/gallery" },
    { id: "settings", label: "Settings", Icon: Settings, href: "/settings" },
  ];

  return (
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
      {navItems.map(({ id, label, Icon, href }) => {
        const active = pathname === href;
        const accent = "#e03050";
        return (
          <Link
            key={id}
            href={href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              textDecoration: "none",
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
          </Link>
        );
      })}
    </nav>
  );
}
