Bun.serve({
  port: 8080,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/callback") {
      const code = url.searchParams.get('code');
      setTimeout(() => {
          process.send?.(code);
        }, 500
      );

      return new Response(null, {
        status: 301,
        headers: {
          'Location': 'https://krew-auth-service.vercel.app/auth/success'
        }
      });
    }
    return new Response(null, {
      status: 301,
      headers: {
        'Location': 'https://krew-auth-service.vercel.app/auth/failed'
      }
    });
  }
});
