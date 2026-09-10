import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

function svgTestPlugin() {
  return {
    name: "svg-test-loader",
    transform(_code: string, id: string) {
      if (id.endsWith(".svg")) {
        return {
          code: "import React from 'react'; export default React.forwardRef((props, ref) => React.createElement('svg', { ...props, ref }));",
          map: null,
        };
      }
    },
  };
}

export default defineConfig({
  plugins: [svgTestPlugin(), react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "server-only": "next/dist/compiled/server-only/empty.js",
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
