import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yttm.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/share/', '/en', '/en/login', '/en/share/'],
        disallow: ['/dashboard', '/videos', '/collections', '/api/', '/en/dashboard', '/en/videos', '/en/collections'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
