import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Launchpad",
    short_name: "Launchpad",
    description: "個人開発プロダクトの進捗・ステータス・リリース履歴を横断的に管理するアプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
