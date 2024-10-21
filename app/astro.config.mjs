import { defineConfig } from 'astro/config'
import react from "@astrojs/react"
import vercel from "@astrojs/vercel/serverless"
import proxy from './plugins/proxy.mjs'

// https://astro.build/config
export default defineConfig({
	integrations: [react()],
	output: 'server',
	adapter: vercel(),
	prefetch: true
	// vite: {
	// 	server: {
	// 		proxy: {
	// 			'/api': {
	// 				target: 'https://argonapi.trigam.dev',
	// 				changeOrigin: true,
	// 				rewrite: path => path.replace(/^\/api/, '')
	// 			}
	// 		}
	// 	}
	// }
})