import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import * as path from "path";

export default defineConfig({
	envDir: "./environments",
	plugins: [react()],
	resolve: {
		alias: {
			src: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
		},
	},
});
