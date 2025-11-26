import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import dsv from "@rollup/plugin-dsv";

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
		dsv()
	],
});