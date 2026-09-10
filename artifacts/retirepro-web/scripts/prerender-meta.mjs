/**
 * SEO build entry point.
 *
 * The existing prerenderer builds a static HTML document for every public
 * route, including its title, description, canonical URL, and social tags.
 */
await import("./prerender.mjs");