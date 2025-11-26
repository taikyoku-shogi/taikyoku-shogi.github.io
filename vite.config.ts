import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import dsv from "@rollup/plugin-dsv";
import pc from "picocolors";
import path from "node:path";
import * as fs from "node:fs";

export default defineConfig({
	plugins: [
		preact({
			prerender: {
				enabled: true,
				renderTarget: "#app",
				additionalPrerenderRoutes: ["/404"],
				previewMiddlewareEnabled: true,
				previewMiddlewareFallback: "/404",
			}
		}),
		dsv(),
		{
			name: "copy-404-for-github-pages",
			closeBundle() {
				const dist = path.resolve("dist");
				fs.copyFileSync(path.join(dist, "404", "index.html"), path.join(dist, "404.html"));
				console.log(pc.green("✓ Copied 404/index.html to 404.html for GitHub Pages"));
			}
		}
	],
});