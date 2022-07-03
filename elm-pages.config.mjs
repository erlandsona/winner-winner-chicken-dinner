import { defineConfig } from "vite";
// import elmPlugin from "vite-plugin-elm";
import adapter from "./adapter.netlify.mjs";
// import adapter from "./adapter.vercel.mjs";

const vite = defineConfig({
  // plugins: [ elmPlugin() ],
});

export default { adapter, vite };
