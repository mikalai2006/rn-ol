import { viteSingleFile } from "vite-plugin-singlefile";

export default {
  build: {
    sourcemap: true,
  },
  plugins: [viteSingleFile()],
};
