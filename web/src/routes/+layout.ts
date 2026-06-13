// The app is a client-rendered SPA: auth and all data come from the cross-origin
// Rust API using the browser's session cookie, so server-side rendering would
// have no session to work with.
export const ssr = false;
export const prerender = false;
