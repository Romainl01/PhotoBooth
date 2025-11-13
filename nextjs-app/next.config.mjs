/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            // Prevent clickjacking attacks by disabling iframe embedding
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Prevent MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Control how much referrer information is shared
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Restrict access to browser features (camera, mic, geolocation)
            // camera=(self) allows same-origin camera access - required for photo capture
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
          {
            // Enable browser XSS protection (legacy, but doesn't hurt)
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
