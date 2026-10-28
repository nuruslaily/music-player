import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Music Player",
        short_name: "Music",
        description: "Music player with offline playback",
        theme_color: "#863bff",
        background_color: "#0f0f0f",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,webp,png,woff,woff2}"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /\.(?:mp3|aac|m4a|ogg|wav)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "audio",
              rangeRequests: true,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
