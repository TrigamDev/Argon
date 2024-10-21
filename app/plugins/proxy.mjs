import { createProxyMiddleware } from "http-proxy-middleware"

/** 
 * Usage:
 * ```js
 * proxyMiddleware("proxy/path", {
 *    target: "https://target.proxy.io",
 *    changeOrigin: true,
 * }),
 * ```
 *
 * @param {Parameters<createProxyMiddleware>[0]} context
 * @param {Parameters<createProxyMiddleware>[1]} options
 * 
 * @returns @type {import('astro').AstroIntegration}
 * @see https://www.npmjs.com/package/http-proxy-middleware
 */
export default (context, options) => {
	const apiProxy = createProxyMiddleware(context, options)

	/** @type {import('astro').AstroIntegration} */
	const integration = {
		name: 'proxy-middleware',
		hooks: {
			'astro:server:setup': ({ server }) => {
			server.middlewares.use(apiProxy)
			}
		}
	}

	return integration
}