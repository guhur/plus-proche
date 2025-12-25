import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#e6f7ff" },
          100: { value: "#bae7ff" },
          200: { value: "#91d5ff" },
          300: { value: "#69c0ff" },
          400: { value: "#40a9ff" },
          500: { value: "#1890ff" },
          600: { value: "#096dd9" },
          700: { value: "#0050b3" },
          800: { value: "#003a8c" },
          900: { value: "#002766" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
