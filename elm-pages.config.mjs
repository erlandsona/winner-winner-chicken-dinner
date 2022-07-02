import { defineConfig } from "vite";

import adapter from "./adapter.netlify.mjs";
// import adapter from "./adapter.vercel.mjs";

export default {
  vite: defineConfig({}),
  adapter,
};
