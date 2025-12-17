// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import playformCompress from "@playform/compress";

export default defineConfig({
  output: "server",

  adapter: vercel({
    // WAJIB untuk SSR dynamic routes
    webAnalytics: false,
    speedInsights: false,
  }),

  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: false, // boleh true kalau mau
    },
  },

  integrations: [playformCompress()],
});
