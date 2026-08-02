export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404) {
      return withSecurityHeaders(response);
    }

    const url = new URL(request.url);
    url.pathname = "/";
    const fallback = await env.ASSETS.fetch(new Request(url, request));
    return withSecurityHeaders(fallback);
  },
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
